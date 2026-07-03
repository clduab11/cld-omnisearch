# Project-Specific Agent Rules

## Behavior Guidelines

- Follow the coding conventions in AGENTS.md
- Always run type-check and lint before completing changes
- Create tests for any new functionality
- Use snake_case for internal functions and methods
- Prefer explicit types and avoid `any`
- Validate all external inputs with Valibot schemas

## MCP Server Specific Rules

- Use `console.error` for logging (not `console.log`) to avoid interfering with stdio transport
- All HTTP calls must use the shared `src/common/http.ts` wrapper with timeouts
- Provider API keys are optional - gracefully handle missing keys
- Return structured error responses for provider failures

## Development Workflow

1. Check existing patterns in `src/server/` and `src/providers/`
2. Follow tmcp and Valibot conventions for tool registration
3. Use `pnpm run dev` for local testing with MCP Inspector
4. Verify changes with `pnpm run type-check && pnpm run lint && pnpm run test`