import { gql } from "graphql-tag";
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

export interface DeleteBlockInput {
  blockId: string;
}

export interface UpdateBlockInput extends DeleteBlockInput {
  title?: string;
  description?: string;
  content?: string;
}

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

  input DeleteBlockInput {
    blockId: String!
  }

  type DeleteBlockResponse {
    success: Boolean!
    message: String!
  }

  extend type Query {
    block(id: ID!): Block
    blocksByChannelId(channelId: ID!): [Block!]!
  }

  extend type Mutation {
    createBlock(input: CreateBlockInput!): MyBlock!
    updateBlock(input: UpdateBlockInput!): MyBlock!
    deleteBlock(input: DeleteBlockInput!): DeleteBlockResponse!
  }
`;
