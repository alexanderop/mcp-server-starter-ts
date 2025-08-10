---
to: src/tools/<%= name %>.ts
---
/**
 * @module Tools/<%= h.changeCase.pascalCase(name) %>
 * @category Tools
 */

import { z } from "zod";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * <%= description %>
 * 
 * @example
 * ```typescript
 * // Usage in MCP client
 * const result = await client.callTool("<%= name %>", { 
 *   input: "example input" 
 * });
 * ```
 */
const <%= h.changeCase.camelCase(name) %>Module: RegisterableModule = {
  type: "tool",
  name: "<%= name %>",
  description: "<%= description %>",
  register(server: McpServer) {
    server.tool(
      "<%= name %>",
      "<%= description %>",
      {
        input: z.string().describe("Input text"),
      },
      async (args) => {
        const { input } = args;
        
        // TODO: Implement your tool logic here
        const output = `Processed: ${input}`;
        
        return {
          content: [
            {
              type: "text",
              text: output,
            },
          ],
        };
      }
    );
  }
};

export default <%= h.changeCase.camelCase(name) %>Module;