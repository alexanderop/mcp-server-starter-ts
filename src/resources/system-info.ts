import * as os from "os";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

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