---
to: src/resources/<%= name %>.ts
---
/**
 * @module Resources/<%= h.changeCase.pascalCase(name) %>
 * @category Resources
 */

import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * <%= description %>
 * 
 * @example
 * ```typescript
 * // Usage in MCP client
 * const resource = await client.getResource("<%= name %>://info");
 * const data = JSON.parse(resource.contents[0].text);
 * ```
 */
const <%= h.changeCase.camelCase(name) %>Module: RegisterableModule = {
  type: "resource",
  name: "<%= name %>",
  description: "<%= description %>",
  register(server: McpServer) {
    server.resource(
      "<%= name %>",
      "<%= name %>://info",
      {
        name: "<%= h.changeCase.titleCase(name.replace(/-/g, ' ')) %>",
        description: "<%= description %>",
      },
      async () => {
        // TODO: Implement your resource logic here
        const data = {
          message: "This is the <%= name %> resource",
          timestamp: new Date().toISOString(),
          // Add your resource data here
        };
        
        return {
          contents: [
            {
              uri: "<%= name %>://info",
              mimeType: "application/json",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }
    );
  }
};

export default <%= h.changeCase.camelCase(name) %>Module;