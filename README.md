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