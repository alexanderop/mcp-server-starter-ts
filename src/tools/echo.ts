import { z } from "zod";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerEchoTool(server: McpServer): void {
  server.tool(
    "echo",
    "Echo back the provided text",
    {
      text: z.string().min(1, "Text cannot be empty").describe("Text to echo back"),
    },
    (args) => {
      const text = args.text;
      return {
        content: [
          {
            type: "text",
            text: text,
          },
        ],
      };
    }
  );
}