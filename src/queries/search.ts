export const searchQueries = {
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

  searchChannels: `
    MATCH (u:User)-[:CREATED]->(c:Channel)
    WHERE c.title =~ $query OR c.description =~ $query
    WITH count(c) as totalCount
    MATCH (u:User)-[:CREATED]->(c:Channel)
    WHERE c.title =~ $query OR c.description =~ $query
    OPTIONAL MATCH (b:Block)-[:CONNECTED_TO]->(c)
    WITH c, u, totalCount, collect(b) as blocks
    RETURN {
      id: c.id,
      title: c.title,
      description: c.description,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      blocks: [block in blocks | {
        id: block.id,
        title: block.title,
        description: block.description,
        content: block.content,
        createdAt: block.createdAt,
        updatedAt: block.updatedAt
      }],
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
};
