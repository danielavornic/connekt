import express from "express";
import { configureApolloMiddleware, createApolloServer } from "./config/apollo";
import { createNeo4jDriver } from "./config/neo4j";

const app = express();
const port = parseInt(process.env.PORT || "4000", 10);
const driver = createNeo4jDriver();
const server = createApolloServer();

async function startServer(): Promise<void> {
  await server.start();

  app.use(express.json());
  configureApolloMiddleware(app, server, driver);

  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}/graphql`);
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
