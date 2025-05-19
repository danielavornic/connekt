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
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const userTypeDefs = gql`
  """
  User roles in the system
  """
  enum UserRole {
    "Content creator with full access to create and manage channels/blocks"
    CREATOR
    "Regular user with limited viewing permissions"
    VISITOR
  }

  """
  User account information and profile details
  """
  type User {
    "Unique identifier for the user"
    id: ID!
    "User's display name"
    username: String!
    "User's email address for authentication"
    email: String!
    "User's role"
    role: UserRole!
    "Timestamp when the user account was created"
    createdAt: String!
    "Timestamp when the user account was last updated"
    updatedAt: String!
  }

  """
  Input for creating a new user account
  """
  input CreateUserInput {
    "Unique username for the new account"
    username: String!
    "Unique email address for authentication"
    email: String!
    "Account password"
    password: String!
    "Role assignment"
    role: UserRole!
  }

  """
  Authentication response
  """
  type AuthPayload {
    "JWT authentication token"
    token: String!
    "Authenticated user information"
    user: User!
  }

  """
  Input for user login
  """
  input LoginInput {
    "User's email address"
    email: String!
    "User's password"
    password: String!
  }

  extend type Query {
    "Get the currently authenticated user's information based on the Authorization header"
    me: User!
  }

  extend type Mutation {
    "Register a new user account"
    register(input: CreateUserInput!): AuthPayload!
    "Authenticate an existing user"
    login(input: LoginInput!): AuthPayload!
  }
`;
