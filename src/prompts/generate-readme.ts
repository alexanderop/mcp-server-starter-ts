import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import { z } from "zod";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const argsSchema = {
  projectType: completable(
    z.string().describe("Type of project"),
    (value) => {
      return [
        "typescript",
        "javascript",
        "python",
        "rust",
        "go",
        "java",
        "csharp",
        "web",
        "api",
        "library",
        "cli-tool",
      ].filter(t => t.toLowerCase().startsWith(value.toLowerCase()));
    }
  ),
  style: completable(
    z.string().describe("README style"),
    (value) => {
      return ["minimal", "standard", "comprehensive", "detailed"]
        .filter(s => s.toLowerCase().startsWith(value.toLowerCase()));
    }
  ),
} as const;

const generateReadmeModule: RegisterableModule = {
  type: "prompt",
  name: "generate-readme",
  description: "Generate a README file for a project",
  register(server: McpServer) {
    server.registerPrompt(
      "generate-readme",
      {
        title: "Generate README",
        description: "Generate a README file for a project",
        argsSchema,
      },
      ({ projectType, style }) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a professional README.md file for a ${projectType} project with ${style} style. 
          
Provide a comprehensive README with the following sections:
- Project title and description
- Installation instructions
- Usage examples
- Features list
- Contributing guidelines
- License information`,
            },
          },
        ],
      })
    );
  }
};

export default generateReadmeModule;