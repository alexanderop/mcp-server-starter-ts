#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { autoRegisterModules } from "./registry/auto-loader.js";

const server = new McpServer({
  name: "mcp-server-starter",
  version: "1.0.0",
  capabilities: {
    tools: {},
    resources: {},
    prompts: {},
    completions: {},
  },
});

async function main(): Promise<void> {
  await autoRegisterModules(server);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server Starter running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});