# AGENTS.md

This file provides guidelines for AI agents working on this repository.

## Repository Overview

This is a monorepo for React Module Federation utilities built with TypeScript and pnpm. It contains a library package (`remote-reload-utils`) for loading remote components with multi-version support, and demo applications.

## Build Commands

### Root Level
- `pnpm install` - Install dependencies (workspace-aware)

### Package: `packages/remote-reload-utils`
- `pnpm --filter remote-reload-utils build` - Build ESM and CJS outputs
- `pnpm --filter remote-reload-utils dev` - Build in watch mode
- `pnpm --filter remote-reload-utils test` - Run all tests with Vitest
- `pnpm --filter remote-reload-utils test run` - Run tests once
- `pnpm --filter remote-reload-utils lint` - Format and check code with Biome
- `pnpm --filter remote-reload-utils format` - Format code with Biome
- `pnpm --filter remote-reload-utils check` - Run Biome check and auto-fix
- `pnpm --filter remote-reload-utils prepublishOnly` - Build before publishing

### Package: `packages/test-mf-unpkg`
- `pnpm --filter test-mf-unpkg dev` - Start development server
- `pnpm --filter test-mf-unpkg build` - Build for production
- `pnpm --filter test-mf-unpkg preview` - Preview production build

### App: `apps/host-rsbuild-remote`
- `pnpm --filter host-rsbuild-remote dev` - Start development server
- `pnpm --filter host-rsbuild-remote build` - Build for production
- `pnpm --filter host-rsbuild-remote preview` - Preview production build

## Running Single Test

Tests are run with Vitest. To run a single test file:
```bash
pnpm --filter remote-reload-utils test path/to/test-file.test.ts
```

Or use the pattern matching:
```bash
pnpm --filter remote-reload-utils test --run --grep "test name"
```

## Code Style Guidelines

### TypeScript Configuration
- Use `strict: true` mode
- Enable `noUnusedLocals` and `noUnusedParameters`
- Use `ESNext` modules with `bundler` module resolution
- React apps use `jsx: "react-jsx"` (automatic runtime)
- All files use ES modules (`type: "module"` in package.json)

### Imports
- Use named imports by default: `import { foo } from 'bar'`
- Default imports for React components: `import React from 'react'`
- Workspace dependencies use `workspace:*` protocol
- Type-only imports for types: `import type { Foo } from 'bar'`

### Formatting (Biome)
- Configuration extends `base-biome-config/biome`
- Run `pnpm --filter remote-reload-utils lint` before committing
- Use 2-space indentation
- Use single quotes for strings
- Add semicolons
- Trailing commas where applicable

### Naming Conventions
- Files: `kebab-case.ts` or `kebab-case.tsx`
- Variables/Functions: `camelCase`
- Components: `PascalCase`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE` for true constants
- Private module-level functions: `camelCase`

### Type Definitions
- Define interfaces for complex object types
- Use `export interface` for public types
- Keep types in separate files (e.g., `types.ts`) when appropriate
- Use type assertions sparingly; prefer type guards

### Error Handling
- Always throw `Error` objects with descriptive messages
- Use try-catch blocks for async operations
- Prefix error messages with `[MF]` for module federation related errors
- Log warnings with `console.warn` for recoverable issues
- Wrap localStorage operations in try-catch for safety

### Comments
- Use JSDoc comments for exported functions with `/** */`
- Keep comments in Chinese as per existing codebase
- Avoid inline comments unless necessary
- Document complex logic with section headers: `// --- Section Name ---`

### Module Federation Specifics
- Use `@module-federation/enhanced/runtime` for runtime loading
- Configure `singleton: true` and `eager: true` for shared React modules
- Use `createInstance()` to create runtime instances
- Remote entry files named `remoteEntry.js`

### Code Organization
- Entry point: `src/index.ts` for re-exports
- Separate concerns: types, utilities, main logic
- Keep configuration in config files (rslib.config.ts, rsbuild.config.ts)
- Use plugin patterns for extensibility (e.g., `fallbackPlugin()`)

### React Components
- Use functional components with hooks
- Use `useEffect` for side effects and initialization
- Handle loading states with `useState`
- Cleanup effects with cleanup functions
- Use `null` or optional chaining for undefined values

### Async Patterns
- Use `async/await` instead of Promise chains
- Add return types to async functions
- Handle errors with try-catch
- Use `Promise.all()` for parallel operations
- Use `setTimeout` with `Promise` wrapper for delays

### Browser Compatibility
- Target Node 18+ for library builds
- Use `fetch` API for HTTP requests
- Use `localStorage` for client-side caching
- Consider polyfills if needed for older browsers

## Package Management

- This is a pnpm workspace
- All packages are under `packages/` and `apps/`
- Use `workspace:*` for internal dependencies
- Run commands in specific packages using `pnpm --filter <package-name>`
- Lock file: `pnpm-lock.yaml` (commit this)

## Testing

Tests should be placed next to source files or in a `__tests__` directory with `.test.ts` or `.spec.ts` extensions.
