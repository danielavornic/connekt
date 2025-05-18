import isUrl from "is-url";
import getMetaData from "metadata-scraper";

export class UrlService {
  static isValidUrl(str: string): boolean {
    return isUrl(str);
  }

  static async extractMetadata(
    url: string
  ): Promise<{ title?: string; description?: string }> {
    try {
      const metadata = await getMetaData(url);

      return {
        title: metadata.title || undefined,
        description: metadata.description || undefined,
      };
    } catch (error) {
      console.error("Error extracting metadata:", error);
      return {};
    }
  }
}
