# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Build the TypeScript project:
```bash
npm run build
```

Run linting:
```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint:fix
```

## Architecture

This is a Model Context Protocol (MCP) server starter written in TypeScript that provides a minimal template for building MCP servers.

The server demonstrates the basic MCP structure with a single tool:

- **echo**: A simple tool that echoes back the provided text

The server uses:
- `@modelcontextprotocol/sdk` for MCP implementation
- `zod` for schema validation
- Stdio transport for communication
- Strict TypeScript configuration with ES2022 target

Entry point is `src/index.ts` which sets up the MCP server with the echo tool and runs on stdio transport.

This starter template is designed to be forked and extended with additional tools, resources, and prompts as needed for specific use cases.

For detailed MCP SDK documentation and implementation guides, see `src/CLAUDE.md`.

## Troubleshooting

When encountering issues or needing documentation:
- Use the context7 MCP server to retrieve up-to-date documentation for any library
- For MCP-related issues, search for `@modelcontextprotocol/sdk` documentation
- For TypeScript issues, search for relevant TypeScript or Node.js documentation