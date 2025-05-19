import { gql } from "graphql-tag";
import { Block } from "./block";
import { Channel } from "./channel";

export interface SearchInput {
  query: string;
  limit?: number;
  offset?: number;
}

export interface BlockSearchResult {
  blocks: Block[];
  totalCount: number;
  hasMore: boolean;
}

export interface ChannelSearchResult {
  channels: Channel[];
  totalCount: number;
  hasMore: boolean;
}

export const searchTypeDefs = gql`
  input SearchInput {
    query: String!
    limit: Int = 10
    offset: Int = 0
  }

  type BlockSearchResult {
    blocks: [Block!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type ChannelSearchResult {
    channels: [Channel!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  extend type Query {
    searchBlocks(input: SearchInput!): BlockSearchResult!
    searchChannels(input: SearchInput!): ChannelSearchResult!
  }
`;
