import { Driver, int, Integer } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { blockQueries } from "../queries/block";
import {
  Block,
  BlockConnection,
  BlocksByChannelInput,
  BlocksByChannelResult,
  BlockSearchResult,
  CreateBlockInput,
  UpdateBlockInput,
} from "../types/block";
import { SearchPaginationInput } from "../types/common";
import { UrlService } from "./url";

interface CreateBlockData extends CreateBlockInput {
  createdBy: string;
}

export class BlockService {
  private driver: Driver;

  constructor(driver: Driver) {
    this.driver = driver;
  }

  async createBlock(data: CreateBlockData): Promise<Block> {
    const session = this.driver.session();

    try {
      const now = new Date().toISOString();
      const blockId = uuidv4();

      let title = data.title;
      let description = data.description;

      if (UrlService.isValidUrl(data.content)) {
        const metadata = await UrlService.extractMetadata(data.content);
        title = data.title || metadata.title;
        description = data.description || metadata.description;
      }

      const result = await session.executeWrite((tx) =>
        tx.run(blockQueries.createBlock, {
          blockId,
          channelId: data.channelId,
          title: title ?? null,
          description: description ?? null,
          content: data.content,
          createdBy: data.createdBy,
          now,
        })
      );

      const block = result.records[0]?.get("block");
      if (!block) throw new Error("Failed to create block");

      return block;
    } finally {
      await session.close();
    }
  }

  async findBlockById(blockId: string): Promise<Block | null> {
    const session = this.driver.session();

    try {
      const result = await session.executeRead((tx) =>
        tx.run(blockQueries.findBlockById, { blockId })
      );

      const block = result.records[0]?.get("block");
      return block || null;
    } finally {
      await session.close();
    }
  }

  async findBlocksByChannelId(
    input: BlocksByChannelInput
  ): Promise<BlocksByChannelResult> {
    const session = this.driver.session();

    try {
      const result = await session.executeRead((tx) =>
        tx.run(blockQueries.findBlocksByChannelId, {
          channelId: input.channelId,
          query: input.query ? `(?i).*${input.query}.*` : null,
          limit: int(input.limit ?? 10),
          offset: int(input.offset ?? 0),
        })
      );

      const blocks = result.records.map((record) => record.get("block"));
      const totalCount = result.records[0]?.get("totalCount")?.toNumber() || 0;
      const hasMore = blocks.length + (input.offset ?? 0) < totalCount;

      return {
        blocks,
        totalCount,
        hasMore,
      };
    } finally {
      await session.close();
    }
  }

  async searchBlocks(input: SearchPaginationInput): Promise<BlockSearchResult> {
    const session = this.driver.session();
    try {
      const result = await session.executeRead((tx) =>
        tx.run(blockQueries.searchBlocks, {
          query: `(?i).*${input.query}.*`,
          limit: int(input.limit ?? 10),
          offset: int(input.offset ?? 0),
        })
      );

      const blocks = result.records.map((record) => record.get("block"));
      const totalCount = result.records[0]?.get("totalCount")?.toNumber() || 0;
      const hasMore = blocks.length + (input.offset ?? 0) < totalCount;

      return {
        blocks,
        totalCount,
        hasMore,
      };
    } finally {
      await session.close();
    }
  }

  async updateBlock(input: UpdateBlockInput): Promise<Block> {
    const session = this.driver.session();

    try {
      const updatedAt = new Date().toISOString();

      let title = input.title;
      let description = input.description;

      if (input.content && UrlService.isValidUrl(input.content)) {
        const metadata = await UrlService.extractMetadata(input.content);
        title = input.title || metadata.title;
        description = input.description || metadata.description;
      }

      const result = await session.executeWrite((tx) =>
        tx.run(blockQueries.updateBlock, {
          blockId: input.blockId,
          title: title ?? null,
          description: description ?? null,
          content: input.content ?? null,
          updatedAt,
        })
      );

      const block = result.records[0]?.get("block");
      if (!block) throw new Error("Failed to update block");

      return block;
    } finally {
      await session.close();
    }
  }

  async getBlockConnectionInfo(
    blockId: string,
    channelId: string
  ): Promise<{
    blockCreatorId: string;
    channelCreatorId: string;
    connectionCount: number;
    hasTargetChannel: boolean;
    channels: string[];
  } | null> {
    const session = this.driver.session();
    try {
      const result = await session.executeRead((tx) =>
        tx.run(blockQueries.getBlockConnectionInfo, { blockId, channelId })
      );
      const info = result.records[0]?.get("info");
      if (!info) return null;

      return {
        ...info,
        connectionCount: (info.connectionCount as Integer).toNumber(),
      };
    } finally {
      await session.close();
    }
  }

  async removeBlockConnection(
    blockId: string,
    channelId: string
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const result = await session.executeWrite((tx) =>
        tx.run(blockQueries.removeBlockConnection, { blockId, channelId })
      );
      return result.records[0]?.get("success") ?? false;
    } finally {
      await session.close();
    }
  }

  async deleteBlockCompletely(blockId: string): Promise<boolean> {
    const session = this.driver.session();
    try {
      const result = await session.executeWrite((tx) =>
        tx.run(blockQueries.deleteBlockCompletely, { blockId })
      );
      return result.records[0]?.get("success") ?? false;
    } finally {
      await session.close();
    }
  }

  async connectBlockToChannel(
    blockId: string,
    channelId: string
  ): Promise<Block> {
    const session = this.driver.session();

    try {
      const result = await session.executeWrite((tx) =>
        tx.run(blockQueries.connectBlockToChannel, {
          blockId,
          channelId,
        })
      );

      const block = result.records[0]?.get("block");
      if (!block) throw new Error("Failed to connect block to channel");

      return block;
    } finally {
      await session.close();
    }
  }

  async findConnectedChannels(blockId: string): Promise<BlockConnection[]> {
    const session = this.driver.session();

    try {
      const result = await session.executeRead((tx) =>
        tx.run(blockQueries.findBlockConnections, { blockId })
      );

      return result.records.map((record) => record.get("connection"));
    } finally {
      await session.close();
    }
  }
}
