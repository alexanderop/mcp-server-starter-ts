---
to: src/prompts/<%= name %>.ts
---
/**
 * @module Prompts/<%= h.changeCase.pascalCase(name) %>
 * @category Prompts
 */

import { z } from "zod";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Schema for <%= name %> prompt arguments
 * @internal
 */
const <%= h.changeCase.camelCase(name) %>Schema = {
  topic: z.string().min(1).describe("Topic to generate content about"),
} as const;

/**
 * <%= description %>
 * 
 * @example
 * ```typescript
 * // Usage in MCP client
 * const prompt = await client.getPrompt("<%= name %>", { 
 *   topic: "example topic" 
 * });
 * ```
 */
const <%= h.changeCase.camelCase(name) %>Module: RegisterableModule = {
  type: "prompt",
  name: "<%= name %>",
  description: "<%= description %>",
  register(server: McpServer) {
    server.registerPrompt(
      "<%= name %>",
      {
        title: "<%= h.changeCase.titleCase(name.replace(/-/g, ' ')) %>",
        description: "<%= description %>",
        argsSchema: <%= h.changeCase.camelCase(name) %>Schema,
      },
      ({ topic }) => {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `<%= description %>

Topic: ${topic}

Please provide a comprehensive response about the topic above.`,
              },
            },
          ],
        };
      }
    );
  }
};

export default <%= h.changeCase.camelCase(name) %>Module;