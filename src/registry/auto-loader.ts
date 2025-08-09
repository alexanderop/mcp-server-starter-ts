import * as path from "node:path";
import { pathToFileURL } from "node:url";
import fastGlob from "fast-glob";
import { isRegisterableModule } from "./types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export async function autoRegisterModules(server: McpServer): Promise<void> {
  const rootDir = path.dirname(path.dirname(new URL(import.meta.url).pathname));
  
  const patterns = [
    path.join(rootDir, "tools", "*.js"),
    path.join(rootDir, "resources", "*.js"),
    path.join(rootDir, "prompts", "*.js"),
  ];

  console.error("Auto-registering modules from:", patterns);

  const files = await fastGlob(patterns, {
    absolute: true,
    onlyFiles: true,
  });

  console.error(`Found ${String(files.length)} module files to register`);

  const results = await Promise.allSettled(
    files.map(async (filePath) => {
      try {
        const fileUrl = pathToFileURL(filePath).href;
        const moduleName = path.basename(filePath, ".js");
        const moduleType = path.basename(path.dirname(filePath));
        
        console.error(`Loading ${moduleType}/${moduleName}...`);
        
        const module = await import(fileUrl) as { default?: unknown };
        
        if (module.default !== undefined && isRegisterableModule(module.default)) {
          const registerable = module.default;
          registerable.register(server);
          console.error(`✓ Registered ${registerable.type}: ${registerable.name}`);
          return { success: true, name: registerable.name, type: registerable.type };
        } else if (typeof module.default === "function") {
          const legacyRegister = module.default as (server: McpServer) => void;
          legacyRegister(server);
          console.error(`✓ Registered legacy module: ${moduleName}`);
          return { success: true, name: moduleName, type: moduleType, legacy: true };
        } else {
          console.error(`✗ Module ${moduleName} does not export a valid registration`);
          return { success: false, name: moduleName, error: "Invalid module export" };
        }
      } catch (error) {
        const moduleName = path.basename(filePath, ".js");
        console.error(`✗ Failed to load ${moduleName}:`, error);
        return { success: false, name: moduleName, error };
      }
    })
  );

  const successful = results.filter((r) => {
    if (r.status === "rejected") return false;
    return r.value.success;
  }).length;
  const failed = results.filter((r) => {
    if (r.status === "rejected") return true;
    return !r.value.success;
  }).length;
  
  console.error(`\nRegistration complete: ${String(successful)} successful, ${String(failed)} failed`);
  
  if (failed > 0) {
    console.error("Failed modules:");
    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error(`  - Error: ${String(result.reason)}`);
      } else if (!result.value.success) {
        console.error(`  - ${result.value.name}: ${String(result.value.error)}`);
      }
    });
  }
}