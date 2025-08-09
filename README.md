# MCP Server Starter

A minimal TypeScript starter template for building Model Context Protocol (MCP) servers.

## What is MCP?

MCP (Model Context Protocol) enables AI applications to connect with external systems through a standardized protocol. This starter template provides the basic structure to build your own MCP server.

## Features

This starter includes:
- TypeScript configuration with strict type checking
- MCP SDK integration  
- Basic server setup with stdio transport
- Example `echo` tool implementation
- Example resources (static and dynamic)
- Example `generate-readme` prompt
- ESLint configuration
- Build scripts

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Build the server:
```bash
npm run build
```

3. Run the server:
```bash
node build/index.js
```

## Project Structure

```
mcp-server-starter-ts/
├── src/
│   └── index.ts      # Main server implementation
├── build/            # Compiled JavaScript output
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── eslint.config.mjs # ESLint configuration
```

## Example Tool

The starter includes a simple `echo` tool that demonstrates the basic structure:

```typescript
server.tool(
  "echo",
  "Echo back the provided text",
  {
    text: z.string().describe("Text to echo back"),
  },
  async ({ text }) => {
    return {
      content: [
        {
          type: "text",
          text: text,
        },
      ],
    };
  }
);
```

## Example Resources

### Resources vs Tools

- **Resources**: Provide data/context to the AI without performing actions. Used for retrieving information.
- **Tools**: Execute actions or operations that may have side effects. Used for performing tasks.

### Static Resource: System Information

A simple resource that provides system information about the server:

```typescript
server.resource(
  "system-info",
  "system://info",
  {
    name: "System Information",
    description: "Get basic system information about the server",
  },
  async () => {
    return {
      contents: [
        {
          uri: "system://info",
          mimeType: "application/json",
          text: JSON.stringify({
            platform: os.platform(),
            architecture: os.arch(),
            nodeVersion: process.version,
            // ... more system info
          }, null, 2),
        },
      ],
    };
  }
);
```

### Dynamic Resource: Timestamp

A dynamic resource using `ResourceTemplate` that provides timestamps in different formats:

```typescript
server.registerResource(
  "timestamp",
  new ResourceTemplate("timestamp://{format}", {
    list: async () => [
      { uri: "timestamp://iso", name: "ISO 8601 format" },
      { uri: "timestamp://unix", name: "Unix timestamp" },
      { uri: "timestamp://readable", name: "Human-readable format" },
    ],
  }),
  {
    name: "Timestamp",
    description: "Get current timestamp in various formats",
  },
  async (uri, { format }) => {
    // Format-specific timestamp generation
    // Returns timestamp in requested format
  }
);
```

Access examples:
- `system://info` - Get system information
- `timestamp://iso` - Get current time in ISO 8601 format
- `timestamp://unix` - Get Unix timestamp
- `timestamp://readable` - Get human-readable timestamp

## Example Prompt

### Prompts vs Tools vs Resources

- **Prompts**: Reusable templates for LLM interactions (user-invoked)
- **Tools**: Execute actions or operations that may have side effects
- **Resources**: Provide data/context to the AI without performing actions

### Generate README Prompt

A prompt template for generating project documentation:

```typescript
server.prompt(
  "generate-readme",
  "Generate a README file for a project",
  {
    projectName: z.string().describe("Name of the project"),
    description: z.string().describe("Brief description of what the project does"),
  },
  ({ projectName, description }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Generate a professional README.md file for a project called "${projectName}". 
          
Project description: ${description}

Please include sections for: installation, usage, features, contributing, and license.`,
        },
      },
    ],
  })
);
```

This prompt helps users quickly generate standardized documentation for their projects.

## Extending the Server

To add new capabilities:

1. **Add Tools**: Define new tools using `server.tool()`
2. **Add Resources**: Provide data using `server.resource()`
3. **Add Prompts**: Create templates using `server.prompt()`

## Integration

To use this server with an MCP client:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/build/index.js"],
      "transport": "stdio"
    }
  }
}
```

## Testing

### Writing Tests

This project uses Node.js's built-in test runner with the `node:test` and `node:assert` modules. Tests are located in the `tests/` directory and follow the naming convention `*.test.ts`.

### Test Structure

