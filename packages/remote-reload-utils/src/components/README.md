# Components

remote-reload-utils 提供的 React 组件集合，用于 Module Federation 远程模块加载和错误处理。

## 目录

- [ErrorBoundary](#errorboundary) - 错误边界组件
- [RemoteModuleProvider](#remotemoduleprovider) - 远程模块提供者（完整组件）
- [RemoteModuleRenderer](#remotemodulerenderer) - 远程模块渲染器（纯内容组件）
- [SuspenseLoader](#suspenseloader) - 惰性加载组件集合

---

## ErrorBoundary

错误边界组件，用于捕获子组件树中的错误，并显示降级 UI。

### Props

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| children | `React.ReactNode` | 是 | 子组件 |
| fallback | `React.ReactNode \| ((error: Error, resetError: () => void) => React.ReactNode)` | 否 | 错误时显示的降级 UI，支持函数形式获取错误和重置方法 |
| onError | `(error: Error, errorInfo: React.ErrorInfo) => void` | 否 | 错误回调 |
| onReset | `() => void` | 否 | 重置错误状态时的回调 |

### 使用示例

```tsx
import { ErrorBoundary } from 'remote-reload-utils';

// 基础用法
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// 自定义降级 UI
<ErrorBoundary
  fallback={(error, reset) => (
    <div onClick={reset}>
      <h3>Something went wrong</h3>
      <p>{error.message}</p>
      <button>Try again</button>
    </div>
  )}
  onError={(error, info) => console.error(error, info)}
>
  <MyComponent />
</ErrorBoundary>
```

---

## RemoteModuleProvider

远程模块提供者，负责加载和渲染远程模块，内置 Suspense 和 ErrorBoundary 支持。

### Props

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pkg | `string` | 是 | 远程包名称 |
| version | `string` | 是 | 版本号，支持 semver 范围 |
| moduleName | `string` | 是 | 远程模块名称（导出名） |
| scopeName | `string` | 是 | 作用域名称 |
| loadingFallback | `React.ReactNode` | 否 | 加载中的占位内容 |
| errorFallback | `React.ReactNode \| ((error: Error, resetError: () => void) => React.ReactNode)` | 否 | 错误状态的占位内容 |
| componentProps | `Record<string, any>` | 否 | 传递给远程组件的 props |
| className | `string` | 否 | 容器类名 |
| style | `React.CSSProperties` | 否 | 容器样式 |
| onLoad | `(component: React.ComponentType<any>) => void` | 否 | 加载成功回调 |
| onError | `(error: Error) => void` | 否 | 加载失败回调 |
| disableErrorBoundary | `boolean` | 否 | 是否禁用错误边界 |
| errorBoundaryOptions | `Omit<ErrorBoundaryProps, 'children' \| 'fallback'>` | 否 | 错误边界配置 |

### 使用示例

```tsx
import { RemoteModuleProvider } from 'remote-reload-utils';

// 基础用法
<RemoteModuleProvider
  pkg="@myorg/remote-app"
  version="^1.0.0"
  moduleName="Dashboard"
  scopeName="myorg"
/>

// 完整配置
<RemoteModuleProvider
  pkg="@myorg/remote-app"
  version="^1.0.0"
  moduleName="Dashboard"
  scopeName="myorg"
  loadingFallback={<Spinner />}
  errorFallback={(error, reset) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
  componentProps={{ userId: 123 }}
  onLoad={(Component) => console.log('Loaded:', Component)}
  onError={(error) => console.error('Load failed:', error)}
/>

// 禁用错误边界
<RemoteModuleProvider
  pkg="@myorg/remote-app"
  version="^1.0.0"
  moduleName="Dashboard"
  scopeName="myorg"
  disableErrorBoundary
/>
```

---

## RemoteModuleRenderer

远程模块渲染器，纯内容渲染组件，不含 Suspense/ErrorBoundary 包装。

> **注意**：此组件为底层原语，通常不直接使用。建议使用 `RemoteModuleProvider`。

### Props

与 [RemoteModuleProvider](#remotemoduleprovider) 相同。

### 使用示例

```tsx
import { RemoteModuleRenderer, Suspense, ErrorBoundary } from 'remote-reload-utils';

// 自定义包装方式
<ErrorBoundary fallback={<div>Error!</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <RemoteModuleRenderer
      pkg="@myorg/remote-app"
      version="^1.0.0"
      moduleName="Dashboard"
      scopeName="myorg"
    />
  </Suspense>
</ErrorBoundary>
```

---

## Related Hooks

### useRemoteModule

底层 Hook，用于在函数组件中加载远程模块。

```tsx
import { useRemoteModule } from 'remote-reload-utils';

function MyComponent() {
  const { loading, error, component } = useRemoteModule({
    pkg: '@myorg/remote-app',
    version: '^1.0.0',
    moduleName: 'Dashboard',
    scopeName: 'myorg',
  });

  // ...
}
```

---

## SuspenseLoader

提供惰性加载远程组件的工具函数和组件。

### lazyRemote

创建一个惰性加载的远程组件，返回可用于 `React.lazy()` 的组件。

#### Options

| 名称 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| pkg | `string` | 是 | - | 包名称 |
| version | `string` | 否 | `'latest'` | 版本号 |
| moduleName | `string` | 是 | - | 模块名称 |
| scopeName | `string` | 是 | - | 作用域名称 |
| maxRetries | `number` | 否 | `3` | 最大重试次数 |
| retryDelay | `number` | 否 | `1000` | 重试延迟（毫秒） |

#### 使用示例

```tsx
import { lazyRemote } from 'remote-reload-utils';

const LazyDashboard = lazyRemote({
  pkg: '@myorg/remote-app',
  version: '^1.0.0',
  moduleName: 'Dashboard',
  scopeName: 'myorg',
});

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyDashboard userId={123} />
    </Suspense>
  );
}
```

### SuspenseRemote

带 Suspense 的包装器组件。

```tsx
import { SuspenseRemote, RemoteModuleProvider } from 'remote-reload-utils';

<SuspenseRemote fallback={<Spinner />}>
  <RemoteModuleProvider
    pkg="@myorg/remote-app"
    version="^1.0.0"
    moduleName="Dashboard"
    scopeName="myorg"
  />
</SuspenseRemote>
```

### SuspenseRemoteLoader

一体化的远程组件加载器（包含 Suspense 和 ErrorBoundary）。

#### Props

| 名称 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pkg | `string` | 是 | 包名称 |
| version | `string` | 否 | 版本号，默认 `'latest'` |
| moduleName | `string` | 是 | 模块名称 |
| scopeName | `string` | 是 | 作用域名称 |
| fallback | `ReactNode` | 否 | 加载中占位内容 |
| errorFallback | `ReactNode \| ((error: Error) => ReactNode)` | 否 | 错误占位内容 |
| componentProps | `Record<string, any>` | 否 | 传递给远程组件的 props |

#### 使用示例

```tsx
import { SuspenseRemoteLoader } from 'remote-reload-utils';

<SuspenseRemoteLoader
  pkg="@myorg/remote-app"
  version="^1.0.0"
  moduleName="Dashboard"
  scopeName="myorg"
  fallback={<Spinner />}
  errorFallback={(error) => <div>Error: {error.message}</div>}
  componentProps={{ userId: 123 }}
/>
```

### withRemote

HOC：为组件添加远程加载能力。

```tsx
import { withRemote } from 'remote-reload-utils';

const EnhancedComponent = withRemote(
  (props) => <div>{props.message}</div>,
  {
    pkg: '@myorg/remote-app',
    version: '^1.0.0',
    moduleName: 'RemoteComponent',
    scopeName: 'myorg',
  }
);

<EnhancedComponent message="Hello" />
```

### useRemoteModuleHook

Hook：在函数组件中加载远程模块。

```tsx
import { useRemoteModuleHook } from 'remote-reload-utils';

function MyComponent() {
  const { component: RemoteComp, loading, error } = useRemoteModuleHook({
    pkg: '@myorg/remote-app',
    version: '^1.0.0',
    moduleName: 'Dashboard',
    scopeName: 'myorg',
  });

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error.message}</div>;
  if (!RemoteComp) return null;

  return <RemoteComp userId={123} />;
}
```

---

## 组合使用模式

### 完整错误处理

```tsx
import { ErrorBoundary, RemoteModuleProvider } from 'remote-reload-utils';

<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h3>Application Error</h3>
      <p>{error.message}</p>
      <button onClick={reset}>Reload</button>
    </div>
  )}
  onError={(error, info) => reportError(error, info)}
>
  <RemoteModuleProvider
    pkg="@myorg/remote-app"
    version="^1.0.0"
    moduleName="Dashboard"
    scopeName="myorg"
    loadingFallback={<Spinner />}
  />
</ErrorBoundary>
```

### Lazy + Suspense 模式

```tsx
import { lazyRemote } from 'remote-reload-utils';

const LazyRemote = lazyRemote({
  pkg: '@myorg/remote-app',
  version: '^1.0.0',
  moduleName: 'Dashboard',
  scopeName: 'myorg',
  maxRetries: 3,
});

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyRemote userId={123} />
    </Suspense>
  );
}
```
