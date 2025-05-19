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
    WHERE CASE 
      WHEN $query IS NOT NULL 
      THEN c.title =~ $query OR c.description =~ $query
      ELSE true 
    END
    WITH count(c) as totalCount
    MATCH (u:User {id: $userId})-[:CREATED]->(c:Channel)
    WHERE CASE 
      WHEN $query IS NOT NULL 
      THEN c.title =~ $query OR c.description =~ $query
      ELSE true 
    END
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
    } as channel,
    totalCount
    ORDER BY c.createdAt DESC
    SKIP $offset
    LIMIT $limit
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

  getChannelBlocksInfo: `
    MATCH (c:Channel {id: $channelId})
    MATCH (creator:User)-[:CREATED]->(c)
    WITH c, creator
    
    OPTIONAL MATCH (b:Block)-[:CONNECTED_TO]->(c)
  
    // for each block, get its connection count and creator
    OPTIONAL MATCH (b)-[:CONNECTED_TO]->(otherChannel:Channel)
    OPTIONAL MATCH (blockCreator:User)-[:CREATED]->(b)
    
    WITH c.id as channelId, creator.id as channelCreatorId,
         b, blockCreator, COUNT(otherChannel) as connectionCount
    
    WITH channelId, channelCreatorId,
         collect({
           blockId: b.id,
           blockCreatorId: blockCreator.id,
           connectionCount: connectionCount
         }) as blocks
    
    RETURN {
      channelId: channelId,
      channelCreatorId: channelCreatorId,
      blocks: blocks
    } as info
  `,

  deleteChannelBlocks: `
    // blocks that are only connected to this channel - should be deleted
    MATCH (c:Channel {id: $channelId})
    MATCH (b:Block)-[:CONNECTED_TO]->(c)
    WITH b, c
    MATCH (b)-[r:CONNECTED_TO]->(channel:Channel)
    WITH b, c, COUNT(channel) as totalConnections
    WHERE totalConnections = 1
    OPTIONAL MATCH (b)-[r]-()
    DELETE r, b
    
    // blocks that are connected to other channels - should only have their connection removed
    WITH 1 as foo
    MATCH (c:Channel {id: $channelId})
    MATCH (b:Block)-[r:CONNECTED_TO]->(c)
    WITH b, r, c
    MATCH (b)-[:CONNECTED_TO]->(channel:Channel)
    WITH b, r, COUNT(channel) as totalConnections
    WHERE totalConnections > 1
    DELETE r
    
    RETURN true as success
  `,

  deleteChannel: `
    MATCH (c:Channel {id: $channelId})
    WITH c
    OPTIONAL MATCH (c)-[r]-()
    DELETE r, c
    RETURN true as success
  `,
};
