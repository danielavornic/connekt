import { SearchService } from "../services/search";
import { Context } from "../types/context";
import { SearchInput } from "../types/search";

export const searchResolvers = {
  Query: {
    searchBlocks: async (
      _: any,
      { input }: { input: SearchInput },
      { driver }: Context
    ) => {
      const searchService = new SearchService(driver);
      return searchService.searchBlocks(input);
    },

    searchChannels: async (
      _: any,
      { input }: { input: SearchInput },
      { driver }: Context
    ) => {
      const searchService = new SearchService(driver);
      return searchService.searchChannels(input);
    },
  },
};
