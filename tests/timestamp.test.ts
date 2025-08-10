import assert from "node:assert";
import { describe, it } from "node:test";
import { 
  withTestClient, 
  assertResourceContent
} from "./helpers/test-client.ts";

describe("Timestamp Resource Tests", () => {
  it("should list all timestamp resource variants", async () => {
    await withTestClient(async (client) => {
      const response = await client.listResources();
      
      const timestampResources = response.resources.filter(r => r.uri.startsWith("timestamp://"));
      
      assert.strictEqual(timestampResources.length, 3, "Should have 3 timestamp variants");
      
      const uris = timestampResources.map(r => r.uri).sort();
      assert.deepStrictEqual(uris, [
        "timestamp://iso",
        "timestamp://readable", 
        "timestamp://unix"
      ]);
      
      // Check names
      const isoResource = timestampResources.find(r => r.uri === "timestamp://iso");
      assert(isoResource !== undefined, "ISO resource should exist");
      assert.strictEqual(isoResource.name, "ISO 8601 format");
      
      const unixResource = timestampResources.find(r => r.uri === "timestamp://unix");
      assert(unixResource !== undefined, "Unix resource should exist");
      assert.strictEqual(unixResource.name, "Unix timestamp");
      
      const readableResource = timestampResources.find(r => r.uri === "timestamp://readable");
      assert(readableResource !== undefined, "Readable resource should exist");
      assert.strictEqual(readableResource.name, "Human-readable format");
    });
  });

  it("should return ISO 8601 formatted timestamp", async () => {
    await withTestClient(async (client) => {
      const response = await client.readResource("timestamp://iso");
      
      assertResourceContent(response, {
        uri: "timestamp://iso",
        mimeType: "text/plain",
        contentValidator: (text) => {
          // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
          const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
          assert(
            isoRegex.test(text),
            `Timestamp should be in ISO 8601 format, got: ${text}`
          );
          
          // Verify it's a valid date and close to current time
          const timestamp = Date.parse(text);
          assert(!isNaN(timestamp), "Should be a valid date");
          
          const now = Date.now();
          const diff = Math.abs(now - timestamp);
          assert(diff < 5000, "Timestamp should be within 5 seconds of current time");
        }
      });
    });
  });

  it("should return Unix timestamp", async () => {
    await withTestClient(async (client) => {
      const response = await client.readResource("timestamp://unix");
      
      assertResourceContent(response, {
        uri: "timestamp://unix",
        mimeType: "text/plain",
        contentValidator: (text) => {
          // Unix timestamp should be all digits
          assert(/^\d+$/.test(text), `Unix timestamp should be numeric, got: ${text}`);
          
          const timestamp = parseInt(text, 10);
          assert(!isNaN(timestamp), "Should be a valid number");
          
          // Verify it's in a reasonable range (after year 2020, before year 2100)
          const year2020 = 1577836800;
          const year2100 = 4102444800;
          assert(
            timestamp > year2020 && timestamp < year2100,
            `Timestamp should be between 2020 and 2100, got: ${String(timestamp)}`
          );
          
          // Check it's close to current time
          const now = Math.floor(Date.now() / 1000);
          const diff = Math.abs(now - timestamp);
          assert(diff < 5, "Unix timestamp should be within 5 seconds of current time");
        }
      });
    });
  });

  it("should return human-readable timestamp", async () => {
    await withTestClient(async (client) => {
      const response = await client.readResource("timestamp://readable");
      
      assertResourceContent(response, {
        uri: "timestamp://readable",
        mimeType: "text/plain",
        contentValidator: (text) => {
          // Should be a non-empty string
          assert(text.length > 0, "Readable timestamp should not be empty");
          
          assert(/\d/.test(text), "Should contain numeric date components");
        }
      });
    });
  });

  it("should handle unknown format gracefully", async () => {
    await withTestClient(async (client) => {
      const response = await client.readResource("timestamp://invalid");
      
      assertResourceContent(response, {
        uri: "timestamp://invalid",
        mimeType: "text/plain",
        contentValidator: (text) => {
          assert(
            text.includes("Unknown format"),
            `Should indicate unknown format, got: ${text}`
          );
          assert(
            text.includes("iso") && text.includes("unix") && text.includes("readable"),
            "Should list valid format options"
          );
        }
      });
    });
  });

  it("should return different timestamps on subsequent calls", async () => {
    await withTestClient(async (client) => {
      const response1 = await client.readResource("timestamp://unix");
      const content1 = response1.contents[0];
      assert(content1?.text !== undefined && typeof content1.text === "string", "Should have content");
      const timestamp1 = parseInt(content1.text, 10);
      
      // Wait a bit to ensure time has passed
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const response2 = await client.readResource("timestamp://unix");
      const content2 = response2.contents[0];
      assert(content2?.text !== undefined && typeof content2.text === "string", "Should have content");
      const timestamp2 = parseInt(content2.text, 10);
      
      assert(timestamp2 > timestamp1, "Second timestamp should be later than first");
      assert(timestamp2 - timestamp1 >= 1, "Timestamps should be at least 1 second apart");
    });
  });

  it("should handle concurrent timestamp requests", async () => {
    await withTestClient(async (client) => {
      const formats = ["iso", "unix", "readable"];
      const promises = formats.map(format => 
        client.readResource(`timestamp://${format}`)
      );
      
      const results = await Promise.all(promises);
      
      assert.strictEqual(results.length, 3, "Should have 3 results");
      
      // All should be valid timestamps
      results.forEach((result, index) => {
        const format = formats[index];
        assert(format !== undefined, "Format should be defined");
        const content = result.contents[0];
        assert(content?.text !== undefined && typeof content.text === "string", `${format} should have content`);
        
        if (format === "iso") {
          const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
          assert(isoRegex.test(content.text), "ISO format should be valid");
        } else if (format === "unix") {
          assert(/^\d+$/.test(content.text), "Unix format should be numeric");
        } else {
          assert(content.text.length > 0, "Readable format should not be empty");
        }
      });
    });
  });
});