# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A pnpm monorepo for Module Federation utilities to dynamically load remote React/Vue components at runtime, with multi-version support, CDN failover, and lifecycle management.

**Published packages:**
- `remote-reload-utils` (v1.0.3) - Core runtime loading library
- `@react-mf-lib/react-adapter` (v1.0.1) - React adapter for loading remote components
- `@react-mf-lib/vue-adapter` (v1.0.1) - Vue 3 adapter for loading React remote components

**Example apps:**
- `apps/test-mf-unpkg` - Remote component provider (React)
- `apps/host-react18-remote` - Host app consuming remote components (React)
- `apps/host-vue3-remote` - Host app consuming React components via Vue adapter

## Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build single package
pnpm --filter remote-reload-utils build
pnpm --filter @react-mf-lib/react-adapter build
pnpm --filter @react-mf-lib/vue-adapter build

# Dev/watch mode
pnpm --filter remote-reload-utils dev

# Run tests (remote-reload-utils has 155+ unit tests)
pnpm --filter remote-reload-utils test
pnpm --filter remote-reload-utils test:watch
pnpm --filter remote-reload-utils test --coverage

# Lint/format/check
pnpm lint          # All packages
pnpm format        # All packages
pnpm check         # All packages

# Package-specific
pnpm --filter remote-reload-utils format
pnpm --filter remote-reload-utils check

# Release workflow
pnpm changeset           # Create new changeset
pnpm changeset version   # Apply version changes
pnpm release.sh version  # Same as above
pnpm release.sh publish  # Publish to npm (requires NPM_TOKEN)
```

## Architecture

### Monorepo Structure

```
react-mf-lib/
├── packages/
│   ├── remote-reload-utils/    # Core library (published to npm)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── loader/         # loadRemoteMultiVersion
│   │   │   ├── preload/        # Preloading utilities
│   │   │   ├── unload/         # Unloading/cleanup
│   │   │   ├── health/         # Health check utilities
│   │   │   ├── version/        # Version parsing/compatibility
│   │   │   ├── event-bus/      # Cross-module event system
│   │   │   ├── plugins/        # Plugin system
│   │   │   ├── hooks/          # React hooks (useRemote, useRemoteList)
│   │   │   └── shared-state/   # Shared context across modules
│   │   ├── __tests__/          # Vitest tests
│   │   └── rslib.config.ts
│   ├── react-adapter/          # React adapter (published)
│   │   └── src/
│   │       ├── components/     # RemoteModuleProvider, lazyRemote
│   │       └── hooks/          # useRemoteModuleHook
│   └── vue-adapter/            # Vue adapter (published)
│       └── src/
│           ├── components/     # VueRemoteModuleProvider
│           ├── hooks/          # useVueRemoteModule
│           └── utils/          # mountReactToGlobal, ReactComponentRenderer
└── apps/
    ├── test-mf-unpkg/          # Remote component provider
    ├── host-react18-remote/    # React host consuming remotes
    └── host-vue3-remote/       # Vue host consuming React remotes
```

### Key Technologies

- **Build:** Rslib (produces ESM + CJS with d.ts)
- **Runtime:** @module-federation/enhanced
- **Package manager:** pnpm workspace
- **Linting:** Biome
- **Testing:** Vitest + happy-dom
- **Versioning:** Changesets

### Core API Patterns

```typescript
// Core loading function
import { loadRemoteMultiVersion } from 'remote-reload-utils'

const { scopeName, mf } = await loadRemoteMultiVersion({
  name: 'my_lib',
  pkg: '@myorg/remote-app',
  version: '1.0.0',  // or 'latest'
})

const mod = await mf.loadRemote(`${scopeName}/ComponentName`)

// React adapter
import { RemoteModuleProvider, lazyRemote } from '@react-mf-lib/react-adapter'

// Vue adapter
import { mountReactToGlobal, VueRemoteModuleProvider } from '@react-mf-lib/vue-adapter'
```

### Build Configuration

All packages use `rslib.config.ts` with similar patterns:
- ESM + CJS output formats
- TypeScript declaration generation
- Bundle mode enabled
- Node 18 syntax target

### Testing

Tests located in `packages/remote-reload-utils/__tests__/`:
- Run with Vitest + happy-dom (no JSDOM)
- Coverage reports available via `--coverage` flag
- Test remote loading, version management, event bus, health checks

### Release Process

1. `pnpm changeset add` - Create changeset for changes
2. `pnpm changeset` - Review pending changesets
3. `pnpm release.sh version` - Apply versions and update changelogs
4. `pnpm release.sh publish` - Publish to npm (requires `NPM_TOKEN`)

Uses Changesets with git changelog, publishes to public npm registry.
