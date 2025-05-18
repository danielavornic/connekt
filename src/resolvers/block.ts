import { BlockService } from "../services/block";
import { CreateBlockInput } from "../types/block";
import { Context } from "../types/context";
import { UserRole } from "../types/user";

export const blockResolvers = {
  Query: {
    block: async (_: any, { id }: { id: string }, { driver }: Context) => {
      const blockService = new BlockService(driver);
      const block = await blockService.findBlockById(id);

      if (!block) throw new Error("Block not found");

      return block;
    },

    blocksByChannelId: async (
      _: any,
      { channelId }: { channelId: string },
      { driver }: Context
    ) => {
      const blockService = new BlockService(driver);
      return blockService.findBlocksByChannelId(channelId);
    },
  },

  Mutation: {
    createBlock: async (
      _: any,
      { input }: { input: CreateBlockInput },
      { driver, user }: Context
    ) => {
      if (!user) throw new Error("Not authenticated");

      if (user.role !== UserRole.CREATOR) {
        throw new Error("User is not a creator");
      }

      const blockService = new BlockService(driver);
      return blockService.createBlock({
        ...input,
        createdBy: user.userId,
      });
    },
  },
};
