/**
 * @module Prompts/GenerateReadme
 * @category Prompts
 * 
 * Professional README.md generator for various project types.
 * Creates comprehensive documentation following best practices.
 * 
 * @since 1.0.0
 */

import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import { z } from "zod";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Schema for README generator arguments with auto-completion.
 * 
 * @internal
 */
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

/**
 * README generator prompt module.
 * 
 * Generates professional README.md files tailored to specific project types
 * and documentation styles. Includes all essential sections for open-source projects.
 * 
 * @example Basic usage
 * ```typescript
 * const prompt = await client.getPrompt("generate-readme", {
 *   projectType: "typescript",
 *   style: "comprehensive"
 * });
 * // Generates a comprehensive README for a TypeScript project
 * ```
 * 
 * @example Project types supported
 * - **Language-specific**: typescript, javascript, python, rust, go, java, csharp
 * - **Application types**: web, api, library, cli-tool
 * 
 * @example Documentation styles
 * - **minimal**: Essential sections only
 * - **standard**: Common sections for most projects
 * - **comprehensive**: All recommended sections
 * - **detailed**: Extensive documentation with examples
 * 
 * @example Generated sections
 * The prompt generates READMEs with:
 * - Project title and badges
 * - Description and features
 * - Installation instructions
 * - Usage examples with code snippets
 * - API documentation (if applicable)
 * - Contributing guidelines
 * - License information
 * - Credits and acknowledgments
 * 
 * @see {@link https://www.makeareadme.com/} Best practices for README files
 * @see {@link https://github.com/othneildrew/Best-README-Template} Popular README template
 */
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
      // TypeScript automatically infers projectType and style as strings
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