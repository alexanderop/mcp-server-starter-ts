/**
 * @module Prompts/CodeAnalyzer
 * @category Prompts
 * 
 * Advanced code analysis prompt for security, performance, style, and bug detection.
 * Supports multiple programming languages with auto-completion for parameters.
 * 
 * @since 1.0.0
 */

import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import { z } from "zod";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Schema for code analyzer prompt arguments.
 * All fields support auto-completion for better user experience.
 * 
 * @internal
 */
const codeAnalyzerSchema = {
  code: z.string().trim().min(1).describe("Code to analyze"),
  language: completable(
    z.enum(["typescript", "javascript", "python", "rust", "go", "java"]).describe("Programming language"),
    (value) => {
      return (["typescript", "javascript", "python", "rust", "go", "java"] as const)
        .filter(lang => lang.startsWith(value.toLowerCase()));
    }
  ),
  analysisType: completable(
    z.enum(["security", "performance", "style", "bugs", "all"]).describe("Type of analysis"),
    (value) => {
      return (["security", "performance", "style", "bugs", "all"] as const)
        .filter(type => type.startsWith(value.toLowerCase()));
    }
  ),
  verbose: completable(
    z.enum(["yes", "no"]).describe("Include detailed explanations (yes/no)"),
    (value) => {
      return (["yes", "no"] as const).filter(opt => opt.startsWith(value.toLowerCase()));
    }
  ),
} as const;

/**
 * Code analyzer prompt module.
 * 
 * Provides comprehensive code analysis across multiple dimensions:
 * - **Security**: Identifies potential vulnerabilities and security risks
 * - **Performance**: Detects inefficiencies and optimization opportunities
 * - **Style**: Checks for coding standards and best practices
 * - **Bugs**: Finds logical errors and potential runtime issues
 * - **All**: Comprehensive analysis across all categories
 * 
 * @example Using the code analyzer prompt
 * ```typescript
 * const prompt = await client.getPrompt("code-analyzer", {
 *   code: "function getData() { return fetch('/api/data') }",
 *   language: "javascript",
 *   analysisType: "bugs",
 *   verbose: "yes"
 * });
 * 
 * // The prompt will analyze the code for missing error handling,
 * // async/await issues, and other potential bugs
 * ```
 * 
 * @example Supported languages
 * - TypeScript
 * - JavaScript
 * - Python
 * - Rust
 * - Go
 * - Java
 * 
 * @see {@link https://owasp.org/www-project-top-ten/} OWASP Top 10 for security analysis
 * @see {@link https://eslint.org/} ESLint for JavaScript/TypeScript style guides
 */
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