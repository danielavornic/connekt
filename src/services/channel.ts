import { Driver } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { channelQueries } from "../queries/channel";
import { Channel, CreateChannelInput } from "../types/channel";

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
        description: input.description,
        createdBy: input.createdBy,
        now,
      });

      return result.records[0].get("c").properties as Channel;
    } finally {
      await session.close();
    }
  }
}
