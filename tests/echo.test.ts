import assert from "node:assert";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Echo Tool Integration Tests", () => {
  let client: Client;
  let transport: StdioClientTransport;

  async function setupClient(): Promise<void> {
    client = new Client(
      {
        name: "test-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    // Determine the correct path based on where test is running from
    const serverPath = __dirname.includes("build")
      ? path.join(__dirname, "..", "index.js")
      : path.join(__dirname, "..", "build", "index.js");
    
    transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
      stderr: "ignore",
    });

    await client.connect(transport);
  }

  async function teardownClient(): Promise<void> {
    if (client) {
      await client.close();
    }
  }

  it("should list echo tool", async () => {
    await setupClient();
    
    try {
      const response = await client.listTools();
      const toolNames = response.tools.map(t => t.name);
      
      assert(toolNames.includes("echo"), "Echo tool should be listed");
      
      const echoTool = response.tools.find(t => t.name === "echo");
      assert.strictEqual(echoTool?.description, "Echo back the provided text");
    } finally {
      await teardownClient();
    }
  });

  it("should echo valid text", async () => {
    await setupClient();
    
    try {
      const testText = "Hello, MCP!";
      const response = await client.callTool({
        name: "echo",
        arguments: {
          text: testText,
        },
      }) as CallToolResult;

      assert(response.content.length > 0, "Response should have content");
      assert.strictEqual(response.content[0]?.type, "text");
      assert.strictEqual((response.content[0] as any)?.text, testText);
      assert.strictEqual(response.isError, undefined, "Should not be an error");
    } finally {
      await teardownClient();
    }
  });

  it("should handle unicode and special characters", async () => {
    await setupClient();
    
    try {
      const testText = "🚀 Unicode! Special chars: @#$%^&*() 日本語";
      const response = await client.callTool({
        name: "echo",
        arguments: {
          text: testText,
        },
      }) as CallToolResult;

      assert.strictEqual((response.content[0] as any)?.text, testText);
    } finally {
      await teardownClient();
    }
  });

  it("should handle long text", async () => {
    await setupClient();
    
    try {
      const testText = "Lorem ipsum ".repeat(100);
      const response = await client.callTool({
        name: "echo",
        arguments: {
          text: testText,
        },
      }) as CallToolResult;

      assert.strictEqual((response.content[0] as any)?.text, testText);
    } finally {
      await teardownClient();
    }
  });

  it("should reject empty string", async () => {
    await setupClient();
    
    try {
      await assert.rejects(
        async () => {
          await client.callTool({
            name: "echo",
            arguments: {
              text: "",
            },
          });
        },
        (error: any) => {
          // Check if error message contains validation error about empty text
          return error.message?.includes("Text cannot be empty");
        },
        "Should reject empty text with validation error"
      );
    } finally {
      await teardownClient();
    }
  });

  it("should reject missing text parameter", async () => {
    await setupClient();
    
    try {
      await assert.rejects(
        async () => {
          await client.callTool({
            name: "echo",
            arguments: {},
          });
        },
        "Should reject missing text parameter"
      );
    } finally {
      await teardownClient();
    }
  });

  it("should handle concurrent echo calls", async () => {
    await setupClient();
    
    try {
      const texts = ["First", "Second", "Third", "Fourth", "Fifth"];
      const promises = texts.map(text => 
        client.callTool({
          name: "echo",
          arguments: { text },
        })
      );

      const results = await Promise.all(promises) as Array<CallToolResult>;
      
      assert.strictEqual(results.length, texts.length);
      results.forEach((result, index) => {
        assert.strictEqual((result.content[0] as any)?.text, texts[index]);
      });
    } finally {
      await teardownClient();
    }
  });

  it("should maintain server connection across multiple calls", async () => {
    await setupClient();
    
    try {
      // First call
      const response1 = await client.callTool({
        name: "echo",
        arguments: { text: "First call" },
      }) as CallToolResult;
      assert.strictEqual((response1.content[0] as any)?.text, "First call");

      // Second call on same connection
      const response2 = await client.callTool({
        name: "echo",
        arguments: { text: "Second call" },
      }) as CallToolResult;
      assert.strictEqual((response2.content[0] as any)?.text, "Second call");

      // Verify connection is still alive
      await client.ping();
    } finally {
      await teardownClient();
    }
  });
});