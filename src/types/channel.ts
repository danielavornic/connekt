import { User } from "./user";

export interface CreateChannelInput {
  name: string;
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
  name?: string;
  description?: string;
}

export const channelTypesDefs = `
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
    name: String!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type MyChannel {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    updatedAt: String!
    createdBy: ChannelCreatorFull!
  }

  type PublicChannel {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    updatedAt: String!
    createdBy: ChannelCreatorLimited!
  }

  input CreateChannelInput {
    name: String!
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
    name: String
    description: String
  }

  input DeleteChannelInput {
    channelId: String!
  }

  type Query {
    findMyChannels: [MyChannel!]!
    findChannelById(input: FindChannelByIdInput!): PublicChannel
    findChannelsByUserId(input: FindChannelsByUserIdInput!): [PublicChannel!]!
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
