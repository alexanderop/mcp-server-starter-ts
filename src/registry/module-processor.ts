import {
  getModuleName,
  getModuleType,
  loadModule,
  logModuleLoading,
  logModuleSuccess,
  logModuleError,
  logLoadError,
  createSuccessResult,
  createErrorResult,
  type ModuleLoadResult
} from "./helpers.js";
import { isRegisterableModule } from "./types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Processes a single module file: loads it, validates it, and registers it with the MCP server
 * @param filePath - The absolute path to the module file to process
 * @param server - The MCP server instance to register the module with
 * @returns Promise resolving to a ModuleLoadResult indicating success or failure
 */
export async function processModule(filePath: string, server: McpServer): Promise<ModuleLoadResult> {
  const moduleName = getModuleName(filePath);
  
  try {
    const moduleType = getModuleType(filePath);
    logModuleLoading(moduleType, moduleName);
    
    const module = await loadModule(filePath);
    
    if (module.default === undefined) {
      logModuleError(moduleName, "does not have a default export");
      return createErrorResult(moduleName, "Missing default export");
    }
    
    if (!isRegisterableModule(module.default)) {
      logModuleError(moduleName, "does not export a valid RegisterableModule");
      return createErrorResult(moduleName, "Invalid RegisterableModule format");
    }
    
    const registerable = module.default;
    await registerable.register(server);
    logModuleSuccess(registerable.type, registerable.name);
    return createSuccessResult(registerable.name, registerable.type);
  } catch (error) {
    logLoadError(moduleName, error);
    return createErrorResult(moduleName, error);
  }
}