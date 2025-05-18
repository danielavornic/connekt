export const channelQueries = {
  createChannel: `
    CREATE (c:Channel {
      id: $channelId,
      title: $title,
      description: CASE WHEN $description IS NOT NULL THEN $description END,
      createdAt: $now,
      updatedAt: $now
    })
    WITH c
    MATCH (u:User {id: $createdBy})
    CREATE (u)-[:CREATED]->(c)
    RETURN c
  `,

  findChannelById: `
    MATCH (u:User)-[:CREATED]->(c:Channel {id: $channelId})
    RETURN {
      id: c.id,
      title: c.title,
      description: c.description,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      createdBy: {
        id: u.id,
        username: u.username,
        createdAt: u.createdAt
      }
    } as channel
  `,

  findMyChannels: `
    MATCH (u:User {id: $userId})-[:CREATED]->(c:Channel)
    RETURN {
      id: c.id,
      title: c.title,
      description: c.description,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      createdBy: {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }
    } as channel
    ORDER BY c.createdAt DESC
  `,

  findChannelsByUserId: `
    MATCH (u:User {id: $userId})-[:CREATED]->(c:Channel)
    RETURN {
      id: c.id,
      title: c.title,
      description: c.description,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      createdBy: {
        id: u.id,
        username: u.username,
        createdAt: u.createdAt
      }
    } as channel
    ORDER BY c.createdAt DESC
  `,

  updateChannel: `
    MATCH (u:User)-[:CREATED]->(c:Channel {id: $channelId})
    SET c += {
      title: CASE WHEN $title IS NOT NULL THEN $title ELSE c.title END,
      description: CASE WHEN $description IS NOT NULL THEN $description ELSE c.description END,
      updatedAt: $updatedAt
    }
    RETURN c
  `,

  deleteChannel: `    
    MATCH (c:Channel {id: $channelId})
    
    // delete all blocks connected to this channel
    WITH c
    OPTIONAL MATCH (b:Block)-[r:CONNECTED_TO]->(c)
    WITH c, b, r
    OPTIONAL MATCH (b)-[br]-()
    DELETE br, b
    
    WITH c
    OPTIONAL MATCH (c)-[cr]-()
    DELETE cr, c
    
    RETURN true as success
  `,
};
