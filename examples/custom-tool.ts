/**
 * @example Custom Tool Implementation
 * 
 * This example demonstrates how to create a custom tool
 * that can be auto-discovered by the MCP server.
 */

import { z } from "zod";
import type { RegisterableModule } from "../src/registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Example: Calculator tool that performs basic arithmetic operations
 */
const calculatorModule: RegisterableModule = {
  type: "tool",
  name: "calculator",
  description: "Perform basic arithmetic operations",
  
  register(server: McpServer) {
    server.tool(
      "calculator",
      "Perform basic arithmetic operations",
      {
        operation: z.enum(["add", "subtract", "multiply", "divide"])
          .describe("The operation to perform"),
        a: z.number().describe("First operand"),
        b: z.number().describe("Second operand"),
      },
      async (args) => {
        const { operation, a, b } = args;
        let result: number;
        
        switch (operation) {
          case "add":
            result = a + b;
            break;
          case "subtract":
            result = a - b;
            break;
          case "multiply":
            result = a * b;
            break;
          case "divide":
            if (b === 0) {
              throw new Error("Division by zero is not allowed");
            }
            result = a / b;
            break;
        }
        
        return {
          content: [
            {
              type: "text",
              text: `${a} ${operation} ${b} = ${result}`,
            },
          ],
        };
      }
    );
  }
};

export default calculatorModule;