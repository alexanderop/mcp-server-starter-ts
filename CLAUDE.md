# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Build & Development
- `npm run build` - Compile TypeScript to JavaScript (required before running)
- `npm run dev` - Interactive REPL for testing JSON-RPC messages
- `npm run inspect` - Launch MCP Inspector for interactive testing

### Code Quality
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run typecheck` - Type-check without building

### Testing
- `npm test` - Run all tests using Node.js native test runner
- `npm run test:watch` - Run tests in watch mode
- Test individual files: `node --test tests/[filename].test.ts`

### Code Generation (Hygen)
- `npm run gen:tool` - Generate new tool with test
- `npm run gen:prompt` - Generate new prompt with test
- `npm run gen:resource` - Generate new resource with test

### Documentation
- `npm run docs` - Generate API documentation with TypeDoc
- `npm run docs:watch` - Generate docs in watch mode
- `npm run docs:clean` - Remove generated documentation

## Architecture Overview

This is a Model Context Protocol (MCP) server built with TypeScript that provides tools, resources, and prompts to AI assistants.

### Core Components

1. **Auto-Loading System** (`src/registry/`)
   - Automatically discovers and registers modules from `tools/`, `resources/`, and `prompts/` directories
   - No manual registration needed - just drop files in the correct directory
   - Each module must export a default `RegisterableModule` object

2. **Module Types**
   - **Tools**: Execute actions and computations (e.g., API calls, calculations)
   - **Resources**: Provide read-only data access (e.g., configuration, static data)
   - **Prompts**: Reusable prompt templates for structured AI interactions

3. **Entry Points**
   - `src/index.ts`: Main MCP server initialization
   - `dev.js`: Interactive development REPL for testing JSON-RPC messages

### Module Structure

All modules follow the `RegisterableModule` interface:
```typescript
interface RegisterableModule {
  type: "tool" | "resource" | "prompt"
  name: string
  description?: string
  register: (server: McpServer) => void | Promise<void>
}
```

### MCP Protocol Flow

1. Client sends `initialize` request with capabilities
2. Server responds with its capabilities
3. Client sends `initialized` notification (required!)
4. Server is ready to handle tool/resource/prompt requests

### Key Implementation Notes

- TypeScript strict mode is enabled - ensure all types are properly defined
- All modules use ES modules with `.js` extensions in imports
- Zod is used for runtime validation of all inputs
- The server runs on stdio transport for communication
- Build output goes to `build/` directory with executable permissions set

## Development Workflow

1. Create new module using generators: `npm run gen:tool/prompt/resource`
2. Module is auto-discovered on next build
3. Test with `npm run inspect` or `npm run dev`
4. Run `npm test` to ensure tests pass
5. Use `npm run lint` and `npm run typecheck` before committing

## Testing Approach

- Uses Node.js native test runner (no external test framework)
- Test files in `tests/` directory mirror source structure
- Helper utilities in `tests/helpers/` for creating test clients
- Run specific test: `node --test tests/[module].test.ts`