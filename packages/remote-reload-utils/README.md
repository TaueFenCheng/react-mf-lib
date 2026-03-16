# Rslib project

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get started

Build the library:

```bash
pnpm build
```

Build the library in watch mode:

```bash
pnpm dev
```

### 使用方式

#### 1. 基础加载远程模块

```ts
import { loadRemoteMultiVersion } from 'remote-reload-utils';
const [comp, setComp] = useState(null);
useEffect(() => {
  async function init() {
    const { scopeName, mf } = await loadRemoteMultiVersion({
      name: 'react_mf_lib',
      pkg: 'test-mf-unpkg',
      version: '1.0.5',
      // version: 'latest',
    });
    if (!mf) {
      return;
    }
    if (mf) {
      console.log(mf);
      const mod = await mf.loadRemote(`${scopeName}/Button`);
      console.log(mod.default); // 这里就是远程组件
      setComp(mod.default);
    }
    // 用 mf 实例加载暴露的模块
    // const mod = await mf.loadRemote(`${scopeName}/Button`);
    // const mod = await mf.loadRemote(`react_mf_lib/Button`);
    // console.log(mod.default);
  }
  init();
}, []);
```

#### 2. 使用 React 组件加载远程模块

```tsx
import { RemoteModuleProvider, ErrorBoundary, lazyRemote } from 'remote-reload-utils';
import React, { Suspense } from 'react';

// 方式一：使用 RemoteModuleProvider 组件（推荐）
function App() {
  return (
    <RemoteModuleProvider
      pkg="@myorg/remote-app"
      version="^1.0.0"
      moduleName="Dashboard"
      scopeName="myorg"
      loadingFallback={<Spinner />}
      errorFallback={(error, reset) => (
        <div>
          <p>加载失败：{error.message}</p>
          <button onClick={reset}>重试</button>
        </div>
      )}
      componentProps={{ userId: 123 }}
    />
  );
}

// 方式二：使用 lazy + Suspense
const LazyDashboard = lazyRemote({
  pkg: "@myorg/remote-app",
  version: "^1.0.0",
  moduleName: "Dashboard",
  scopeName: "myorg"
});

function App() {
  return (
    <ErrorBoundary fallback={(error) => <div>错误：{error.message}</div>}>
      <Suspense fallback={<Spinner />}>
        <LazyDashboard userId={123} />
      </Suspense>
    </ErrorBoundary>
  );
}

// 方式三：使用 SuspenseRemoteLoader（一体化方案）
function App() {
  return (
    <SuspenseRemoteLoader
      pkg="@myorg/remote-app"
      version="^1.0.0"
      moduleName="Dashboard"
      scopeName="myorg"
      fallback={<Spinner />}
      errorFallback={(error) => <div>错误：{error.message}</div>}
      componentProps={{ userId: 123 }}
    />
  );
}
```
