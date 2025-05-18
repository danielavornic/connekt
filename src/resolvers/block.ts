import { BlockService } from "../services/block";
import {
  CreateBlockInput,
  DeleteBlockInput,
  UpdateBlockInput,
} from "../types/block";
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

    updateBlock: async (
      _: any,
      { input }: { input: UpdateBlockInput },
      { driver, user }: Context
    ) => {
      if (!user) throw new Error("Not authenticated");

      const blockService = new BlockService(driver);
      const block = await blockService.findBlockById(input.blockId);

      if (!block) throw new Error("Block not found");

      if (block.createdBy.id !== user.userId) {
        throw new Error("User is not the creator of the block");
      }

      return blockService.updateBlock(input);
    },

    deleteBlock: async (
      _: any,
      { input }: { input: DeleteBlockInput },
      { driver, user }: Context
    ) => {
      if (!user) throw new Error("Not authenticated");

      const blockService = new BlockService(driver);
      const block = await blockService.findBlockById(input.blockId);

      if (!block) throw new Error("Block not found");

      if (block.createdBy.id !== user.userId) {
        throw new Error("User is not the creator of the block");
      }

      const success = await blockService.deleteBlock(input.blockId);

      if (!success) {
        throw new Error("Failed to delete block");
      }

      return {
        success: true,
        message: "Block successfully deleted",
      };
    },
  },
};
