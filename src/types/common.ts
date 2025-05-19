import { gql } from "graphql-tag";

export interface PaginationInput {
  limit?: number;
  offset?: number;
}

export interface SearchPaginationInput extends PaginationInput {
  query?: string;
}

export type PaginatedResult<T, K extends string = "items"> = {
  totalCount: number;
  hasMore: boolean;
} & {
  [P in K]: T[];
};

export const commonTypeDefs = gql`
  input PaginationInput {
    limit: Int = 10
    offset: Int = 0
  }

  input SearchPaginationInput {
    query: String
    limit: Int = 10
    offset: Int = 0
  }
`;
