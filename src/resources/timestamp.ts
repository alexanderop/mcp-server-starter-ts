import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

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
            return ["iso", "unix", "readable"].filter(f => 
              f.toLowerCase().startsWith(value.toLowerCase())
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

        switch (format) {
          case "iso":
            timestamp = now.toISOString();
            break;
          case "unix":
            timestamp = Math.floor(now.getTime() / 1000).toString();
            break;
          case "readable":
            timestamp = now.toLocaleString();
            break;
          default:
            timestamp = `Unknown format: ${String(format)}. Use 'iso', 'unix', or 'readable'`;
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