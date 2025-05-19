import { gql } from "graphql-tag";
import { PaginatedResult } from "./common";
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

export interface PaginatedChannelsResult
  extends PaginatedResult<Channel, "channels"> {}

export const channelTypesDefs = gql`
  """
  Full channel creator information, including email. Used for authenticated users viewing their own data.
  """
  type ChannelCreatorFull {
    "Unique identifier for the creator"
    id: ID!
    "Username of the creator"
    username: String!
    "Email address of the creator"
    email: String!
    "Role of the creator (CREATOR or VISITOR)"
    role: UserRole!
    "Timestamp when the creator account was created"
    createdAt: String!
    "Timestamp when the creator account was last updated"
    updatedAt: String!
  }

  """
  Limited channel creator information for public viewing.
  Email is hidden.
  """
  type ChannelCreatorLimited {
    "Unique identifier for the creator"
    id: ID!
    "Username of the creator"
    username: String!
    "Timestamp when the creator account was created"
    createdAt: String!
  }

  """
  Public channel information.
  """
  type Channel {
    "Unique identifier for the channel"
    id: ID!
    "Title of the channel"
    title: String!
    "Optional description of the channel"
    description: String
    "Timestamp when the channel was created"
    createdAt: String!
    "Timestamp when the channel was last updated"
    updatedAt: String!
    "Creator of the channel with limited information"
    createdBy: ChannelCreatorLimited!
  }

  """
  Private channel information with full creator details
  """
  type MyChannel {
    "Unique identifier for the channel"
    id: ID!
    "Title of the channel"
    title: String!
    "Optional description of the channel"
    description: String
    "Timestamp when the channel was created"
    createdAt: String!
    "Timestamp when the channel was last updated"
    updatedAt: String!
    "Creator of the channel with full information"
    createdBy: ChannelCreatorFull!
  }

  """
  Public channel information for non-authenticated views
  """
  type PublicChannel {
    "Unique identifier for the channel"
    id: ID!
    "Title of the channel"
    title: String!
    "Optional description of the channel"
    description: String
    "Timestamp when the channel was created"
    createdAt: String!
    "Timestamp when the channel was last updated"
    updatedAt: String!
    "Creator of the channel with limited information"
    createdBy: ChannelCreatorLimited!
  }

  """
  Input for creating a new channel
  """
  input CreateChannelInput {
    "Title of the new channel"
    title: String!
    "Optional description for the channel"
    description: String
  }

  """
  Input for finding a channel by ID
  """
  input FindChannelByIdInput {
    "ID of the channel to find"
    channelId: String!
  }

  """
  Input for finding channels by user ID
  """
  input FindChannelsByUserIdInput {
    "ID of the user to find channels for"
    userId: String!
  }

  """
  Input for updating a channel
  Supports partial updates
  """
  input UpdateChannelInput {
    "ID of the channel to update"
    channelId: String!
    "New title for the channel"
    title: String
    "New description for the channel"
    description: String
  }

  """
  Input for deleting a channel
  """
  input DeleteChannelInput {
    "ID of the channel to delete"
    channelId: String!
  }

  """
  Input for fetching channels by user
  """
  input ChannelsByUserInput {
    "ID of the user to fetch channels for"
    userId: ID!
    "Optional search query"
    query: String
    "Maximum number of channels to return"
    limit: Int = 10
    "Number of channels to skip"
    offset: Int = 0
  }

  """
  Input for searching channels
  """
  input ChannelSearchInput {
    "Search query string"
    query: String
    "Maximum number of results"
    limit: Int = 10
    "Number of results to skip"
    offset: Int = 0
  }

  """
  Results of a channel search
  """
  type ChannelSearchResult {
    "List of matching channels"
    channels: [Channel!]!
    "Total number of matching channels"
    totalCount: Int!
    "Whether there are more results"
    hasMore: Boolean!
  }

  """
  Response for channel deletion
  """
  type DeleteChannelResponse {
    "Whether the deletion was successful"
    success: Boolean!
    "Message describing the result"
    message: String!
  }

  type Query {
    "Get channels owned by the authenticated user"
    myChannels: [MyChannel!]!
    "Get a specific channel by ID"
    channel(input: FindChannelByIdInput!): PublicChannel
    "Get channels owned by a specific user"
    channelsByUserId(input: ChannelsByUserInput!): ChannelSearchResult!
    "Search for channels"
    searchChannels(input: ChannelSearchInput!): ChannelSearchResult!
  }

  type Mutation {
    "Create a new channel"
    createChannel(input: CreateChannelInput!): MyChannel
    "Update an existing channel"
    updateChannel(input: UpdateChannelInput!): MyChannel
    "Delete a channel"
    deleteChannel(input: DeleteChannelInput!): DeleteChannelResponse!
  }
`;
