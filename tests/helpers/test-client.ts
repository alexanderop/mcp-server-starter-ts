import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { 
  CallToolResult, 
  ListToolsResult,
  ListResourcesResult,
  ListPromptsResult,
  GetPromptResult,
  ReadResourceResult
} from "@modelcontextprotocol/sdk/types.js";

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = path.dirname(currentFilename);

export type TestClientConfig = {
  name?: string;
  version?: string;
  capabilities?: Record<string, unknown>;
  serverPath?: string;
  stderr?: "pipe" | "ignore";
}

export class TestClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private readonly config: TestClientConfig;

  constructor(config: TestClientConfig = {}) {
    this.config = {
      name: config.name ?? "test-client",
      version: config.version ?? "1.0.0",
      capabilities: config.capabilities ?? {},
      stderr: config.stderr ?? "ignore",
      serverPath: config.serverPath,
    };
  }

  async setup(): Promise<void> {
    this.client = new Client(
      {
        name: this.config.name ?? "test-client",
        version: this.config.version ?? "1.0.0",
      },
      {
        capabilities: this.config.capabilities ?? {},
      }
    );

    // Determine the correct path based on where test is running from
    const serverPath = this.config.serverPath ?? this.getDefaultServerPath();
    
    this.transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
      stderr: this.config.stderr ?? "ignore",
    });

    await this.client.connect(this.transport);
  }

  async teardown(): Promise<void> {
    if (this.client !== null) {
      await this.client.close();
      this.client = null;
      this.transport = null;
    }
  }

  async callTool(name: string, args: Record<string, unknown> = {}): Promise<CallToolResult> {
    if (this.client === null) {
      throw new Error("Client not initialized. Call setup() first.");
    }
    return this.client.callTool({ name, arguments: args }) as Promise<CallToolResult>;
  }

  async listTools(): Promise<ListToolsResult> {
    if (this.client === null) {
      throw new Error("Client not initialized. Call setup() first.");
    }
    return this.client.listTools();
  }

  async listResources(): Promise<ListResourcesResult> {
    if (this.client === null) {
      throw new Error("Client not initialized. Call setup() first.");
    }
    return this.client.listResources();
  }

  async readResource(uri: string): Promise<ReadResourceResult> {
    if (this.client === null) {
      throw new Error("Client not initialized. Call setup() first.");
    }
    return this.client.readResource({ uri });
  }

  async listPrompts(): Promise<ListPromptsResult> {
    if (this.client === null) {
      throw new Error("Client not initialized. Call setup() first.");
    }
    return this.client.listPrompts();
  }

  async getPrompt(name: string, args?: Record<string, string>): Promise<GetPromptResult> {
    if (this.client === null) {
      throw new Error("Client not initialized. Call setup() first.");
    }
    return this.client.getPrompt({ name, arguments: args });
  }

  async ping(): Promise<void> {
    if (this.client === null) {
      throw new Error("Client not initialized. Call setup() first.");
    }
    await this.client.ping();
  }

  get isConnected(): boolean {
    return this.client !== null;
  }

  private getDefaultServerPath(): string {
    // Navigate from tests/helpers to the project root
    const projectRoot = path.join(currentDirname, "..", "..");
    
    // Check if we're running from build directory
    if (currentDirname.includes("build")) {
      return path.join(projectRoot, "index.js");
    } else {
      return path.join(projectRoot, "build", "index.js");
    }
  }
}

/**
 * Factory function to quickly create and setup a test client
 */
export async function createTestClient(config?: TestClientConfig): Promise<TestClient> {
  const client = new TestClient(config);
  await client.setup();
  return client;
}

/**
 * Higher-order function that handles client setup and teardown automatically
 */
export async function withTestClient<T>(
  testFn: (client: TestClient) => Promise<T>,
  config?: TestClientConfig
): Promise<T> {
  const client = new TestClient(config);
  try {
    await client.setup();
    return await testFn(client);
  } finally {
    await client.teardown();
  }
}

/**
 * Assertion helper for tool responses
 */
export function assertToolResponse(
  response: CallToolResult,
  expectedContent: string | ((content: unknown) => boolean),
  message?: string
): void {
  assert(response.content.length > 0, "Response should have content");
  assert.strictEqual(response.content[0]?.type, "text", "Response should be text type");
  
  const actualContent = (response.content[0] as { text?: string }).text;
  
  if (typeof expectedContent === "string") {
    assert.strictEqual(actualContent, expectedContent, message);
  } else {
    assert(expectedContent(actualContent), message);
  }
  
  assert.strictEqual(response.isError, undefined, "Response should not be an error");
}

/**
 * Assertion helper for resource content
 */
export function assertResourceContent(
  resource: { contents?: Array<{ uri?: string; mimeType?: string; text?: string }> },
  expected: {
    uri: string;
    mimeType: string;
    contentValidator?: (text: string) => void;
  }
): void {
  assert(resource.contents !== undefined, "Resource should have contents");
  assert(resource.contents.length > 0, "Resource should have at least one content item");
  
  const content = resource.contents[0];
  assert(content !== undefined, "First content item should exist");
  assert.strictEqual(content.uri, expected.uri, "URI should match");
  assert.strictEqual(content.mimeType, expected.mimeType, "MIME type should match");
  assert(content.text !== undefined, "Content should have text");
  
  if (expected.contentValidator !== undefined) {
    expected.contentValidator(content.text);
  }
}

/**
 * Assertion helper for JSON resources
 */
export function assertJSONResource<T = unknown>(
  resource: { contents?: Array<{ uri?: string; mimeType?: string; text?: string }> },
  expectedUri: string,
  validator?: (data: T) => void
): T {
  assertResourceContent(resource, {
    uri: expectedUri,
    mimeType: "application/json"
  });
  
  const content = resource.contents?.[0];
  assert(content?.text !== undefined, "Content should have text");
  
  let parsed: T;
  try {
    parsed = JSON.parse(content.text) as T;
  } catch (error) {
    assert.fail(`Failed to parse JSON: ${String(error)}`);
  }
  
  if (validator !== undefined) {
    validator(parsed);
  }
  
  return parsed;
}

/**
 * Assertion helper for error responses
 */
export async function assertToolError(
  toolCall: Promise<CallToolResult>,
  errorMatcher?: string | RegExp | ((error: unknown) => boolean),
  message?: string
): Promise<void> {
  await assert.rejects(
    toolCall,
    (error: unknown) => {
      if (errorMatcher === undefined) return true;
      
      const errorObj = error as { message?: string };
      
      if (typeof errorMatcher === "string") {
        return errorObj.message?.includes(errorMatcher) ?? false;
      } else if (errorMatcher instanceof RegExp) {
        return errorMatcher.test(errorObj.message ?? "");
      } else {
        return errorMatcher(error);
      }
    },
    message
  );
}