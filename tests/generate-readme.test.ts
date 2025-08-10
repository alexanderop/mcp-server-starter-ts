import assert from "node:assert";
import { describe, it } from "node:test";
import { withTestClient } from "./helpers/test-client.ts";

describe("Generate README Prompt Tests", () => {
  it("should list generate-readme prompt", async () => {
    await withTestClient(async (client) => {
      const response = await client.listPrompts();
      
      const readmePrompt = response.prompts.find(p => p.name === "generate-readme");
      
      assert(readmePrompt !== undefined, "Generate README prompt should be listed");
      assert(
        readmePrompt.description?.includes("Generate a README") ?? false,
        "Generate README prompt should have correct description"
      );
    });
  });

  it("should get generate-readme prompt with correct structure", async () => {
    await withTestClient(async (client) => {
      const response = await client.getPrompt("generate-readme", {
        projectType: "typescript",
        style: "standard"
      });
      
      // Validate response structure
      assert.strictEqual(response.messages.length, 1, "Should have exactly one message");
      
      const message = response.messages[0];
      assert(message !== undefined, "First message should exist");
      assert.strictEqual(message.role, "user", "Should be a user message");
      
      // Validate content
      assert.strictEqual(message.content.type, "text", "Content should be text type");
      
      const textContent = message.content.text;
      assert(typeof textContent === "string", "Text should be a string");
      assert(textContent.length > 0, "Text should not be empty");
      
      // Validate content includes expected sections
      const expectedSections = [
        "README",
        "Installation",
        "Usage",
        "Features",
        "Contributing",
        "License"
      ];
      
      expectedSections.forEach(section => {
        assert(
          textContent.includes(section),
          `Prompt should mention: ${section}`
        );
      });
    });
  });

  it("should handle prompt with arguments gracefully", async () => {
    await withTestClient(async (client) => {
      // The prompt now requires specific arguments
      const response = await client.getPrompt("generate-readme", {
        projectType: "javascript",
        style: "comprehensive"
      });
      
      // Should still return the same prompt structure
      assert.strictEqual(response.messages.length, 1, "Should have exactly one message");
      
      const message = response.messages[0];
      assert.strictEqual(message?.role, "user", "Should be a user message");
    });
  });

  it("should return consistent prompt across multiple calls", async () => {
    await withTestClient(async (client) => {
      const args = { projectType: "python", style: "minimal" };
      const response1 = await client.getPrompt("generate-readme", args);
      const response2 = await client.getPrompt("generate-readme", args);
      
      // Both responses should be identical
      assert.strictEqual(
        response1.messages.length,
        response2.messages.length,
        "Should have same number of messages"
      );
      
      const content1 = response1.messages[0]?.content;
      const content2 = response2.messages[0]?.content;
      
      assert(content1 !== undefined && content2 !== undefined, "Both should have content");
      assert.strictEqual(content1.type, content2.type, "Content types should match");
      
      if (content1.type === "text" && content2.type === "text") {
        assert.strictEqual(
          content1.text,
          content2.text,
          "Prompt text should be consistent"
        );
      }
    });
  });

  it("should handle concurrent prompt requests", async () => {
    await withTestClient(async (client) => {
      const args = { projectType: "rust", style: "detailed" };
      const promises = Array.from({ length: 5 }, () => 
        client.getPrompt("generate-readme", args)
      );
      
      const results = await Promise.all(promises);
      
      assert.strictEqual(results.length, 5, "Should have 5 results");
      
      // All results should be valid and identical
      const firstContent = results[0]?.messages[0]?.content;
      assert(firstContent !== undefined, "First result should have content");
      
      results.forEach((result, index) => {
        assert.strictEqual(
          result.messages.length,
          1,
          `Result ${String(index)} should have exactly one message`
        );
        
        const content = result.messages[0]?.content;
        assert(content !== undefined, `Result ${String(index)} should have content`);
        
        if (firstContent.type === "text" && content.type === "text") {
          assert.strictEqual(
            content.text,
            firstContent.text,
            `Result ${String(index)} should have identical prompt text`
          );
        }
      });
    });
  });
});