import { z } from "zod";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const echoModule: RegisterableModule = {
  type: "tool",
  name: "echo",
  description: "Echo back the provided text",
  register(server: McpServer) {
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
};

export default echoModule;