export interface Channel {
  id: string;
  name: string;
  description: string;
  createdBy: string; // user id
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelInput {
  name: string;
  description: string;
}

export const channelTypesDefs = `
  type Channel {
    id: ID!
    name: String!
    description: String!
    createdBy: String!
    createdAt: String!
    updatedAt: String!
  }

  input CreateChannelInput {
    name: String!
    description: String!
  }

  type Mutation {
    createChannel(input: CreateChannelInput!): Channel
  }
`;
