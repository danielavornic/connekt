import { Context } from "../types/context";
import { UserRole } from "../types/user";

export interface ResourceOwnership {
  createdBy: {
    id: string;
  };
}

export interface BlockConnectionInfo {
  blockCreatorId: string;
  channelCreatorId: string;
  connectionCount: number;
  hasTargetChannel: boolean;
}

export const requireAuth = (context: Context) => {
  if (!context.user) {
    throw new Error("Authentication required");
  }
  return context.user;
};

export const requireCreator = (context: Context) => {
  const user = requireAuth(context);
  if (user.role !== UserRole.CREATOR) {
    throw new Error("Creator role required");
  }
  return user;
};

export const checkResourceOwnership = (
  resource: ResourceOwnership,
  userId: string
) => {
  if (resource.createdBy.id !== userId) {
    throw new Error("Not authorized - you don't own this resource");
  }
  return true;
};

export const checkBlockDeletionPermissions = (
  connectionInfo: BlockConnectionInfo | null,
  userId: string
) => {
  if (!connectionInfo) {
    throw new Error("Block connection information not found");
  }

  if (!connectionInfo.hasTargetChannel) {
    throw new Error("Block is not connected to this channel");
  }

  const isBlockCreator = connectionInfo.blockCreatorId === userId;
  const isChannelCreator = connectionInfo.channelCreatorId === userId;

  if (!isBlockCreator && !isChannelCreator) {
    throw new Error(
      "Not authorized - you must be either the block or channel creator"
    );
  }

  return {
    isBlockCreator,
    isChannelCreator,
    shouldCompletelyDelete:
      isBlockCreator && connectionInfo.connectionCount === 1,
  };
};

export const checkBlockChannelPermissions = (
  block: ResourceOwnership,
  channel: ResourceOwnership,
  userId: string
) => {
  const isBlockCreator = block.createdBy.id === userId;
  const isChannelCreator = channel.createdBy.id === userId;

  if (!isBlockCreator && !isChannelCreator) {
    throw new Error(
      "Not authorized - you must be either the block or channel creator"
    );
  }

  return {
    isBlockCreator,
    isChannelCreator,
  };
};
