#!/usr/bin/env node
/**
 * @module Main
 * @category Core
 * 
 * Main entry point for the MCP Server Starter.
 * This module initializes the Model Context Protocol server with auto-discovery
 * of tools, resources, and prompts from the standard module directories.
 * 
 * @example Starting the server
 * ```bash
 * # Run directly with Node.js
 * node build/index.js
 * 
 * # Or use npm script
 * npm run dev
 * 
 * # Or use with MCP Inspector
 * npm run inspect
 * ```
 * 
 * @example Server Configuration
 * The server automatically discovers and loads:
 * - **Tools** from `src/tools/` - Execute actions and computations
 * - **Resources** from `src/resources/` - Provide read-only data access
 * - **Prompts** from `src/prompts/` - Reusable prompt templates
 * 
 * @mermaid
 * ```mermaid
 * graph LR
 *     Client[MCP Client] <-->|JSON-RPC| Server[MCP Server]
 *     
 *     Server --> Tools[Tools]
 *     Server --> Resources[Resources]
 *     Server --> Prompts[Prompts]
 *     
 *     Tools --> Echo[echo.ts]
 *     Tools --> Custom[custom-tool.ts]
 *     
 *     Resources --> System[system-info.ts]
 *     Resources --> Time[timestamp.ts]
 *     
 *     Prompts --> Analyzer[code-analyzer.ts]
 *     Prompts --> Readme[generate-readme.ts]
 *     
 *     style Server fill:#f9f,stroke:#333,stroke-width:2px
 *     style Client fill:#bbf,stroke:#333,stroke-width:2px
 * ```
 * 
 * @see {@link autoRegisterModules} for module discovery details
 * @see {@link https://modelcontextprotocol.io} for MCP protocol documentation
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { autoRegisterModules } from "./registry/auto-loader.js";

/**
 * MCP Server instance configured with all available capabilities.
 * This server supports tools, resources, prompts, and completions.
 * 
 * @internal
 */
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

/**
 * Main application entry point.
 * Initializes the MCP server, auto-registers all modules, and starts listening on stdio.
 * 
 * @returns Promise that resolves when the server is running
 * @throws Will terminate the process with exit code 1 on fatal errors
 * 
 * @example Server Lifecycle
 * 1. Create MCP server instance
 * 2. Auto-discover and register modules from filesystem
 * 3. Create stdio transport for communication
 * 4. Connect server to transport
 * 5. Listen for incoming requests
 */
async function main(): Promise<void> {
  await autoRegisterModules(server);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server Starter running on stdio");
}

// Start the server and handle any fatal errors
main().catch((error: unknown) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});