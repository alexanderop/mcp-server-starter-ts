import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import { z } from "zod";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Define your schema with proper types - prompts only support string arguments
const codeAnalyzerSchema = {
  code: z.string().min(1).describe("Code to analyze"),
  language: completable(
    z.string().describe("Programming language"),
    (value) => {
      return ["typescript", "javascript", "python", "rust", "go", "java"]
        .filter(lang => lang.startsWith(value.toLowerCase()));
    }
  ),
  analysisType: completable(
    z.string().describe("Type of analysis"),
    (value) => {
      return ["security", "performance", "style", "bugs", "all"]
        .filter(type => type.startsWith(value.toLowerCase()));
    }
  ),
  verbose: completable(
    z.string().describe("Include detailed explanations (yes/no)"),
    (value) => {
      return ["yes", "no"].filter(opt => opt.startsWith(value.toLowerCase()));
    }
  ),
} as const;

// TypeScript will automatically infer the types from the schema
const codeAnalyzerModule: RegisterableModule = {
  type: "prompt",
  name: "code-analyzer",
  description: "Analyze code for issues and improvements",
  register(server: McpServer) {
    server.registerPrompt(
      "code-analyzer",
      {
        title: "Code Analyzer",
        description: "Analyze code for security, performance, style issues, and bugs",
        argsSchema: codeAnalyzerSchema,
      },
      ({ code, language, analysisType, verbose }) => {
        const analysisPrompt = analysisType === "all" 
          ? "Analyze this code for security issues, performance problems, style violations, and bugs"
          : `Analyze this code specifically for ${analysisType} issues`;
        
        const isExpanded = verbose.toLowerCase() === "yes";
        
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `${analysisPrompt}.
                
Language: ${language}
Verbose: ${isExpanded ? "Yes, provide detailed explanations" : "No, be concise"}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Issues found (if any)
2. Severity level for each issue
3. Recommended fixes
${isExpanded ? "4. Detailed explanation of why each issue matters" : ""}`,
              },
            },
          ],
        };
      }
    );
  }
};

export default codeAnalyzerModule;