import assert from "node:assert";
import { describe, it } from "node:test";
import { 
  withTestClient, 
  assertJSONResource
} from "./helpers/test-client.ts";

type SystemInfo = {
  platform: string;
  architecture: string;
  nodeVersion: string;
  uptime: number;
  totalMemory: number;
  freeMemory: number;
};

describe("System Info Resource Tests", () => {
  it("should list system-info resource", async () => {
    await withTestClient(async (client) => {
      const response = await client.listResources();
      
      const systemInfoResource = response.resources.find(r => r.uri === "system://info");
      
      assert(systemInfoResource !== undefined, "System info resource should be listed");
      assert.strictEqual(systemInfoResource.name, "System Information");
      assert.strictEqual(
        systemInfoResource.description, 
        "Get basic system information about the server"
      );
    });
  });

  it("should read system info with valid JSON structure", async () => {
    await withTestClient(async (client) => {
      const response = await client.readResource("system://info");
      
      const systemInfo = assertJSONResource<SystemInfo>(
        response,
        "system://info",
        (data) => {
          // Validate all required fields exist
          assert(data.platform.length > 0, "Should have platform");
          assert(data.architecture.length > 0, "Should have architecture");
          assert(data.nodeVersion.length > 0, "Should have nodeVersion");
          assert(typeof data.uptime === "number", "Uptime should be a number");
          assert(typeof data.totalMemory === "number", "Total memory should be a number");
          assert(typeof data.freeMemory === "number", "Free memory should be a number");
        }
      );
      
      // Additional validations
      assert(systemInfo.uptime > 0, "Uptime should be positive");
      assert(systemInfo.totalMemory > 0, "Total memory should be positive");
      assert(systemInfo.freeMemory > 0, "Free memory should be positive");
      assert(systemInfo.freeMemory <= systemInfo.totalMemory, "Free memory should not exceed total");
      
      // Platform validation
      const validPlatforms = ["darwin", "linux", "win32", "freebsd", "openbsd", "sunos", "aix"];
      assert(
        validPlatforms.includes(systemInfo.platform),
        `Platform should be one of: ${validPlatforms.join(", ")}`
      );
      
      // Architecture validation
      const validArchitectures = ["x64", "arm64", "arm", "ia32", "s390x", "ppc64"];
      assert(
        validArchitectures.includes(systemInfo.architecture),
        `Architecture should be one of: ${validArchitectures.join(", ")}`
      );
      
      // Node version validation
      assert(
        systemInfo.nodeVersion.startsWith("v"),
        "Node version should start with 'v'"
      );
    });
  });

  it("should return consistent system info across multiple calls", async () => {
    await withTestClient(async (client) => {
      const response1 = await client.readResource("system://info");
      const systemInfo1 = assertJSONResource<SystemInfo>(response1, "system://info");
      
      const response2 = await client.readResource("system://info");
      const systemInfo2 = assertJSONResource<SystemInfo>(response2, "system://info");
      
      // Static values should remain the same
      assert.strictEqual(systemInfo1.platform, systemInfo2.platform);
      assert.strictEqual(systemInfo1.architecture, systemInfo2.architecture);
      assert.strictEqual(systemInfo1.nodeVersion, systemInfo2.nodeVersion);
      assert.strictEqual(systemInfo1.totalMemory, systemInfo2.totalMemory);
      
      // Dynamic values might change but should be reasonable
      assert(Math.abs(systemInfo2.uptime - systemInfo1.uptime) < 2, "Uptime difference should be small");
    });
  });

  it("should handle concurrent resource reads", async () => {
    await withTestClient(async (client) => {
      const promises = Array.from({ length: 5 }, () => 
        client.readResource("system://info")
      );
      
      const results = await Promise.all(promises);
      
      assert.strictEqual(results.length, 5, "Should have 5 results");
      
      // All results should be valid
      results.forEach((result) => {
        const systemInfo = assertJSONResource<SystemInfo>(result, "system://info");
        assert(systemInfo.platform.length > 0, "Each result should have valid system info");
      });
    });
  });
});