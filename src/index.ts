#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerGenerateReadmePrompt } from "./prompts/generate-readme.js";
import { registerSystemInfoResource } from "./resources/system-info.js";
import { registerTimestampResource } from "./resources/timestamp.js";
import { registerEchoTool } from "./tools/echo.js";

const server = new McpServer({
  name: "mcp-server-starter",
  version: "1.0.0",
  capabilities: {
    tools: {},
    resources: {},
    prompts: {},
  },
});

// Register tools
registerEchoTool(server);

// Register resources
registerSystemInfoResource(server);
registerTimestampResource(server);

// Register prompts
registerGenerateReadmePrompt(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server Starter running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});