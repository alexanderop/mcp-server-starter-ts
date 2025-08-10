---
to: tests/<%= name %>.test.ts
---
import assert from "node:assert";
import { describe, it } from "node:test";
import { withTestClient } from "./helpers/test-client.ts";

describe("<%= h.changeCase.titleCase(name.replace(/-/g, ' ')) %> Prompt Integration Tests", () => {
  it("should list <%= name %> prompt", async () => {
    await withTestClient(async (client) => {
      const response = await client.listPrompts();
      const promptNames = response.prompts.map(p => p.name);
      
      assert(promptNames.includes("<%= name %>"), "<%= h.changeCase.titleCase(name.replace(/-/g, ' ')) %> prompt should be listed");
      
      const prompt = response.prompts.find(p => p.name === "<%= name %>");
      assert.strictEqual(prompt?.description, "<%= description %>");
    });
  });

  it("should generate prompt with valid topic", async () => {
    await withTestClient(async (client) => {
      const testTopic = "test topic";
      const response = await client.getPrompt("<%= name %>", { topic: testTopic });
      
      assert(response.messages !== undefined, "Response should have messages");
      assert(response.messages.length > 0, "Response should have at least one message");
      
      const firstMessage = response.messages[0];
      assert.strictEqual(firstMessage?.role, "user", "First message should be from user");
      
      const content = firstMessage?.content;
      assert(content !== undefined, "Message should have content");
      
      if (typeof content === "object" && "type" in content && content.type === "text" && "text" in content) {
        assert(content.text.includes(testTopic), "Prompt should include the topic");
        assert(content.text.includes("<%= description %>"), "Prompt should include the description");
      } else {
        assert.fail("Content should be a text object");
      }
    });
  });

  it("should handle special characters in topic", async () => {
    await withTestClient(async (client) => {
      const testTopic = "Special chars: @#$%^&*() 🚀";
      const response = await client.getPrompt("<%= name %>", { topic: testTopic });
      
      assert(response.messages !== undefined, "Response should have messages");
      const firstMessage = response.messages[0];
      const content = firstMessage?.content;
      
      if (typeof content === "object" && "type" in content && content.type === "text" && "text" in content) {
        assert(content.text.includes(testTopic), "Prompt should handle special characters");
      }
    });
  });
});