Here's how to write tests for MCP tools, resources, and prompts using the actual test helpers:

#### Testing Tools

```typescript
// tests/echo.test.ts
import assert from "node:assert";
import { describe, it } from "node:test";
import { 
  withTestClient, 
  assertToolResponse,
  assertToolError 
} from "./helpers/test-client.js";

describe("Echo Tool", () => {
  it("should echo back the provided text", async () => {
    await withTestClient(async (client) => {
      const testText = "Hello, MCP!";
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
});
```

#### Testing Resources

```typescript
// tests/system-info.test.ts
import assert from "node:assert";
import { describe, it } from "node:test";
import { 
  withTestClient, 
  assertJSONResource
} from "./helpers/test-client.js";

describe("System Info Resource", () => {
  it("should return system information", async () => {
    await withTestClient(async (client) => {
      const response = await client.readResource("system://info");
      
      const systemInfo = assertJSONResource(
        response,
        "system://info",
        (data) => {
          assert(data.platform.length > 0, "Should have platform");
          assert(data.nodeVersion.length > 0, "Should have nodeVersion");
          assert(typeof data.uptime === "number", "Uptime should be a number");
        }
      );
    });
  });
});
```

#### Testing Dynamic Resources

```typescript
// tests/timestamp.test.ts
describe("Timestamp Resource", () => {
  it("should return ISO format timestamp", async () => {
    await withTestClient(async (client) => {
      const response = await client.readResource("timestamp://iso");
      
      assertResourceContent(response, {
        uri: "timestamp://iso",
        mimeType: "text/plain",
        contentValidator: (text) => {
          // Verify ISO 8601 format
          assert(text.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/));
        }
      });
    });
  });

  it("should return Unix timestamp", async () => {
    await withTestClient(async (client) => {
      const response = await client.readResource("timestamp://unix");
      const timestamp = parseInt(response.contents[0].text);
      
      assert(timestamp > 0, "Timestamp should be positive");
      assert(timestamp <= Date.now(), "Timestamp should not be in the future");
    });
  });
});
```

#### Testing Prompts

```typescript
// tests/generate-readme.test.ts
describe("Generate README Prompt", () => {
  it("should generate prompt with correct parameters", async () => {
    await withTestClient(async (client) => {
      const result = await client.getPrompt("generate-readme", {
        projectName: "TestProject",
        description: "A test project"
      });
      
      assert.strictEqual(result.messages[0].role, "user");
      assert(result.messages[0].content.text.includes("TestProject"));
      assert(result.messages[0].content.text.includes("A test project"));
    });
  });
});
```

### Test Helpers

The project includes comprehensive test utilities in `tests/helpers/`:

```typescript
// tests/helpers/test-client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// TestClient class for managing test connections
export class TestClient {
  async setup(): Promise<void>
  async teardown(): Promise<void>
  async callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult>
  async readResource(uri: string): Promise<ReadResourceResult>
  // ... more methods
}

// Higher-order function for automatic setup/teardown
export async function withTestClient<T>(
  testFn: (client: TestClient) => Promise<T>
): Promise<T>

// Assertion helpers
export function assertToolResponse(response, expectedContent, message?)
export function assertJSONResource(resource, expectedUri, validator?)
export function assertToolError(toolCall, errorMatcher?, message?)
```

### Running Tests

```bash
# Run all tests (builds first, then runs tests)
npm test

# Run tests directly (for Node.js 23+)
npm run test:run

# Run specific test file
node --test tests/echo.test.ts

# Run tests with specific Node version
# For Node.js 23+: runs TypeScript tests directly
# For older versions: compiles to JS first then runs
```

### Test Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking**: Mock external dependencies and system calls
3. **Coverage**: Aim for at least 80% code coverage
4. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
5. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
6. **Edge Cases**: Test boundary conditions, error cases, and invalid inputs
7. **Performance**: Include tests for performance-critical operations

### Continuous Integration

Tests are automatically run in CI/CD pipelines. Ensure all tests pass before merging pull requests.

## Development Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix linting issues
- `npm test` - Build and run all tests
- `npm run test:run` - Run tests directly (Node.js version dependent)
- `npm run typecheck` - Type check without emitting files

## License

MIT