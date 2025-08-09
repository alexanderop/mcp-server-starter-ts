import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type ModuleType = "tool" | "resource" | "prompt";

export type RegisterableModule = {
  type: ModuleType;
  name: string;
  description?: string;
  register: (server: McpServer) => void;
}

export function isRegisterableModule(module: unknown): module is RegisterableModule {
  if (module === null || module === undefined || typeof module !== "object") {
    return false;
  }
  
  const mod = module as Record<string, unknown>;
  
  return (
    typeof mod.type === "string" &&
    ["tool", "resource", "prompt"].includes(mod.type) &&
    typeof mod.name === "string" &&
    typeof mod.register === "function"
  );
}