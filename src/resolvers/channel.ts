import { ChannelService } from "../services/channel";
import {
  ChannelsByUserInput,
  CreateChannelInput,
  DeleteChannelInput,
  UpdateChannelInput,
} from "../types/channel";
import { Context } from "../types/context";
import { UserRole } from "../types/user";

export const channelResolvers = {
  Query: {
    channel: async (
      _: any,
      { input }: { input: { channelId: string } },
      { driver }: Context
    ) => {
      const channelService = new ChannelService(driver);
      const channel = await channelService.findChannelById(input.channelId);

      if (!channel) throw new Error("Channel not found");

      return channel;
    },

    myChannels: async (_: any, __: any, { driver, user }: Context) => {
      if (!user) throw new Error("Not authenticated");

      const channelService = new ChannelService(driver);
      return channelService.findMyChannels(user.userId);
    },

    channelsByUserId: async (
      _: any,
      { input }: { input: ChannelsByUserInput },
      { driver }: Context
    ) => {
      const channelService = new ChannelService(driver);
      return channelService.findChannelsByUserId(input);
    },
  },

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

    updateChannel: async (
      _: any,
      { input }: { input: UpdateChannelInput },
      { driver, user }: Context
    ) => {
      if (!user) throw new Error("Not authenticated");

      const channelService = new ChannelService(driver);
      const channel = await channelService.findChannelById(input.channelId);
      if (!channel) throw new Error("Channel not found");

      if (channel.createdBy.id !== user.userId) {
        throw new Error("User is not the creator of the channel");
      }

      const updatedChannel = await channelService.updateChannel(input);
      return updatedChannel;
    },

    deleteChannel: async (
      _: any,
      { input }: { input: DeleteChannelInput },
      { driver, user }: Context
    ) => {
      if (!user) throw new Error("Not authenticated");

      const channelService = new ChannelService(driver);

      const channel = await channelService.findChannelById(input.channelId);
      if (!channel) throw new Error("Channel not found");

      if (channel.createdBy.id !== user.userId) {
        throw new Error("User is not the creator of the channel");
      }

      const success = await channelService.deleteChannel(input.channelId);
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
