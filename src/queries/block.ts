export const blockQueries = {
  createBlock: `
    MATCH (ch:Channel {id: $channelId})
    CREATE (b:Block {
      id: $blockId,
      title: CASE WHEN $title IS NOT NULL THEN $title END,
      description: CASE WHEN $description IS NOT NULL THEN $description END,
      content: $content,
      createdAt: $now,
      updatedAt: $now
    })
    WITH b, ch
    MATCH (u:User {id: $createdBy})
    CREATE (u)-[:CREATED]->(b)
    CREATE (b)-[:CONNECTED_TO]->(ch)
    RETURN {
      id: b.id,
      title: b.title,
      description: b.description,
      content: b.content,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      channel: {
        id: ch.id,
        title: ch.title,
        description: ch.description
      },
      createdBy: {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }
    } as block
  `,

  findBlockById: `
    MATCH (u:User)-[:CREATED]->(b:Block {id: $blockId})-[:CONNECTED_TO]->(ch:Channel)
    RETURN {
      id: b.id,
      title: b.title,
      description: b.description,
      content: b.content,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      channel: {
        id: ch.id,
        title: ch.title,
        description: ch.description
      },
      createdBy: {
        id: u.id,
        username: u.username,
        createdAt: u.createdAt
      }
    } as block
  `,

  findBlocksByChannelId: `
    MATCH (u:User)-[:CREATED]->(b:Block)-[:CONNECTED_TO]->(ch:Channel {id: $channelId})
    WHERE CASE 
      WHEN $query IS NOT NULL 
      THEN b.title =~ $query OR b.description =~ $query OR b.content =~ $query
      ELSE true 
    END
    WITH count(b) as totalCount
    MATCH (u:User)-[:CREATED]->(b:Block)-[:CONNECTED_TO]->(ch:Channel {id: $channelId})
    WHERE CASE 
      WHEN $query IS NOT NULL 
      THEN b.title =~ $query OR b.description =~ $query OR b.content =~ $query
      ELSE true 
    END
    RETURN {
      id: b.id,
      title: b.title,
      description: b.description,
      content: b.content,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      channel: {
        id: ch.id,
        title: ch.title,
        description: ch.description
      },
      createdBy: {
        id: u.id,
        username: u.username,
        createdAt: u.createdAt
      }
    } as block,
    totalCount
    ORDER BY b.createdAt DESC
    SKIP $offset
    LIMIT $limit
  `,

  searchBlocks: `
    MATCH (u:User)-[:CREATED]->(b:Block)
    WHERE b.title =~ $query OR b.description =~ $query OR b.content =~ $query
    WITH count(b) as totalCount
    MATCH (u:User)-[:CREATED]->(b:Block)-[:CONNECTED_TO]->(ch:Channel)
    WHERE b.title =~ $query OR b.description =~ $query OR b.content =~ $query
    RETURN {
      id: b.id,
      title: b.title,
      description: b.description,
      content: b.content,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      channel: {
        id: ch.id,
        title: ch.title,
        description: ch.description
      },
      createdBy: {
        id: u.id,
        username: u.username,
        createdAt: u.createdAt
      }
    } as block,
    totalCount
    ORDER BY b.createdAt DESC
    SKIP $offset
    LIMIT $limit
  `,

  updateBlock: `
    MATCH (u:User)-[:CREATED]->(b:Block {id: $blockId})-[:CONNECTED_TO]->(ch:Channel)
    SET b += {
      title: CASE WHEN $title IS NOT NULL THEN $title ELSE b.title END,
      description: CASE WHEN $description IS NOT NULL THEN $description END,
      content: CASE WHEN $content IS NOT NULL THEN $content ELSE b.content END,
      updatedAt: $updatedAt
    }
    RETURN {
      id: b.id,
      title: b.title,
      description: b.description,
      content: b.content,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      channel: {
        id: ch.id,
        title: ch.title,
        description: ch.description
      },
      createdBy: {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }
    } as block
  `,

  deleteBlock: `
    MATCH (b:Block {id: $blockId})
    WITH b
    OPTIONAL MATCH (b)-[r]-()
    DELETE r, b
    RETURN true as success
  `,

  connectBlockToChannel: `
    MATCH (b:Block {id: $blockId})
    MATCH (ch:Channel {id: $channelId})
    MERGE (b)-[:CONNECTED_TO]->(ch)
    WITH b, ch
    MATCH (u:User)-[:CREATED]->(b)
    RETURN {
      id: b.id,
      title: b.title,
      description: b.description,
      content: b.content,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      channel: {
        id: ch.id,
        title: ch.title,
        description: ch.description
      },
      createdBy: {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }
    } as block
  `,

  findBlockConnections: `
    MATCH (b:Block {id: $blockId})-[:CONNECTED_TO]->(ch:Channel)
    MATCH (u:User)-[:CREATED]->(ch)
    RETURN {
      id: ch.id,
      title: ch.title,
      description: ch.description,
      createdAt: ch.createdAt,
      createdBy: {
        id: u.id,
        username: u.username,
        createdAt: u.createdAt
      }
    } as connection
    ORDER BY ch.createdAt DESC
  `,

  getBlockConnectionInfo: `
    MATCH (b:Block {id: $blockId})
    MATCH (creator:User)-[:CREATED]->(b)
    WITH b, creator
    MATCH (b)-[r:CONNECTED_TO]->(ch:Channel)
    WITH b, creator, COLLECT(ch) as channels, COUNT(r) as connectionCount
    OPTIONAL MATCH (b)-[:CONNECTED_TO]->(targetChannel:Channel {id: $channelId})
    OPTIONAL MATCH (targetChannel)<-[:CREATED]-(channelCreator:User)
    RETURN {
      blockCreatorId: creator.id,
      channelCreatorId: channelCreator.id,
      connectionCount: connectionCount,
      hasTargetChannel: targetChannel IS NOT NULL,
      channels: [ch IN channels | ch.id]
    } as info
  `,

  removeBlockConnection: `
    MATCH (b:Block {id: $blockId})-[r:CONNECTED_TO]->(ch:Channel {id: $channelId})
    DELETE r
    RETURN true as success
  `,

  deleteBlockCompletely: `
    MATCH (b:Block {id: $blockId})
    WITH b
    OPTIONAL MATCH (b)-[r]-()
    DELETE r, b
    RETURN true as success
  `,
};
