import * as path from "node:path";
import { pathToFileURL } from "node:url";
import fastGlob from "fast-glob";

/**
 * Extracts the module name from a file path by removing the .js extension
 * @param filePath - The full path to the module file
 * @returns The module name without extension
 */
export function getModuleName(filePath: string): string {
  return path.basename(filePath, ".js");
}

/**
 * Extracts the module type from a file path based on its parent directory
 * @param filePath - The full path to the module file
 * @returns The module type (e.g., "tools", "resources", "prompts")
 */
export function getModuleType(filePath: string): string {
  return path.basename(path.dirname(filePath));
}

/**
 * Converts a file system path to a file:// URL for dynamic imports
 * @param filePath - The file system path to convert
 * @returns A file:// URL string
 */
export function filePathToUrl(filePath: string): string {
  return pathToFileURL(filePath).href;
}

/**
 * Generates glob patterns for finding module files in standard directories
 * @param rootDir - The root directory to search from
 * @returns Array of glob patterns for module discovery
 */
export function getModulePatterns(rootDir: string): Array<string> {
  return [
    path.join(rootDir, "tools", "*.js"),
    path.join(rootDir, "resources", "*.js"),
    path.join(rootDir, "prompts", "*.js"),
  ];
}

/**
 * Extracts the root directory from an import.meta.url
 * @param importMetaUrl - The import.meta.url from the calling module
 * @returns The root directory path
 */
export function getRootDir(importMetaUrl: string): string {
  return path.dirname(path.dirname(new URL(importMetaUrl).pathname));
}

/**
 * Checks if a Promise settled result represents a successful module load
 * @param result - The Promise settled result to check
 * @returns True if the module loaded successfully
 */
export function isSuccessfulResult(result: PromiseSettledResult<{ success: boolean }>): boolean {
  if (result.status === "rejected") return false;
  return result.value.success;
}

/**
 * Checks if a Promise settled result represents a failed module load
 * @param result - The Promise settled result to check
 * @returns True if the module failed to load
 */
export function isFailedResult(result: PromiseSettledResult<{ success: boolean }>): boolean {
  if (result.status === "rejected") return true;
  return !result.value.success;
}

/**
 * Counts successful and failed results from an array of Promise settled results
 * @param results - Array of Promise settled results to count
 * @returns Object with successful and failed counts
 */
export function countResults(
  results: Array<PromiseSettledResult<{ success: boolean }>>
): { successful: number; failed: number } {
  const successful = results.filter(isSuccessfulResult).length;
  const failed = results.filter(isFailedResult).length;
  return { successful, failed };
}

/**
 * Formats a human-readable registration summary message
 * @param successful - Number of successful registrations
 * @param failed - Number of failed registrations
 * @returns Formatted summary string
 */
export function formatRegistrationSummary(successful: number, failed: number): string {
  return `\nRegistration complete: ${String(successful)} successful, ${String(failed)} failed`;
}

/**
 * Formats module information for logging
 * @param moduleType - The type of module (e.g., "tools")
 * @param moduleName - The name of the module
 * @returns Formatted string like "tools/echo"
 */
export function formatModuleInfo(moduleType: string, moduleName: string): string {
  return `${moduleType}/${moduleName}`;
}

/**
 * Type definition for module load results
 */
export type ModuleLoadResult = {
  success: boolean;
  name: string;
  type?: string;
  error?: unknown;
};

/**
 * Dynamically imports a module from a file path
 * @param filePath - The path to the module file
 * @returns Promise resolving to the imported module
 */
export async function loadModule(filePath: string): Promise<{ default?: unknown }> {
  const fileUrl = filePathToUrl(filePath);
  return await import(fileUrl) as { default?: unknown };
}

/**
 * Logs that a module is being loaded
 * @param moduleType - The type of module being loaded
 * @param moduleName - The name of the module being loaded
 */
export function logModuleLoading(moduleType: string, moduleName: string): void {
  console.error(`Loading ${formatModuleInfo(moduleType, moduleName)}...`);
}

/**
 * Logs successful module registration
 * @param type - The type of module that was registered
 * @param name - The name of the module that was registered
 */
export function logModuleSuccess(type: string, name: string): void {
  console.error(`✓ Registered ${type}: ${name}`);
}

/**
 * Logs a module error with a custom error message
 * @param moduleName - The name of the module that had an error
 * @param error - The error message to display
 */
export function logModuleError(moduleName: string, error: string): void {
  console.error(`✗ Module ${moduleName} ${error}`);
}

/**
 * Logs a module load failure with the full error
 * @param moduleName - The name of the module that failed to load
 * @param error - The error object or message
 */
export function logLoadError(moduleName: string, error: unknown): void {
  console.error(`✗ Failed to load ${moduleName}:`, error);
}

/**
 * Logs the number of module files found
 * @param count - The number of files found
 */
export function logFoundFiles(count: number): void {
  console.error(`Found ${String(count)} module files to register`);
}

/**
 * Logs the patterns being used for auto-registration
 * @param patterns - Array of glob patterns being searched
 */
export function logAutoRegistering(patterns: Array<string>): void {
  console.error("Auto-registering modules from:", patterns);
}

/**
 * Logs details about all failed modules
 * @param results - Array of Promise settled results containing module load results
 */
export function logFailedModules(results: Array<PromiseSettledResult<ModuleLoadResult>>): void {
  console.error("Failed modules:");
  results.filter(isFailedResult).forEach((result) => {
    if (result.status === "rejected") {
      console.error(`  - Error: ${String(result.reason)}`);
      return;
    }
    
    if (!result.value.success) {
      console.error(`  - ${result.value.name}: ${String(result.value.error)}`);
    }
  });
}

/**
 * Finds all module files in the standard module directories
 * @param rootDir - The root directory to search from
 * @returns Promise resolving to array of absolute file paths
 */
export async function findModuleFiles(rootDir: string): Promise<Array<string>> {
  const patterns = getModulePatterns(rootDir);
  logAutoRegistering(patterns);
  
  const files = await fastGlob(patterns, {
    absolute: true,
    onlyFiles: true,
  });
  
  logFoundFiles(files.length);
  return files;
}

/**
 * Creates a successful module load result
 * @param name - The name of the successfully loaded module
 * @param type - The type of the successfully loaded module
 * @returns A success result object
 */
export function createSuccessResult(name: string, type: string): ModuleLoadResult {
  return { success: true, name, type };
}

/**
 * Creates a failed module load result
 * @param name - The name of the module that failed to load
 * @param error - The error that occurred
 * @returns A failure result object
 */
export function createErrorResult(name: string, error: unknown): ModuleLoadResult {
  return { success: false, name, error };
}