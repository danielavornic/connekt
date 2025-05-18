import { Driver } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { channelQueries } from "../queries/channel";
import {
  Channel,
  CreateChannelInput,
  UpdateChannelInput,
} from "../types/channel";

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
        name: input.name,
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

  async findChannelsByUserId(userId: string): Promise<Channel[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(channelQueries.findChannelsByUserId, {
        userId,
      });

      return result.records.map((record) => record.get("channel")) || [];
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
        name: input.name ?? null,
        description: input.description ?? null,
        updatedAt: now,
      });

      return result.records[0].get("c").properties as Channel;
    } finally {
      await session.close();
    }
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    const session = this.driver.session();
    try {
      const result = await session.run(channelQueries.deleteChannel, {
        channelId,
      });

      return result.records[0]?.get("success") || false;
    } finally {
      await session.close();
    }
  }
}
