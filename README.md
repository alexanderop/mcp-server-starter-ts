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

This project uses Jest for testing. Tests are located in the `__tests__` directory and follow the naming convention `*.test.ts`.

### Test Structure

Here's an example of how to write tests for MCP tools, resources, and prompts:

#### Testing Tools

```typescript
// __tests__/tools/echo.test.ts
import { describe, it, expect } from '@jest/globals';
import { createTestClient } from '../helpers/test-client';

describe('Echo Tool', () => {
  it('should echo back the provided text', async () => {
    const client = createTestClient();
    
    const result = await client.callTool('echo', {
      text: 'Hello, MCP!'
    });
    
    expect(result.content[0]).toEqual({
      type: 'text',
      text: 'Hello, MCP!'
    });
  });

  it('should validate input parameters', async () => {
    const client = createTestClient();
    
    await expect(client.callTool('echo', {}))
      .rejects.toThrow('Required parameter');
  });
});
```

#### Testing Resources

```typescript
// __tests__/resources/system-info.test.ts
import { describe, it, expect } from '@jest/globals';
import { createTestClient } from '../helpers/test-client';

describe('System Info Resource', () => {
  it('should return system information', async () => {
    const client = createTestClient();
    
    const result = await client.readResource('system://info');
    const data = JSON.parse(result.contents[0].text);
    
    expect(data).toHaveProperty('platform');
    expect(data).toHaveProperty('nodeVersion');
    expect(data.nodeVersion).toMatch(/^v\d+\.\d+\.\d+/);
  });
});
```

#### Testing Dynamic Resources

```typescript
// __tests__/resources/timestamp.test.ts
describe('Timestamp Resource', () => {
  it('should return ISO format timestamp', async () => {
    const client = createTestClient();
    
    const result = await client.readResource('timestamp://iso');
    const timestamp = result.contents[0].text;
    
    // Verify ISO 8601 format
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should return Unix timestamp', async () => {
    const client = createTestClient();
    
    const result = await client.readResource('timestamp://unix');
    const timestamp = parseInt(result.contents[0].text);
    
    expect(timestamp).toBeGreaterThan(0);
    expect(timestamp).toBeLessThanOrEqual(Date.now());
  });
});
```

#### Testing Prompts

```typescript
// __tests__/prompts/generate-readme.test.ts
describe('Generate README Prompt', () => {
  it('should generate prompt with correct parameters', async () => {
    const client = createTestClient();
    
    const result = await client.getPrompt('generate-readme', {
      projectName: 'TestProject',
      description: 'A test project'
    });
    
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[0].content.text).toContain('TestProject');
    expect(result.messages[0].content.text).toContain('A test project');
  });
});
```

### Test Helpers

Create reusable test utilities in `__tests__/helpers/`:

```typescript
// __tests__/helpers/test-client.ts
import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';
import { spawn } from 'child_process';

export function createTestClient() {
  const serverProcess = spawn('node', ['build/index.js']);
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['build/index.js']
  });
  
  return new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    transport
  });
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- echo.test.ts
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
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## License

MIT