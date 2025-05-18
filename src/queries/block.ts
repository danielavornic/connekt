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
    ORDER BY b.createdAt DESC
  `,
};
