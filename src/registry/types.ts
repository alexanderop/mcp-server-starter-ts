/**
 * @module Registry
 * @category Core
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Zod schema for module type validation
 * @internal
 */
export const moduleTypeSchema = z.enum(["tool", "resource", "prompt"]);

/**
 * Types of modules that can be registered with the MCP server
 * @category Core
 */
export type ModuleType = z.infer<typeof moduleTypeSchema>;

/**
 * Zod schema for registerable module validation
 * @internal
 */
export const registerableModuleSchema = z.object({
  type: moduleTypeSchema,
  name: z.string(),
  description: z.string().optional(),
  register: z.function()
    .args(z.any())
    .returns(z.union([z.void(), z.promise(z.void())]))
});

/**
 * Interface for modules that can be auto-loaded and registered with the MCP server.
 * All tools, resources, and prompts must implement this interface.
 * 
 * @category Core
 * @example
 * ```typescript
 * const myTool: RegisterableModule = {
 *   type: "tool",
 *   name: "my-tool",
 *   description: "Does something useful",
 *   register(server) {
 *     server.tool(
 *       "my-tool",
 *       "Description",
 *       { input: z.string() },
 *       async (args) => {
 *         // Tool implementation
 *         return { content: [{ type: "text", text: "Result" }] };
 *       }
 *     );
 *   }
 * };
 * ```
 */
export type RegisterableModule = z.infer<typeof registerableModuleSchema> & {
  /** Registers the module with the MCP server */
  register: (server: McpServer) => void | Promise<void>;
};

/**
 * Type guard to check if a module is a valid RegisterableModule
 * @param module - The module to validate
 * @returns True if the module is a valid RegisterableModule
 * @category Core
 */
export function isRegisterableModule(module: unknown): module is RegisterableModule {
  const result = registerableModuleSchema.safeParse(module);
  return result.success;
}