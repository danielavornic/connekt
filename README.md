# Connekt

A GraphQL API inspired by [Are.na](https://are.na), built with Node.js, Neo4j, and Apollo Server.

Are.na documentation available at [https://help.are.na/docs](https://help.are.na/docs). It is a social platform for creating and sharing ideas, based on the concept of channels and blocks.

Live demo available at [connekt-production.up.railway.app/graphql](https://connekt-production.up.railway.app/graphql).

## Features

### Authentication & Authorization

- JWT-based authentication with role-based access control
- Two user roles: `CREATOR` and `VISITOR`
- Role embedded in JWT tokens
- Protected operations based on user roles:
  - `CREATOR`: create, read, update, and delete channels and blocks
  - `VISITOR`: read channels and blocks

### Channels

- Create, read, update, and delete channels
- Public and private channel views: hide e-mail addresses for public views
- My channels: view all channels owned by the authenticated user
- Smart deletion handling for associated blocks

### Blocks

- Create text or URL-based blocks
- For URL blocks, `title` and `description` are automatically populated from the URL
- Connect blocks to multiple channels
- Smart deletion logic:
  - Single-connection blocks: Full deletion of block and relationships
  - Multi-connection blocks: Removes only specific channel connection
  - Maintains block data and other connections when appropriate

### Other Features

- Pagination support for all list operations
  - Configurable limit and offset
  - Total count and `hasMore` indicators
- Search functionality with pagination
  - Channel search by title/description
  - Block search across all channels and for specific channel
  - User-specific channel search

## API Structure

### Main Queries

```graphql
# Users
me: User!

# Channels
myChannels: [MyChannel!]!
channel(channelId: ID!): PublicChannel
channelsByUserId(input: ChannelsByUserInput!): ChannelSearchResult!
searchChannels(input: ChannelSearchInput!): ChannelSearchResult!

# Blocks
block(blockId: ID!): Block
blocksByChannelId(input: BlocksByChannelInput!): BlockSearchResult!
searchBlocks(input: BlockSearchInput!): BlockSearchResult!
```

### Main Mutations

```graphql
# Users
register(input: CreateUserInput!): AuthPayload!
login(input: LoginInput!): AuthPayload!

# Channels
createChannel(input: CreateChannelInput!): MyChannel
updateChannel(input: UpdateChannelInput!): MyChannel
deleteChannel(channelId: ID!): DeleteChannelResponse!

# Blocks
createBlock(input: CreateBlockInput!): MyBlock!
updateBlock(input: UpdateBlockInput!): MyBlock!
deleteBlock(input: BlockConnection!): DeleteBlockResponse!
connectBlockToChannel(input: BlockConnection!): MyBlock!
```

### Pagination Example

```graphql
input ChannelSearchInput {
  query: String
  limit: Int = 10 # Number of items to return
  offset: Int = 0 # Number of items to skip
}

type ChannelSearchResult {
  channels: [Channel!]!
  totalCount: Int!
  hasMore: Boolean!
}
```
