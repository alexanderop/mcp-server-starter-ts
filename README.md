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

## Development Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix linting issues

## License

MIT