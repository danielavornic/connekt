import { gql } from "graphql-tag";

export const enum UserRole {
  CREATOR = "CREATOR",
  VISITOR = "VISITOR",
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const userTypeDefs = gql`
  enum UserRole {
    CREATOR
    VISITOR
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: UserRole!
    createdAt: String!
    updatedAt: String!
  }

  input CreateUserInput {
    username: String!
    email: String!
    password: String!
    role: UserRole!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    me: User!
  }

  extend type Mutation {
    register(input: CreateUserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
  }
`;
