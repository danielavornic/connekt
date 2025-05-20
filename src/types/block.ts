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

export interface PaginatedBlocksResult
  extends PaginatedResult<Block, "blocks"> {}

export interface BlockSearchResult extends PaginatedResult<Block, "blocks"> {}

export const blockTypeDefs = gql`
  """
  Block creator (user) information including private details
  """
  type BlockCreatorFull {
    "Unique identifier for the creator"
    id: ID!
    "Username of the creator"
    username: String!
    "Email address of the creator"
    email: String!
    "Role in the system (CREATOR)"
    role: UserRole!
    "Timestamp when the creator account was created"
    createdAt: String!
    "Timestamp when the creator account was last updated"
    updatedAt: String!
  }

  """
  Limited block creator information for public viewing
  Email is hidden
  """
  type BlockCreatorLimited {
    "Unique identifier for the creator"
    id: ID!
    "Username of the creator"
    username: String!
    "Timestamp when the creator account was created"
    createdAt: String!
  }

  """
  Public block information
  """
  type Block {
    "Unique identifier for the block"
    id: ID!
    "Optional title of the block"
    title: String
    "Optional description of the block"
    description: String
    "Main content of the block (text, URL)"
    content: String!
    "Channel this block belongs to"
    channel: Channel!
    "Timestamp when the block was created"
    createdAt: String!
    "Timestamp when the block was last updated"
    updatedAt: String!
    "Creator of the block with limited information"
    createdBy: BlockCreatorLimited!
  }

  """
  Private block information with full creator details
  """
  type MyBlock {
    "Unique identifier for the block"
    id: ID!
    "Optional title of the block"
    title: String
    "Optional description of the block"
    description: String
    "Main content of the block"
    content: String!
    "Channel this block belongs to"
    channel: Channel!
    "Timestamp when the block was created"
    createdAt: String!
    "Timestamp when the block was last updated"
    updatedAt: String!
    "Creator of the block with full information"
    createdBy: BlockCreatorFull!
  }

  """
  Input for creating a new block
  """
  input CreateBlockInput {
    "Optional title for the block"
    title: String
    "Optional description for the block"
    description: String
    "Main content of the block (text, URL)"
    content: String!
    "ID of the channel to create the block in"
    channelId: String!
  }

  """
  Input for updating an existing block
  Supports partial updates
  """
  input UpdateBlockInput {
    "ID of the block to update"
    blockId: String!
    "New title for the block"
    title: String
    "New description for the block"
    description: String
    "New content for the block"
    content: String
  }

  """
  Input for connecting a block to a channel
  """
  input BlockConnection {
    "ID of the block to connect"
    blockId: String!
    "ID of the channel to connect to"
    channelId: String!
  }

  """
  Response for block deletion
  """
  type DeleteBlockResponse {
    "Whether the deletion was successful"
    success: Boolean!
    "Message describing the result"
    message: String!
  }

  """
  Channel information for block connections
  """
  type ConnectedChannel {
    "Unique identifier for the channel"
    id: ID!
    "Name of the channel"
    name: String!
    "Optional description of the channel"
    description: String
    "When the channel was created"
    createdAt: String!
    "Creator of the channel"
    createdBy: BlockCreatorLimited!
  }

  """
  Input for fetching blocks in a channel
  """
  input BlocksByChannelInput {
    "ID of the channel to fetch blocks from"
    channelId: ID!
    "Optional search query"
    query: String
    "Maximum number of blocks to return"
    limit: Int = 10
    "Number of blocks to skip"
    offset: Int = 0
  }

  """
  Input for searching blocks
  """
  input BlockSearchInput {
    "Search query string"
    query: String
    "Maximum number of results"
    limit: Int = 10
    "Number of results to skip"
    offset: Int = 0
  }

  """
  Results of a block search
  """
  type BlockSearchResult {
    "List of matching blocks"
    blocks: [Block!]!
    "Total number of matching blocks"
    totalCount: Int!
    "Whether there are more results"
    hasMore: Boolean!
  }

  extend type Query {
    "Get a specific block by ID"
    block(blockId: ID!): Block
    "Get blocks in a specific channel"
    blocksByChannelId(input: BlocksByChannelInput!): BlockSearchResult!
    "Get channels connected to a block"
    connectedChannels(blockId: ID!): [ConnectedChannel!]!
    "Search for blocks"
    searchBlocks(input: BlockSearchInput!): BlockSearchResult!
  }

  extend type Mutation {
    "Create a new block"
    createBlock(input: CreateBlockInput!): MyBlock!
    "Update an existing block"
    updateBlock(input: UpdateBlockInput!): MyBlock!
    "Delete a block"
    deleteBlock(input: BlockConnection!): DeleteBlockResponse!
    "Connect a block to a channel"
    connectBlockToChannel(input: BlockConnection!): MyBlock!
  }
`;
