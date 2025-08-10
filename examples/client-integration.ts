/**
 * @example MCP Client Integration
 * 
 * This example demonstrates how to connect to and interact
 * with your MCP server from a client application.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

/**
 * Example: Creating an MCP client and calling tools
 */
async function connectToMCPServer(): Promise<void> {
  // Spawn the MCP server process
  const serverProcess = spawn("node", ["build/index.js"], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  // Create client with stdio transport
  const client = new Client({
    name: "example-client",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    inputStream: serverProcess.stdout,
    outputStream: serverProcess.stdin,
  });

  // Connect to the server
  await client.connect(transport);

  try {
    // List available tools
    const tools = await client.listTools();
    console.log("Available tools:", tools);

    // Call the echo tool
    const echoResult = await client.callTool("echo", {
      text: "Hello from MCP client!",
    });
    console.log("Echo result:", echoResult);

    // Get a resource
    const systemInfo = await client.getResource("system://info");
    console.log("System info:", JSON.parse(systemInfo.contents[0].text));

    // Get a timestamp in different formats
    const isoTimestamp = await client.getResource("timestamp://iso");
    console.log("ISO timestamp:", isoTimestamp.contents[0].text);

    // Use a prompt
    const prompt = await client.getPrompt("code-analyzer", {
      code: "function add(a, b) { return a + b }",
      language: "javascript",
      analysisType: "all",
      verbose: "no",
    });
    console.log("Analysis prompt generated:", prompt);

  } finally {
    // Clean up
    await client.close();
    serverProcess.kill();
  }
}

/**
 * Example: Error handling and retries
 */
async function robustClientConnection(): Promise<void> {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      await connectToMCPServer();
      break;
    } catch (error) {
      retryCount++;
      console.error(`Connection attempt ${retryCount} failed:`, error);
      
      if (retryCount >= maxRetries) {
        throw new Error("Failed to connect after maximum retries");
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  robustClientConnection().catch(console.error);
}