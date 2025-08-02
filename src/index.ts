#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "mcp-server-starter",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

server.tool(
  "echo",
  "Echo back the provided text",
  {
    text: z.string().describe("Text to echo back"),
  },
  (args) => {
    const text = args.text as string;
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

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server Starter running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});