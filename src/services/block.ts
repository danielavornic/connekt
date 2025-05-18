import { Driver } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { blockQueries } from "../queries/block";
import {
  Block,
  BlockConnection,
  CreateBlockInput,
  UpdateBlockInput,
} from "../types/block";

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

      const result = await session.executeWrite((tx) =>
        tx.run(blockQueries.createBlock, {
          blockId,
          channelId: data.channelId,
          title: data.title ?? null,
          description: data.description ?? null,
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

  async findBlocksByChannelId(channelId: string): Promise<Block[]> {
    const session = this.driver.session();

    try {
      const result = await session.executeRead((tx) =>
        tx.run(blockQueries.findBlocksByChannelId, { channelId })
      );

      return result.records.map((record) => record.get("block"));
    } finally {
      await session.close();
    }
  }

  async updateBlock(input: UpdateBlockInput): Promise<Block> {
    const session = this.driver.session();

    try {
      const updatedAt = new Date().toISOString();
      const result = await session.executeWrite((tx) =>
        tx.run(blockQueries.updateBlock, {
          blockId: input.blockId,
          title: input.title ?? null,
          description: input.description ?? null,
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

  async deleteBlock(blockId: string): Promise<boolean> {
    const session = this.driver.session();

    try {
      const result = await session.executeWrite((tx) =>
        tx.run(blockQueries.deleteBlock, { blockId })
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

  async findBlockConnections(blockId: string): Promise<BlockConnection[]> {
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
