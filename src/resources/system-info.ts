/**
 * @module Resources/SystemInfo
 * @category Resources
 * 
 * Provides real-time system information about the server environment.
 * This resource exposes key metrics including memory usage, platform details,
 * and Node.js runtime information.
 * 
 * @since 1.0.0
 */

import * as os from "os";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * System information resource module.
 * 
 * Returns comprehensive system metrics including:
 * - Platform and architecture information
 * - Node.js version
 * - System uptime
 * - Memory statistics (total and free)
 * 
 * @example Usage in MCP client
 * ```typescript
 * const resource = await client.getResource("system://info");
 * const systemData = JSON.parse(resource.contents[0].text);
 * 
 * console.log(`Platform: ${systemData.platform}`);
 * console.log(`Free Memory: ${systemData.freeMemory}`);
 * console.log(`Node Version: ${systemData.nodeVersion}`);
 * ```
 * 
 * @example Response format
 * ```json
 * {
 *   "platform": "darwin",
 *   "architecture": "arm64",
 *   "nodeVersion": "v20.11.0",
 *   "uptime": 123456,
 *   "totalMemory": 17179869184,
 *   "freeMemory": 5368709120
 * }
 * ```
 * 
 * @see {@link https://nodejs.org/api/os.html} Node.js OS module documentation
 */
const systemInfoModule: RegisterableModule = {
  type: "resource",
  name: "system-info",
  description: "Get basic system information about the server",
  register(server: McpServer) {
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
};

export default systemInfoModule;