import assert from "node:assert";
import { describe, it } from "node:test";
import { 
  withTestClient, 
  assertToolResponse,
  assertToolError 
} from "./helpers/test-client.ts";

describe("Echo Tool Integration Tests", () => {
  it("should list echo tool", async () => {
    await withTestClient(async (client) => {
      const response = await client.listTools();
      const toolNames = response.tools.map(t => t.name);
      
      assert(toolNames.includes("echo"), "Echo tool should be listed");
      
      const echoTool = response.tools.find(t => t.name === "echo");
      assert.strictEqual(echoTool?.description, "Echo back the provided text");
    });
  });

  it("should echo valid text", async () => {
    await withTestClient(async (client) => {
      const testText = "Hello, MCP!";
      const response = await client.callTool("echo", { text: testText });
      
      assertToolResponse(response, testText);
    });
  });

  it("should handle unicode and special characters", async () => {
    await withTestClient(async (client) => {
      const testText = "🚀 Unicode! Special chars: @#$%^&*() 日本語";
      const response = await client.callTool("echo", { text: testText });
      
      assertToolResponse(response, testText);
    });
  });

  it("should handle long text", async () => {
    await withTestClient(async (client) => {
      const testText = "Lorem ipsum ".repeat(100);
      const response = await client.callTool("echo", { text: testText });
      
      assertToolResponse(response, testText);
    });
  });

  it("should reject empty string", async () => {
    await withTestClient(async (client) => {
      await assertToolError(
        client.callTool("echo", { text: "" }),
        "Text cannot be empty",
        "Should reject empty text with validation error"
      );
    });
  });

  it("should reject missing text parameter", async () => {
    await withTestClient(async (client) => {
      await assertToolError(
        client.callTool("echo", {}),
        undefined,
        "Should reject missing text parameter"
      );
    });
  });

  it("should handle concurrent echo calls", async () => {
    await withTestClient(async (client) => {
      const texts = ["First", "Second", "Third", "Fourth", "Fifth"];
      const promises = texts.map(text => 
        client.callTool("echo", { text })
      );

      const results = await Promise.all(promises);
      
      assert.strictEqual(results.length, texts.length);
      results.forEach((result, index) => {
        const expectedText = texts[index];
        if (expectedText !== undefined) {
          assertToolResponse(result, expectedText);
        }
      });
    });
  });

  it("should maintain server connection across multiple calls", async () => {
    await withTestClient(async (client) => {
      // First call
      const response1 = await client.callTool("echo", { text: "First call" });
      assertToolResponse(response1, "First call");

      // Second call on same connection
      const response2 = await client.callTool("echo", { text: "Second call" });
      assertToolResponse(response2, "Second call");

      // Verify connection is still alive
      await client.ping();
    });
  });
});