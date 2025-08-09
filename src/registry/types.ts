import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Define Zod enum for ModuleType
export const moduleTypeSchema = z.enum(["tool", "resource", "prompt"]);
export type ModuleType = z.infer<typeof moduleTypeSchema>;

// Define Zod schema for RegisterableModule
export const registerableModuleSchema = z.object({
  type: moduleTypeSchema,
  name: z.string(),
  description: z.string().optional(),
  register: z.function()
    .args(z.any()) // McpServer type is complex, using any for the argument
    .returns(z.union([z.void(), z.promise(z.void())])) // Support both sync and async
});

export type RegisterableModule = z.infer<typeof registerableModuleSchema> & {
  register: (server: McpServer) => void | Promise<void>;
};

export function isRegisterableModule(module: unknown): module is RegisterableModule {
  const result = registerableModuleSchema.safeParse(module);
  return result.success;
}