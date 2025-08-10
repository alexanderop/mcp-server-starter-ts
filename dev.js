#!/usr/bin/env node

/**
 * Development script for testing MCP server via stdio
 * Usage: npm run dev
 * 
 * This script starts the MCP server and allows you to interact with it by
 * typing or pasting JSON-RPC messages directly into the terminal.
 * 
 * Example messages you can paste:
 * 
 * Initialize:
 * {"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"1.0.0","capabilities":{},"clientInfo":{"name":"dev-client","version":"1.0.0"}},"id":1}
 * 
 * List tools:
 * {"jsonrpc":"2.0","method":"tools/list","params":{},"id":2}
 * 
 * Call echo tool:
 * {"jsonrpc":"2.0","method":"tools/call","params":{"name":"echo","arguments":{"text":"Hello World"}},"id":3}
 */

import { spawn } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for better terminal output
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';

console.log(`${CYAN}🚀 Starting MCP Server in development mode...${RESET}`);
console.log(`${DIM}You can now paste JSON-RPC messages to interact with the server.${RESET}\n`);

// Start the MCP server
const serverPath = join(__dirname, 'build', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `${GREEN}mcp> ${RESET}`
});

// Buffer for multi-line JSON input
let jsonBuffer = '';
let braceCount = 0;

// Handle server stdout (responses from MCP server)
server.stdout.on('data', (data) => {
  const response = data.toString();
  try {
    const json = JSON.parse(response);
    console.log(`${YELLOW}← Response:${RESET}`);
    console.log(JSON.stringify(json, null, 2));
  } catch {
    // Not JSON, just print as-is
    console.log(`${YELLOW}← Server:${RESET} ${response}`);
  }
  rl.prompt();
});

// Handle server stderr (debug messages)
server.stderr.on('data', (data) => {
  console.error(`${DIM}[Server Log] ${data.toString().trim()}${RESET}`);
  rl.prompt();
});

// Handle server exit
server.on('close', (code) => {
  console.log(`${RED}Server exited with code ${code}${RESET}`);
  process.exit(code);
});

// Print example commands
console.log(`${CYAN}Example commands:${RESET}`);
console.log(`${DIM}1. Initialize connection:${RESET}`);
console.log('   {"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"1.0.0","capabilities":{},"clientInfo":{"name":"dev-client","version":"1.0.0"}},"id":1}\n');
console.log(`${DIM}2. List available tools:${RESET}`);
console.log('   {"jsonrpc":"2.0","method":"tools/list","params":{},"id":2}\n');
console.log(`${DIM}3. Call echo tool:${RESET}`);
console.log('   {"jsonrpc":"2.0","method":"tools/call","params":{"name":"echo","arguments":{"text":"Hello World"}},"id":3}\n');
console.log(`${DIM}Type 'exit' or press Ctrl+C to quit${RESET}\n`);

rl.prompt();

// Handle user input
rl.on('line', (line) => {
  const trimmed = line.trim();
  
  // Handle exit commands
  if (trimmed === 'exit' || trimmed === 'quit') {
    console.log(`${CYAN}Goodbye!${RESET}`);
    server.kill();
    process.exit(0);
  }
  
  // Handle help command
  if (trimmed === 'help') {
    console.log(`${CYAN}Available commands:${RESET}`);
    console.log('  help  - Show this help message');
    console.log('  clear - Clear the screen');
    console.log('  exit  - Exit the dev server');
    console.log('\nPaste JSON-RPC messages to interact with the MCP server.');
    rl.prompt();
    return;
  }
  
  // Handle clear command
  if (trimmed === 'clear') {
    console.clear();
    rl.prompt();
    return;
  }
  
  // Build JSON buffer for multi-line input
  jsonBuffer += trimmed;
  
  // Count braces to detect complete JSON
  for (const char of trimmed) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }
  
  // If we have a complete JSON object, send it
  if (braceCount === 0 && jsonBuffer.length > 0) {
    try {
      // Validate JSON
      const json = JSON.parse(jsonBuffer);
      
      // Send to server
      console.log(`${GREEN}→ Request:${RESET}`);
      console.log(JSON.stringify(json, null, 2));
      server.stdin.write(JSON.stringify(json) + '\n');
      
      // Reset buffer
      jsonBuffer = '';
    } catch (error) {
      console.error(`${RED}Invalid JSON: ${error.message}${RESET}`);
      console.log(`${DIM}Buffer cleared. Please try again.${RESET}`);
      jsonBuffer = '';
      braceCount = 0;
    }
  } else if (braceCount > 0) {
    // Multi-line JSON input, continue on next line
    rl.setPrompt(`${DIM}...> ${RESET}`);
  }
  
  rl.prompt();
});

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log(`\n${CYAN}Shutting down...${RESET}`);
  server.kill();
  process.exit(0);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error(`${RED}Error: ${error.message}${RESET}`);
  server.kill();
  process.exit(1);
});