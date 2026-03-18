# @react-mf-lib/vue-adapter

Vue 3 adapter for loading React remote components via Module Federation.

## Installation

```bash
npm install @react-mf-lib/vue-adapter remote-reload-utils
# or
pnpm add @react-mf-lib/vue-adapter remote-reload-utils
# or
yarn add @react-mf-lib/vue-adapter remote-reload-utils
```

## Usage

### 1. Mount React to Global (in main.ts)

```ts
import { mountReactToGlobal } from '@react-mf-lib/vue-adapter'

// Load React to global window object (required for React remote components)
await mountReactToGlobal('18')

// Then create your Vue app
createApp(App).mount('#app')
```

### 2. Use VueRemoteModuleProvider Component

```vue
<template>
  <VueRemoteModuleProvider
    pkg="my-react-components"
    version="1.0.0"
    moduleName="Button"
    scopeName="my_react_app"
  />
</template>

<script setup lang="ts">
import { VueRemoteModuleProvider } from '@react-mf-lib/vue-adapter'
</script>
```

### 3. Or Use the Hook

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <component :is="component" v-else />
  </div>
</template>

<script setup lang="ts">
import { useVueRemoteModule } from '@react-mf-lib/vue-adapter'

const { component, loading, error, retry } = useVueRemoteModule({
  pkg: 'my-react-components',
  version: '1.0.0',
  moduleName: 'Button',
  scopeName: 'my_react_app'
})
</script>
```

## API

### `mountReactToGlobal(version?)`

Loads React and ReactDOM from CDN and mounts them to the global window object.

```ts
await mountReactToGlobal('18') // or '17' or '19'
```

### `VueRemoteModuleProvider`

A Vue component that loads and renders React remote components.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| pkg | string | Yes | Package name |
| version | string | No (default: 'latest') | Version |
| moduleName | string | Yes | Module export name |
| scopeName | string | Yes | Module Federation scope name |
| loadingFallback | Component \| VNode \| () => VNode | No | Loading state fallback |
| errorFallback | Component \| VNode \| (error, retry) => VNode | No | Error state fallback |
| componentProps | Record<string, any> | No | Props to pass to the React component |
| className | string | No | Container class name |
| style | Record<string, any> | No | Container styles |

### `useVueRemoteModule(options)`

A Vue composable for loading React remote components.

```ts
const { component, loading, error, retry } = useVueRemoteModule({
  pkg: 'my-react-components',
  version: '1.0.0',
  moduleName: 'Button',
  scopeName: 'my_react_app',
  onLoad: (component) => console.log('Component loaded:', component),
  onError: (error) => console.error('Error loading:', error),
})
```

### `ReactComponentRenderer`

A Vue component for rendering React components (when you already have the React component).

```vue
<template>
  <ReactComponentRenderer
    :component="MyReactComponent"
    :component-props="{ foo: 'bar' }"
  />
</template>

<script setup lang="ts">
import { ReactComponentRenderer } from '@react-mf-lib/vue-adapter'
import MyReactComponent from './MyReactComponent'
</script>
```

## License

MIT
