import { gql } from "graphql-tag";
import { PaginatedResult, SearchPaginationInput } from "./common";
import { User } from "./user";

export interface CreateChannelInput {
  title: string;
  description?: string | null;
}

export interface Channel extends CreateChannelInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
}

export interface DeleteChannelInput {
  channelId: string;
}

export interface UpdateChannelInput extends DeleteChannelInput {
  title?: string;
  description?: string;
}

export interface ChannelsByUserInput {
  userId: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface ChannelsByUserResult
  extends PaginatedResult<Channel, "channels"> {}

export interface ChannelSearchInput extends SearchPaginationInput {}

export interface ChannelSearchResult
  extends PaginatedResult<Channel, "channels"> {}

export const channelTypesDefs = gql`
  # for authenticated user's own data
  type ChannelCreatorFull {
    id: ID!
    username: String!
    email: String!
    role: UserRole!
    createdAt: String!
    updatedAt: String!
  }

  # for public viewing, hide email
  type ChannelCreatorLimited {
    id: ID!
    username: String!
    createdAt: String!
  }

  type Channel {
    id: ID!
    title: String!
    description: String
    createdAt: String!
    updatedAt: String!
    createdBy: ChannelCreatorLimited!
  }

  type MyChannel {
    id: ID!
    title: String!
    description: String
    createdAt: String!
    updatedAt: String!
    createdBy: ChannelCreatorFull!
  }

  type PublicChannel {
    id: ID!
    title: String!
    description: String
    createdAt: String!
    updatedAt: String!
    createdBy: ChannelCreatorLimited!
  }

  input CreateChannelInput {
    title: String!
    description: String
  }

  input FindChannelByIdInput {
    channelId: String!
  }

  input FindChannelsByUserIdInput {
    userId: String!
  }

  input UpdateChannelInput {
    channelId: String!
    title: String
    description: String
  }

  input DeleteChannelInput {
    channelId: String!
  }

  input ChannelsByUserInput {
    userId: ID!
    query: String
    limit: Int = 10
    offset: Int = 0
  }

  type ChannelsByUserResult {
    channels: [Channel!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  input ChannelSearchInput {
    query: String
    limit: Int = 10
    offset: Int = 0
  }

  type ChannelSearchResult {
    channels: [Channel!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type Query {
    myChannels: [MyChannel!]!
    channel(input: FindChannelByIdInput!): PublicChannel
    channelsByUserId(input: ChannelsByUserInput!): ChannelsByUserResult!
    searchChannels(input: ChannelSearchInput!): ChannelSearchResult!
  }

  type DeleteChannelResponse {
    success: Boolean!
    message: String!
  }

  type Mutation {
    createChannel(input: CreateChannelInput!): Channel
    updateChannel(input: UpdateChannelInput!): Channel
    deleteChannel(input: DeleteChannelInput!): DeleteChannelResponse!
  }
`;
