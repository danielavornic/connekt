export const channelQueries = {
  createChannel: `
    CREATE (c:Channel {
      id: $channelId,
      name: $name,
      description: $description,
      createdAt: $now
    })
    WITH c
    MATCH (u:User {id: $createdBy})
    CREATE (u)-[:CREATED]->(c)
    RETURN c
  `,
};
