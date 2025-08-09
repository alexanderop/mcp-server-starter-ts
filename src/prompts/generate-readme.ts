import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const generateReadmeModule: RegisterableModule = {
  type: "prompt",
  name: "generate-readme",
  description: "Generate a README file for a project",
  register(server: McpServer) {
    server.prompt(
      "generate-readme",
      "Generate a README file for a project",
      () => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate a professional README.md file for a project. 
          
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