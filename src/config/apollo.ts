import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { Express } from "express";
import { Driver } from "neo4j-driver";
import { authResolvers } from "../resolvers/auth";
import { Context } from "../types/context";
import { userTypeDefs } from "../types/user";

const baseTypeDefs = `#graphql
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const createApolloServer = () => {
  return new ApolloServer<Context>({
    typeDefs: [baseTypeDefs, userTypeDefs],
    resolvers: [authResolvers],
  });
};

export const configureApolloMiddleware = (
  app: Express,
  server: ApolloServer<Context>,
  driver: Driver
) => {
  return app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({
        driver,
        user: undefined,
      }),
    })
  );
};
