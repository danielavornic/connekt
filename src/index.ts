import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { IResolvers } from "@graphql-tools/utils";
import express, { Express } from "express";
import neo4j, { Driver } from "neo4j-driver";

const app: Express = express();
const port: number = parseInt(process.env.PORT || "4000", 10);

const driver: Driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(
    process.env.NEO4J_USER || "neo4j",
    process.env.NEO4J_PASSWORD || "password"
  )
);

const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

const resolvers: IResolvers = {
  Query: {
    hello: () => "Hello World!",
  },
};

async function startServer(): Promise<void> {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(express.json());
  app.use("/graphql", expressMiddleware(server));

  app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/graphql`);
  });

  process.on("SIGTERM", async () => {
    await driver.close();
    process.exit(0);
  });
}

startServer().catch((error: Error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
