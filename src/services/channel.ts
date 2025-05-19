import { Driver, Integer } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { channelQueries } from "../queries/channel";
import {
  Channel,
  ChannelsByUserInput,
  CreateChannelInput,
  PaginatedChannelsResult,
  UpdateChannelInput,
} from "../types/channel";
import { SearchPaginationInput } from "../types/common";
import { executePaginatedQuery } from "./pagination";

interface CreateChannelData extends CreateChannelInput {
  createdBy: string;
}

export class ChannelService {
  constructor(private readonly driver: Driver) {}

  async createChannel(input: CreateChannelData): Promise<Channel> {
    const session = this.driver.session();
    try {
      const channelId = uuidv4();
      const now = new Date().toISOString();

      const result = await session.run(channelQueries.createChannel, {
        channelId,
        title: input.title,
        description: input.description ?? null,
        createdBy: input.createdBy,
        now,
      });

      return result.records[0].get("c").properties as Channel;
    } finally {
      await session.close();
    }
  }

  async findChannelById(channelId: string): Promise<Channel | null> {
    const session = this.driver.session();
    try {
      const result = await session.run(channelQueries.findChannelById, {
        channelId,
      });

      const record = result.records[0];
      return record ? record.get("channel") : null;
    } finally {
      await session.close();
    }
  }

  async findMyChannels(userId: string): Promise<Channel[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(channelQueries.findMyChannels, {
        userId,
      });

      return result.records.map((record) => record.get("channel")) || [];
    } finally {
      await session.close();
    }
  }

  async findChannelsByUserId(
    input: ChannelsByUserInput
  ): Promise<PaginatedChannelsResult> {
    const session = this.driver.session();
    try {
      const result = await executePaginatedQuery<Channel>(
        session,
        channelQueries.searchChannels,
        {
          userId: input.userId,
          query: input.query,
          limit: input.limit,
          offset: input.offset,
        }
      );

      return {
        channels: result.items,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
      };
    } finally {
      await session.close();
    }
  }

  async searchChannels(
    input: SearchPaginationInput
  ): Promise<PaginatedChannelsResult> {
    const session = this.driver.session();
    try {
      const result = await executePaginatedQuery<Channel>(
        session,
        channelQueries.searchChannels,
        {
          userId: null,
          query: input.query,
          limit: input.limit,
          offset: input.offset,
        }
      );

      return {
        channels: result.items,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
      };
    } finally {
      await session.close();
    }
  }

  async updateChannel(input: UpdateChannelInput): Promise<Channel> {
    const session = this.driver.session();
    const now = new Date().toISOString();
    try {
      const result = await session.run(channelQueries.updateChannel, {
        channelId: input.channelId,
        title: input.title ?? null,
        description: input.description ?? null,
        updatedAt: now,
      });

      return result.records[0].get("c").properties as Channel;
    } finally {
      await session.close();
    }
  }

  async getChannelBlocksInfo(channelId: string): Promise<{
    channelId: string;
    channelCreatorId: string;
    blocks: Array<{
      blockId: string;
      blockCreatorId: string;
      connectionCount: number;
    }>;
  } | null> {
    const session = this.driver.session();
    try {
      const result = await session.executeRead((tx) =>
        tx.run(channelQueries.getChannelBlocksInfo, { channelId })
      );
      const info = result.records[0]?.get("info");
      if (!info) return null;

      return {
        ...info,
        blocks: info.blocks.map((block: { connectionCount: Integer }) => ({
          ...block,
          connectionCount: (block.connectionCount as Integer).toNumber(),
        })),
      };
    } finally {
      await session.close();
    }
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    const session = this.driver.session();
    try {
      await session.executeWrite((tx) =>
        tx.run(channelQueries.deleteChannelBlocks, { channelId })
      );

      const result = await session.executeWrite((tx) =>
        tx.run(channelQueries.deleteChannel, { channelId })
      );

      return result.records[0]?.get("success") ?? false;
    } finally {
      await session.close();
    }
  }
}
