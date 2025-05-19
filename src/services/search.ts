import { Driver, int } from "neo4j-driver";
import { searchQueries } from "../queries/search";
import {
  BlockSearchResult,
  ChannelSearchResult,
  SearchInput,
} from "../types/search";

export class SearchService {
  constructor(private readonly driver: Driver) {}

  async searchBlocks(input: SearchInput): Promise<BlockSearchResult> {
    const session = this.driver.session();
    try {
      const result = await session.executeRead((tx) =>
        tx.run(searchQueries.searchBlocks, {
          query: `(?i).*${input.query}.*`,
          limit: int(input.limit ?? 10),
          offset: int(input.offset ?? 0),
        })
      );

      const blocks = result.records.map((record) => record.get("block"));
      const totalCount = result.records[0]?.get("totalCount")?.toNumber() || 0;
      const hasMore = blocks.length + (input.offset ?? 0) < totalCount;

      return {
        blocks,
        totalCount,
        hasMore,
      };
    } finally {
      await session.close();
    }
  }

  async searchChannels(input: SearchInput): Promise<ChannelSearchResult> {
    const session = this.driver.session();
    try {
      const result = await session.executeRead((tx) =>
        tx.run(searchQueries.searchChannels, {
          query: `(?i).*${input.query}.*`,
          limit: int(input.limit ?? 10),
          offset: int(input.offset ?? 0),
        })
      );

      const channels = result.records.map((record) => record.get("channel"));
      const totalCount = result.records[0]?.get("totalCount")?.toNumber() || 0;
      const hasMore = channels.length + (input.offset ?? 0) < totalCount;

      return {
        channels,
        totalCount,
        hasMore,
      };
    } finally {
      await session.close();
    }
  }
}
