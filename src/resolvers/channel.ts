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
};
