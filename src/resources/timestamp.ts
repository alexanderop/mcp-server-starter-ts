/**
 * @module Resources/Timestamp
 * @category Resources
 * 
 * Provides current timestamp in multiple formats.
 * Supports ISO 8601, Unix timestamp, and human-readable formats.
 * 
 * @since 1.0.0
 */

import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Available timestamp format options.
 * - `iso`: ISO 8601 format (e.g., "2024-01-15T10:30:00.000Z")
 * - `unix`: Unix timestamp in seconds (e.g., "1705315800")
 * - `readable`: Locale-specific human-readable format
 */
type TimestampFormat = "iso" | "unix" | "readable";

const MIME_TYPE_PLAIN = "text/plain";
const VALID_FORMATS: Array<TimestampFormat> = ["iso", "unix", "readable"];

/**
 * Timestamp resource module with multiple format support.
 * 
 * This resource provides the current timestamp in three different formats,
 * making it easy to integrate with various systems and use cases.
 * 
 * @example Getting ISO 8601 timestamp
 * ```typescript
 * const resource = await client.getResource("timestamp://iso");
 * console.log(resource.contents[0].text);
 * // Output: "2024-01-15T10:30:00.000Z"
 * ```
 * 
 * @example Getting Unix timestamp
 * ```typescript
 * const resource = await client.getResource("timestamp://unix");
 * const unixTime = parseInt(resource.contents[0].text);
 * console.log(new Date(unixTime * 1000));
 * ```
 * 
 * @example Getting human-readable timestamp
 * ```typescript
 * const resource = await client.getResource("timestamp://readable");
 * console.log(resource.contents[0].text);
 * // Output: "1/15/2024, 10:30:00 AM" (locale-dependent)
 * ```
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date} MDN Date documentation
 */
const timestampModule: RegisterableModule = {
  type: "resource",
  name: "timestamp",
  description: "Get current timestamp in various formats",
  register(server: McpServer) {
    server.registerResource(
      "timestamp",
      new ResourceTemplate("timestamp://{format}", {
        list: () => ({
          resources: [
            { uri: "timestamp://iso", name: "ISO 8601 format" },
            { uri: "timestamp://unix", name: "Unix timestamp" },
            { uri: "timestamp://readable", name: "Human-readable format" },
          ],
        }),
        complete: {
          format: (value) => {
            const normalizedValue = value.toLowerCase();
            return VALID_FORMATS.filter(f => 
              f.toLowerCase().startsWith(normalizedValue)
            );
          },
        },
      }),
      {
        name: "Timestamp",
        description: "Get current timestamp in various formats",
      },
      (uri, { format }) => {
        const now = new Date();
        let timestamp: string;

        if (format === undefined) {
          return {
            contents: [
              {
                uri: uri.href,
                mimeType: MIME_TYPE_PLAIN,
                text: "Format not specified. Use 'iso', 'unix', or 'readable'",
              },
            ],
          };
        }

        if (!VALID_FORMATS.includes(format as TimestampFormat)) {
          return {
            contents: [
              {
                uri: uri.href,
                mimeType: MIME_TYPE_PLAIN,
                text: `Unknown format: ${String(format)}. Use 'iso', 'unix', or 'readable'`,
              },
            ],
          };
        }

        const validFormat = format as TimestampFormat;
        
        switch (validFormat) {
          case "iso":
            timestamp = now.toISOString();
            break;
          case "unix":
            timestamp = Math.floor(now.getTime() / 1000).toString();
            break;
          case "readable":
            timestamp = now.toLocaleString();
            break;
          default: {
            const _exhaustive: never = validFormat;
            return _exhaustive;
          }
        }

        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: timestamp,
            },
          ],
        };
      }
    );
  }
};

export default timestampModule;