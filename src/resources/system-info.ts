import * as os from "os";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSystemInfoResource(server: McpServer): void {
  server.resource(
    "system-info",
    "system://info",
    {
      name: "System Information",
      description: "Get basic system information about the server",
    },
    () => {
      return {
        contents: [
          {
            uri: "system://info",
            mimeType: "application/json",
            text: JSON.stringify({
              platform: os.platform(),
              architecture: os.arch(),
              nodeVersion: process.version,
              uptime: os.uptime(),
              totalMemory: os.totalmem(),
              freeMemory: os.freemem(),
            }, null, 2),
          },
        ],
      };
    }
  );
}