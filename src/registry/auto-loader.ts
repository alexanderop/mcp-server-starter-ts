/**
 * @module Registry/AutoLoader
 * @category Registry
 * 
 * Automatic module discovery and registration system.
 * Scans the filesystem for modules and registers them with the MCP server.
 * 
 * @since 1.0.0
 */

import {
  getRootDir,
  countResults,
  formatRegistrationSummary,
  logFailedModules,
  findModuleFiles
} from "./helpers.js";
import { processModule } from "./module-processor.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Automatically discovers and registers all modules in the standard module directories.
 * 
 * This function implements a convention-over-configuration approach:
 * 1. Scans `src/tools/`, `src/resources/`, and `src/prompts/` directories
 * 2. Loads all TypeScript files as potential modules
 * 3. Validates each module against the RegisterableModule interface
 * 4. Registers valid modules with the MCP server
 * 5. Reports registration summary and any failures
 * 
 * @mermaid
 * ```mermaid
 * flowchart TD
 *     Start([Auto-Register Start]) --> Scan[Scan Module Directories]
 *     Scan --> Tools[src/tools/]
 *     Scan --> Resources[src/resources/]
 *     Scan --> Prompts[src/prompts/]
 *     
 *     Tools --> LoadFiles[Load .ts Files]
 *     Resources --> LoadFiles
 *     Prompts --> LoadFiles
 *     
 *     LoadFiles --> Validate{Valid Module?}
 *     Validate -->|Yes| Register[Register with MCP Server]
 *     Validate -->|No| Skip[Skip File]
 *     
 *     Register --> Success[✓ Module Registered]
 *     Skip --> Log[Log Warning]
 *     
 *     Success --> Summary[Report Summary]
 *     Log --> Summary
 *     Summary --> End([Complete])
 * ```
 * 
 * @param server - The MCP server instance to register modules with
 * @returns Promise that resolves when all modules are processed
 * 
 * @example Module Discovery Flow
 * ```
 * src/
 * ├── tools/
 * │   ├── echo.ts         ✓ Discovered & Registered
 * │   └── helper.ts       ✗ Not a RegisterableModule
 * ├── resources/
 * │   └── system-info.ts  ✓ Discovered & Registered
 * └── prompts/
 *     └── analyzer.ts     ✓ Discovered & Registered
 * ```
 * 
 * @example Registration Process
 * ```typescript
 * // Each module file must export a default RegisterableModule:
 * const myTool: RegisterableModule = {
 *   type: \"tool\",
 *   name: \"my-tool\",
 *   description: \"Tool description\",
 *   register(server) {
 *     server.tool(\"my-tool\", \"description\", schema, handler);
 *   }
 * };
 * export default myTool;
 * ```
 * 
 * @throws Will log errors for individual module failures but continues processing
 * @see {@link RegisterableModule} for module interface requirements
 * @see {@link processModule} for individual module processing logic
 */
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