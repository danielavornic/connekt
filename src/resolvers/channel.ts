import { ChannelService } from "../services/channel";
import { CreateChannelInput } from "../types/channel";
import { Context } from "../types/context";
import { UserRole } from "../types/user";

export const channelResolvers = {
  Mutation: {
    createChannel: async (
      _: any,
      { input }: { input: CreateChannelInput },
      { driver, user }: Context
    ) => {
      if (!user) throw new Error("Not authenticated");

      if (user.role !== UserRole.CREATOR) {
        throw new Error("User is not a creator");
      }

      const channelService = new ChannelService(driver);
      return channelService.createChannel({
        ...input,
        createdBy: user.userId,
      });
    },
  },

  Query: {
    findMyChannels: async (_: any, __: any, { driver, user }: Context) => {
      if (!user) throw new Error("Not authenticated");

      const channelService = new ChannelService(driver);
      return channelService.findMyChannels(user.userId);
    },

    findChannelById: async (
      _: any,
      { input }: { input: { channelId: string } },
      { driver }: Context
    ) => {
      const channelService = new ChannelService(driver);
      const channel = await channelService.findChannelById(input.channelId);

      if (!channel) throw new Error("Channel not found");

      return channel;
    },

    findChannelsByUserId: async (
      _: any,
      { input }: { input: { userId: string } },
      { driver }: Context
    ) => {
      const channelService = new ChannelService(driver);
      return channelService.findChannelsByUserId(input.userId);
    },
  },
};
