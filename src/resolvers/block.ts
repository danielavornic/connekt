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
      { input }: { input: BlocksByChannelInput },
      { driver }: Context
    ) => {
      const blockService = new BlockService(driver);
      return blockService.searchBlocksByChannel(input);
    },

    searchBlocks: async (
      _: any,
      { input }: { input: SearchPaginationInput },
      { driver }: Context
    ) => {
      const blockService = new BlockService(driver);
      return blockService.searchBlocks(input);
    },

    connectedChannels: async (
      _: any,
      { blockId }: { blockId: string },
      { driver }: Context
    ) => {
      const blockService = new BlockService(driver);
      return blockService.findConnectedChannels(blockId);
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

      const channelService = new ChannelService(driver);
      const channel = await channelService.findChannelById(input.channelId);
      if (!channel) throw new Error("Channel not found");
      if (channel.createdBy.id !== user.userId) {
        throw new Error("User is not the creator of the channel");
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
      { input }: { input: BlockConnection },
      { driver, user }: Context
    ) => {
      if (!user) throw new Error("Not authenticated");

      const blockService = new BlockService(driver);

      const connectionInfo = await blockService.getBlockConnectionInfo(
        input.blockId,
        input.channelId
      );

      if (!connectionInfo) throw new Error("Block not found");
      if (!connectionInfo.hasTargetChannel)
        throw new Error("Block is not connected to this channel");

      const isBlockCreator = connectionInfo.blockCreatorId === user.userId;
      const isChannelCreator = connectionInfo.channelCreatorId === user.userId;

      if (!isBlockCreator && !isChannelCreator) {
        throw new Error("Not authorized to remove this block");
      }

      // block creator deleting their block that's only in one channel
      if (isBlockCreator && connectionInfo.connectionCount === 1) {
        const success = await blockService.deleteBlockCompletely(input.blockId);
        if (!success) throw new Error("Failed to delete block");
        return {
          success: true,
          message: "Block completely deleted",
        };
      }

      // 1. block creator removing from one of many channels
      // 2. channel owner removing someone else's block
      // 3. block creator removing from someone else's channel
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
      { driver, user }: Context
    ) => {
      if (!user) throw new Error("Not authenticated");

      if (user.role !== UserRole.CREATOR) {
        throw new Error("User is not a creator");
      }

      const blockService = new BlockService(driver);
      const channelService = new ChannelService(driver);

      const block = await blockService.findBlockById(input.blockId);
      if (!block) throw new Error("Block not found");

      const channel = await channelService.findChannelById(input.channelId);
      if (!channel) throw new Error("Channel not found");

      if (
        block.createdBy.id !== user.userId &&
        channel.createdBy.id !== user.userId
      ) {
        throw new Error(
          "User must be the creator of either the block or the channel"
        );
      }

      return blockService.connectBlockToChannel(input.blockId, input.channelId);
    },
  },
};
