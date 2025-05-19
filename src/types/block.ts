import { gql } from "graphql-tag";
import { PaginatedResult } from "./common";
import { User } from "./user";

export interface CreateBlockInput {
  channelId: string;
  content: string;
  title?: string;
  description?: string;
}

export interface Block extends CreateBlockInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
}

export interface BlockConnection {
  blockId: string;
  channelId: string;
}

export interface UpdateBlockInput extends BlockConnection {
  title?: string;
  description?: string;
  content?: string;
}

export interface BlocksByChannelInput {
  channelId: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface BlocksByChannelResult
  extends PaginatedResult<Block, "blocks"> {}

export interface BlockSearchResult extends PaginatedResult<Block, "blocks"> {}

export const blockTypeDefs = gql`
  type BlockCreatorFull {
    id: ID!
    username: String!
    email: String!
    role: UserRole!
    createdAt: String!
    updatedAt: String!
  }

  type BlockCreatorLimited {
    id: ID!
    username: String!
    createdAt: String!
  }

  type Block {
    id: ID!
    title: String
    description: String
    content: String!
    channel: Channel!
    createdAt: String!
    updatedAt: String!
    createdBy: BlockCreatorLimited!
  }

  type MyBlock {
    id: ID!
    title: String
    description: String
    content: String!
    channel: Channel!
    createdAt: String!
    updatedAt: String!
    createdBy: BlockCreatorFull!
  }

  input CreateBlockInput {
    title: String
    description: String
    content: String!
    channelId: String!
  }

  input UpdateBlockInput {
    blockId: String!
    title: String
    description: String
    content: String
  }

  input BlockConnection {
    blockId: String!
    channelId: String!
  }

  type DeleteBlockResponse {
    success: Boolean!
    message: String!
  }

  type ConnectedChannel {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    createdBy: BlockCreatorLimited!
  }

  input BlocksByChannelInput {
    channelId: ID!
    query: String
    limit: Int = 10
    offset: Int = 0
  }

  type BlocksByChannelResult {
    blocks: [Block!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  input BlockSearchInput {
    query: String
    limit: Int = 10
    offset: Int = 0
  }

  type BlockSearchResult {
    blocks: [Block!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    block(id: ID!): Block
    blocksByChannelId(input: BlocksByChannelInput!): BlocksByChannelResult!
    connectedChannels(blockId: ID!): [ConnectedChannel!]!
    searchBlocks(input: BlockSearchInput!): BlockSearchResult!
  }

  extend type Mutation {
    createBlock(input: CreateBlockInput!): MyBlock!
    updateBlock(input: UpdateBlockInput!): MyBlock!
    deleteBlock(input: BlockConnection!): DeleteBlockResponse!
    connectBlockToChannel(input: BlockConnection!): MyBlock!
  }
`;
