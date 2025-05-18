import isUrl from "is-url";
import fetch from "node-fetch";

const ALLOWED_PROTOCOLS = ["http:", "https:"];

const BLOCKED_HOSTNAMES = ["localhost", "127.0.0.1"];
const BLOCKED_HOSTNAME_STARTS = ["192.168.", "10.", "169.254.", "172.16."];
const BLOCKED_HOSTNAME_ENDS = [".local"];

export class UrlService {
  static isValidUrl(str: string): boolean {
    if (!isUrl(str)) return false;

    try {
      const url = new URL(str);
      const hostname = url.hostname.toLowerCase();

      return (
        ALLOWED_PROTOCOLS.includes(url.protocol) &&
        !BLOCKED_HOSTNAMES.includes(hostname) &&
        !BLOCKED_HOSTNAME_STARTS.some((start) => hostname.startsWith(start)) &&
        !BLOCKED_HOSTNAME_ENDS.some((end) => hostname.endsWith(end))
      );
    } catch {
      return false;
    }
  }

  static async extractMetadata(
    url: string
  ): Promise<{ title?: string; description?: string }> {
    if (!this.isValidUrl(url)) {
      return {};
    }

    try {
      const response = await fetch(url);
      const html = await response.text();

      const titleMatch = html.match(
        /<meta\s+property="og:title"\s+content="([^"]+)"|<title>([^<]+)<\/title>/i
      );
      const descriptionMatch = html.match(
        /<meta\s+property="og:description"\s+content="([^"]+)"|<meta\s+name="description"\s+content="([^"]+)"/i
      );

      return {
        title: titleMatch ? titleMatch[1] || titleMatch[2] : undefined,
        description: descriptionMatch
          ? descriptionMatch[1] || descriptionMatch[2]
          : undefined,
      };
    } catch (error) {
      console.error("Error extracting metadata:", error);
      return {};
    }
  }
}
