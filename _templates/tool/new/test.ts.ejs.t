---
to: tests/<%= name %>.test.ts
---
import assert from "node:assert";
import { describe, it } from "node:test";
import { 
  withTestClient, 
  assertToolResponse,
  assertToolError 
} from "./helpers/test-client.ts";

describe("<%= h.changeCase.titleCase(name.replace(/-/g, ' ')) %> Tool Integration Tests", () => {
  it("should list <%= name %> tool", async () => {
    await withTestClient(async (client) => {
      const response = await client.listTools();
      const toolNames = response.tools.map(t => t.name);
      
      assert(toolNames.includes("<%= name %>"), "<%= h.changeCase.titleCase(name.replace(/-/g, ' ')) %> tool should be listed");
      
      const tool = response.tools.find(t => t.name === "<%= name %>");
      assert.strictEqual(tool?.description, "<%= description %>");
    });
  });

  it("should process valid input", async () => {
    await withTestClient(async (client) => {
      const testInput = "Test input";
      const response = await client.callTool("<%= name %>", { input: testInput });
      
      assertToolResponse(response, `Processed: ${testInput}`);
    });
  });

  it("should handle special characters", async () => {
    await withTestClient(async (client) => {
      const testInput = "Special chars: @#$%^&*() 🚀";
      const response = await client.callTool("<%= name %>", { input: testInput });
      
      assertToolResponse(response, `Processed: ${testInput}`);
    });
  });

  it("should reject missing input parameter", async () => {
    await withTestClient(async (client) => {
      await assertToolError(
        client.callTool("<%= name %>", {}),
        undefined,
        "Should reject missing input parameter"
      );
    });
  });
});