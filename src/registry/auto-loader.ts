import {
  getRootDir,
  countResults,
  formatRegistrationSummary,
  logFailedModules,
  findModuleFiles
} from "./helpers.js";
import { processModule } from "./module-processor.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export async function autoRegisterModules(server: McpServer): Promise<void> {
  const rootDir = getRootDir(import.meta.url);
  const files = await findModuleFiles(rootDir);

  const results = await Promise.allSettled(
    files.map(filePath => processModule(filePath, server))
  );

  const { successful, failed } = countResults(results);
  console.error(formatRegistrationSummary(successful, failed));
  
  if (failed > 0) {
    logFailedModules(results);
  }
}