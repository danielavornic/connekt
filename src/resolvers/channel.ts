import { ChannelService } from "../services/channel";
import {
  ChannelsByUserInput,
  CreateChannelInput,
  UpdateChannelInput,
} from "../types/channel";
import { SearchPaginationInput } from "../types/common";
import { Context } from "../types/context";
import {
  checkResourceOwnership,
  requireAuth,
  requireCreator,
} from "../utils/auth";

export const channelResolvers = {
  Query: {
    channel: async (
      _: any,
      { channelId }: { channelId: string },
      context: Context
    ) => {
      requireAuth(context);
      const channelService = new ChannelService(context.driver);
      const channel = await channelService.findChannelById(channelId);

      if (!channel) throw new Error("Channel not found");

      return channel;
    },

    myChannels: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      const channelService = new ChannelService(context.driver);
      return channelService.findMyChannels(user.userId);
    },

    channelsByUserId: async (
      _: any,
      { input }: { input: ChannelsByUserInput },
      context: Context
    ) => {
      requireAuth(context);
      const channelService = new ChannelService(context.driver);
      return channelService.searchChannelsByUser(input);
    },

    searchChannels: async (
      _: any,
      { input }: { input: SearchPaginationInput },
      context: Context
    ) => {
      requireAuth(context);
      const channelService = new ChannelService(context.driver);
      return channelService.searchChannels(input);
    },
  },

  Mutation: {
    createChannel: async (
      _: any,
      { input }: { input: CreateChannelInput },
      context: Context
    ) => {
      const user = requireCreator(context);
      const channelService = new ChannelService(context.driver);
      return channelService.createChannel({
        ...input,
        createdBy: user.userId,
      });
    },

    updateChannel: async (
      _: any,
      { input }: { input: UpdateChannelInput },
      context: Context
    ) => {
      const user = requireAuth(context);
      const channelService = new ChannelService(context.driver);
      const channel = await channelService.findChannelById(input.channelId);

      if (!channel) throw new Error("Channel not found");
      checkResourceOwnership(channel, user.userId);

      const updatedChannel = await channelService.updateChannel(input);
      return updatedChannel;
    },

    deleteChannel: async (
      _: any,
      { channelId }: { channelId: string },
      context: Context
    ) => {
      const user = requireAuth(context);
      const channelService = new ChannelService(context.driver);
      const channel = await channelService.findChannelById(channelId);

      if (!channel) throw new Error("Channel not found");
      checkResourceOwnership(channel, user.userId);

      const success = await channelService.deleteChannel(channelId);
      if (!success) {
        throw new Error("Failed to delete channel");
      }

      return {
        success: true,
        message: "Channel successfully deleted",
      };
    },
  },
};
