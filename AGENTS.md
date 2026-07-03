# AI-Assisted Development Guide

## Tech Stack

- **Runtime**: Node.js 22+ (ESM)
- **Language**: TypeScript 5.9+ (ES2022 target)
- **Protocol**: Model Context Protocol (MCP)
- **Framework**: tmcp with Valibot schema validation
- **Package Manager**: pnpm
- **Testing**: Vitest with c8/v8 coverage
- **Linting**: ESLint 9 (flat config) + Prettier
- **CI/CD**: GitHub Actions

## Coding Conventions

- ESM modules with `.js` extensions in imports
- TypeScript strict mode with additional safety checks
- Snake_case for private/internal methods (e.g., `validate_config`, `read_file`)
- Explicit return types on all functions
- No unused variables or parameters (enforced by TypeScript)
- Prefer `const` over `let`, avoid `var`
- Use `console.error` for MCP server logging (stdio)
- Environment variables read through `src/config/env.ts`

## Security Rules

- Never commit API keys or secrets
- GitHub API keys require **no scopes** (public access only)
- Validate all external inputs with Valibot schemas
- Use `fetch` with explicit timeouts via `src/common/http.ts`
- Respect rate limits with graceful error handling
- Non-root Docker user for container deployments

## Testing Requirements

- All new features require unit tests
- Test files colocated with source: `*.test.ts`
- Use Vitest globals (`describe`, `it`, `expect`, `vi`)
- Mock external APIs and HTTP calls
- Minimum 80% code coverage

## Commit Workflow

1. Run `pnpm run type-check` before committing
2. Run `pnpm run lint` to fix linting issues
3. Run `pnpm run test` to verify all tests pass
4. Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
5. Add changeset for user-facing changes: `pnpm changeset`