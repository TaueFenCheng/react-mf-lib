# Changelog

## 0.0.1 (2026-03-18)

### Features

- Initial release of @react-mf-lib/vue-adapter
- Vue 3 adapter for loading React remote components via Module Federation
- `mountReactToGlobal` - Load React and ReactDOM from CDN to global window object
- `VueRemoteModuleProvider` - Vue component for loading and rendering React remote components
- `useVueRemoteModule` - Vue composable hook for loading React remote components
- `ReactComponentRenderer` - Vue component for rendering React components when you already have the component

### Usage

```bash
npm install @react-mf-lib/vue-adapter remote-reload-utils
```

```ts
// In main.ts
import { mountReactToGlobal } from '@react-mf-lib/vue-adapter'
await mountReactToGlobal('18')

// In Vue component
import { VueRemoteModuleProvider } from '@react-mf-lib/vue-adapter'
```

### License

MIT
