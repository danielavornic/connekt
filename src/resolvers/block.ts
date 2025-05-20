import { BlockService } from "../services/block";
import { ChannelService } from "../services/channel";
import {
  BlockConnection,
  BlocksByChannelInput,
  CreateBlockInput,
  UpdateBlockInput,
} from "../types/block";
import { SearchPaginationInput } from "../types/common";
import { Context } from "../types/context";
import {
  checkBlockChannelPermissions,
  checkBlockDeletionPermissions,
  checkResourceOwnership,
  requireAuth,
  requireCreator,
} from "../utils/auth";

export const blockResolvers = {
  Query: {
    block: async (
      _: any,
      { blockId }: { blockId: string },
      context: Context
    ) => {
      requireAuth(context);
      const blockService = new BlockService(context.driver);
      const block = await blockService.findBlockById(blockId);

      if (!block) throw new Error("Block not found");

      return block;
    },

    blocksByChannelId: async (
      _: any,
      { input }: { input: BlocksByChannelInput },
      context: Context
    ) => {
      requireAuth(context);
      const blockService = new BlockService(context.driver);
      return blockService.searchBlocksByChannel(input);
    },

    searchBlocks: async (
      _: any,
      { input }: { input: SearchPaginationInput },
      context: Context
    ) => {
      requireAuth(context);
      const blockService = new BlockService(context.driver);
      return blockService.searchBlocks(input);
    },

    connectedChannels: async (
      _: any,
      { blockId }: { blockId: string },
      context: Context
    ) => {
      requireAuth(context);
      const blockService = new BlockService(context.driver);
      return blockService.findConnectedChannels(blockId);
    },
  },

  Mutation: {
    createBlock: async (
      _: any,
      { input }: { input: CreateBlockInput },
      context: Context
    ) => {
      const user = requireCreator(context);
      const channelService = new ChannelService(context.driver);
      const channel = await channelService.findChannelById(input.channelId);

      if (!channel) throw new Error("Channel not found");
      checkResourceOwnership(channel, user.userId);

      const blockService = new BlockService(context.driver);
      return blockService.createBlock({
        ...input,
        createdBy: user.userId,
      });
    },

    updateBlock: async (
      _: any,
      { input }: { input: UpdateBlockInput },
      context: Context
    ) => {
      const user = requireAuth(context);
      const blockService = new BlockService(context.driver);
      const block = await blockService.findBlockById(input.blockId);

      if (!block) throw new Error("Block not found");
      checkResourceOwnership(block, user.userId);

      return blockService.updateBlock(input);
    },

    deleteBlock: async (
      _: any,
      { input }: { input: BlockConnection },
      context: Context
    ) => {
      const user = requireAuth(context);
      const blockService = new BlockService(context.driver);

      const connectionInfo = await blockService.getBlockConnectionInfo(
        input.blockId,
        input.channelId
      );

      const { isBlockCreator, shouldCompletelyDelete } =
        checkBlockDeletionPermissions(connectionInfo, user.userId);

      if (shouldCompletelyDelete) {
        const success = await blockService.deleteBlockCompletely(input.blockId);
        if (!success) throw new Error("Failed to delete block");
        return {
          success: true,
          message: "Block completely deleted",
        };
      }

      const success = await blockService.removeBlockConnection(
        input.blockId,
        input.channelId
      );
      if (!success) throw new Error("Failed to remove block from channel");

      return {
        success: true,
        message: isBlockCreator
          ? "Block removed from channel but still exists in other channels"
          : "Block removed from your channel",
      };
    },

    connectBlockToChannel: async (
      _: any,
      { input }: { input: BlockConnection },
      context: Context
    ) => {
      const user = requireCreator(context);
      const blockService = new BlockService(context.driver);
      const channelService = new ChannelService(context.driver);

      const block = await blockService.findBlockById(input.blockId);
      if (!block) throw new Error("Block not found");

      const channel = await channelService.findChannelById(input.channelId);
      if (!channel) throw new Error("Channel not found");

      checkBlockChannelPermissions(block, channel, user.userId);

      return blockService.connectBlockToChannel(input.blockId, input.channelId);
    },
  },
};
