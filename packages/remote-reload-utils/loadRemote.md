# loadRemote 使用文档

`remote-reload-utils` 是一个用于运行时动态加载远程 React 组件的工具库。本文档提供详细的使用指南和 API 参考。

## 目录

- [简介](#简介)
- [核心功能](#核心功能)
- [安装](#安装)
- [快速开始](#快速开始)
- [API 参考](#api-参考)
- [高级功能](#高级功能)
  - [预加载远程模块](#预加载远程模块)
  - [卸载远程模块](#卸载远程模块)
  - [健康检查](#健康检查)
  - [React Hooks](#react-hooks)
  - [跨模块共享状态](#跨模块共享状态)
  - [事件总线](#事件总线)
  - [版本兼容性检查](#版本兼容性检查)
  - [React 组件适配器](#react-组件适配器)
- [配置选项](#配置选项)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)
- [类型定义](#类型定义)

## 简介

该工具库基于 `@module-federation/enhanced/runtime`，提供了以下增强功能：

- **多版本支持**: 可以同时加载同一个包的不同版本
- **CDN 故障转移**: 自动在多个 CDN 之间切换
- **智能缓存**: 本地缓存版本信息，减少网络请求
- **重试机制**: 加载失败时自动重试
- **TypeScript 支持**: 完整的类型定义

## 核心功能

### 1. 多版本共存

```typescript
// 同时加载 1.0.0 和 2.0.0 版本
const v1 = await loadRemoteMultiVersion({
  name: 'component_v1',
  pkg: 'my-ui-lib',
  version: '1.0.0',
});

const v2 = await loadRemoteMultiVersion({
  name: 'component_v2',
  pkg: 'my-ui-lib',
  version: '2.0.0',
});

// 两个版本可以同时使用
```

### 2. CDN 故障转移

```typescript
// 自动尝试多个 CDN
const { mf } = await loadRemoteMultiVersion({
  name: 'my_app',
  pkg: 'my-component',
  version: '1.0.0',
  // 内置顺序：
  // 1. cdn.jsdelivr.net
  // 2. unpkg.com
  // 3. localFallback (如果提供)
});
```

### 3. 智能缓存

```typescript
// 使用 latest 时，优先从缓存读取
const { mf } = await loadRemoteMultiVersion({
  name: 'my_app',
  pkg: 'my-component',
  version: 'latest',
  cacheTTL: 24 * 60 * 60 * 1000, // 24 小时缓存
  revalidate: true, // 后台异步验证最新版本
});
```

## 安装

```bash
pnpm add remote-reload-utils
```

或从 workspace 安装：

```bash
pnpm add remote-reload-utils --workspace
```

## 快速开始

### 1. 基础使用

```typescript
import { loadRemoteMultiVersion } from 'remote-reload-utils';
import { useEffect, useState } from 'react';

function App() {
  const [Button, setButton] = useState(null);

  useEffect(() => {
    async function loadComponent() {
      // 加载远程模块
      const { scopeName, mf } = await loadRemoteMultiVersion({
        name: 'ui_lib',
        pkg: 'my-ui-components',
        version: '1.0.0',
      });

      // 加载具体的组件
      const mod = await mf.loadRemote(`${scopeName}/Button`);
      setButton(mod.default);
    }

    loadComponent();
  }, []);

  return (
    <div>
      {Button && <Button>Click me</Button>}
    </div>
  );
}
```

### 2. 加载多个组件

```typescript
async function loadMultipleComponents() {
  const { scopeName, mf } = await loadRemoteMultiVersion({
    name: 'ui_lib',
    pkg: 'my-ui-components',
    version: '1.0.0',
  });

  // 并行加载多个组件
  const [Button, Card, Modal] = await Promise.all([
    mf.loadRemote(`${scopeName}/Button`),
    mf.loadRemote(`${scopeName}/Card`),
    mf.loadRemote(`${scopeName}/Modal`),
  ]);

  return {
    Button: Button.default,
    Card: Card.default,
    Modal: Modal.default,
  };
}
```

## API 参考

### loadRemoteMultiVersion

```typescript
function loadRemoteMultiVersion(
  options: LoadRemoteOptions,
  plugins: ModuleFederationRuntimePlugin[]
): Promise<LoadResult>
```

#### 参数

**options**: `LoadRemoteOptions`

| 属性 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `name` | `string` | ✅ | - | Module Federation 的名称 |
| `pkg` | `string` | ✅ | - | npm 包名 |
| `version` | `string` | ❌ | `'latest'` | 版本号或 `'latest'` |
| `retries` | `number` | ❌ | `3` | 每个 CDN 的重试次数 |
| `delay` | `number` | ❌ | `1000` | 重试间隔（毫秒） |
| `localFallback` | `string` | ❌ | - | 本地兜底 URL |
| `cacheTTL` | `number` | ❌ | `86400000` | 缓存有效期（毫秒） |
| `revalidate` | `boolean` | ❌ | `true` | 是否异步验证最新版本 |
| `shared` | `Record<string, any>` | ❌ | - | 自定义共享模块配置 |

**plugins**: `ModuleFederationRuntimePlugin[]`

Module Federation 运行时插件数组，默认会添加 `fallbackPlugin()`。

#### 返回值

```typescript
interface LoadResult {
  scopeName: string;  // 远程模块作用域名称
  mf: ReturnType<typeof createInstance>;  // Module Federation 实例
}
```

#### 使用 MF 实例

```typescript
const { scopeName, mf } = await loadRemoteMultiVersion(options);

// 加载暴露的模块
const module = await mf.loadRemote(`${scopeName}/Button`);

// module.default 就是导出的组件或函数
const Button = module.default;

// 也可以直接使用完整的模块路径
const Button2 = await mf.loadRemote('ui_lib/Button');
```

### loadReactVersion

加载特定版本的 React 和 ReactDOM，用于多版本 React 场景。

```typescript
function loadReactVersion(version: '17' | '18' | '19'): Promise<{
  React: any;
  ReactDOM: any;
}>
```

#### 参数

- `version`: React 版本号，可选 `'17'`、`'18'` 或 `'19'`

#### 返回值

返回包含 React 和 ReactDOM 的对象。

#### 示例

```typescript
const { React, ReactDOM } = await loadReactVersion('18');

// 使用特定版本的 React
const App = () => {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
};
```

## 配置选项

### LoadRemoteOptions 详细说明

#### name

Module Federation 的名称，用于标识远程模块。

```typescript
{
  name: 'my_ui_lib',  // 在加载组件时使用
  pkg: 'my-ui-components',
}
```

#### pkg

npm 包名，用于从 CDN 加载。

```typescript
{
  name: 'my_ui_lib',
  pkg: '@company/ui-components',  // 支持作用域包
}
```

#### version

指定要加载的版本号。

```typescript
// 固定版本
{ version: '1.0.0' }

// 最新版本（使用缓存）
{ version: 'latest' }

// 版本范围（需要预先知道具体版本）
{ version: '2.1.0' }
```

#### retries 和 delay

控制重试行为。

```typescript
{
  retries: 5,        // 每个 CDN 重试 5 次
  delay: 2000,       // 每次重试间隔 2 秒
}
```

#### localFallback

本地开发时的兜底地址。

```typescript
{
  localFallback: 'http://localhost:3001/remoteEntry.js',
}
```

#### cacheTTL

缓存有效期。

```typescript
{
  cacheTTL: 12 * 60 * 60 * 1000,  // 12 小时
}
```

#### revalidate

是否异步验证最新版本。

```typescript
{
  version: 'latest',
  revalidate: true,  // 后台检查，不阻塞加载
}
```

#### shared

自定义共享模块配置。

```typescript
{
  shared: {
    react: {
      shareConfig: {
        singleton: true,
        eager: true,
        requiredVersion: '^18.0.0',
      },
    },
    lodash: {
      shareConfig: {
        singleton: false,
      },
    },
  },
}
```

## 使用示例

### 示例 1: React Hook 封装

```typescript
import { loadRemoteMultiVersion } from 'remote-reload-utils';

function useRemoteComponent(
  pkg: string,
  version: string,
  componentName: string
) {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { scopeName, mf } = await loadRemoteMultiVersion({
          name: pkg.replace(/[^a-z0-9]/gi, '_'),
          pkg,
          version,
        });

        const mod = await mf.loadRemote(`${scopeName}/${componentName}`);
        setComponent(mod.default);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [pkg, version, componentName]);

  return { Component, loading, error };
}

// 使用
function App() {
  const { Component: Button, loading, error } = useRemoteComponent(
    'my-ui-components',
    '1.0.0',
    'Button'
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <Button>Remote Button</Button>;
}
```

### 示例 2: 动态加载配置

```typescript
interface RemoteComponentConfig {
  pkg: string;
  version: string;
  component: string;
}

const configs: RemoteComponentConfig[] = [
  { pkg: 'my-ui-components', version: '1.0.0', component: 'Button' },
  { pkg: 'my-ui-components', version: '1.0.0', component: 'Card' },
  { pkg: 'another-lib', version: '2.1.0', component: 'Modal' },
];

function loadComponentsFromConfig(configs: RemoteComponentConfig[]) {
  return Promise.all(
    configs.map(async (config) => {
      const { scopeName, mf } = await loadRemoteMultiVersion({
        name: config.pkg.replace(/[^a-z0-9]/gi, '_'),
        pkg: config.pkg,
        version: config.version,
      });

      const mod = await mf.loadRemote(`${scopeName}/${config.component}`);
      return {
        name: config.component,
        Component: mod.default,
      };
    })
  );
}

// 使用
const components = await loadComponentsFromConfig(configs);
const Button = components.find(c => c.name === 'Button')?.Component;
```

### 示例 3: 错误处理和降级

```typescript
async function loadRemoteWithFallback(
  pkg: string,
  version: string,
  componentName: string,
  FallbackComponent: React.ComponentType
) {
  try {
    const { scopeName, mf } = await loadRemoteMultiVersion({
      name: pkg.replace(/[^a-z0-9]/gi, '_'),
      pkg,
      version,
      retries: 2,
      delay: 500,
    });

    const mod = await mf.loadRemote(`${scopeName}/${componentName}`);
    return mod.default;
  } catch (error) {
    console.warn(`Failed to load ${componentName}, using fallback:`, error);
    return FallbackComponent;
  }
}

// 使用
const Button = await loadRemoteWithFallback(
  'my-ui-components',
  '1.0.0',
  'Button',
  () => <button>Fallback Button</button>
);
```

### 示例 4: 预加载

```typescript
// 在应用启动时预加载组件
const preloadComponents = async () => {
  const components = [
    { pkg: 'my-ui-components', version: '1.0.0', name: 'Button' },
    { pkg: 'my-ui-components', version: '1.0.0', name: 'Card' },
  ];

  for (const comp of components) {
    loadRemoteMultiVersion({
      name: comp.pkg.replace(/[^a-z0-9]/gi, '_'),
      pkg: comp.pkg,
      version: comp.version,
    }).catch(console.warn); // 预加载失败不影响启动
  }
};

// 在 App 组件中调用
function App() {
  useEffect(() => {
    preloadComponents();
  }, []);

  return <div>...</div>;
}
```

### 示例 5: 多版本对比

```typescript
function VersionComparison() {
  const [v1Button, setV1Button] = useState(null);
  const [v2Button, setV2Button] = useState(null);

  useEffect(() => {
    async function load() {
      const [{ mf: mf1 }, { mf: mf2 }] = await Promise.all([
        loadRemoteMultiVersion({
          name: 'ui_v1',
          pkg: 'my-ui-components',
          version: '1.0.0',
        }),
        loadRemoteMultiVersion({
          name: 'ui_v2',
          pkg: 'my-ui-components',
          version: '2.0.0',
        }),
      ]);

      const [mod1, mod2] = await Promise.all([
        mf1.loadRemote('ui_v1/Button'),
        mf2.loadRemote('ui_v2/Button'),
      ]);

      setV1Button(mod1.default);
      setV2Button(mod2.default);
    }

    load();
  }, []);

  return (
    <div>
      <h3>Version 1.0.0</h3>
      {v1Button && <v1Button />}

      <h3>Version 2.0.0</h3>
      {v2Button && <v2Button />}
    </div>
  );
}
```

## 最佳实践

### 1. 版本管理

```typescript
// ✅ 好的做法：生产环境使用固定版本
const { mf } = await loadRemoteMultiVersion({
  name: 'ui_lib',
  pkg: 'my-ui-components',
  version: '1.2.3',  // 固定版本
});

// ⚠️ 谨慎使用：latest 可能导致不可预期的变化
const { mf } = await loadRemoteMultiVersion({
  name: 'ui_lib',
  pkg: 'my-ui-components',
  version: 'latest',
});
```

### 2. 错误处理

```typescript
// ✅ 好的做法：提供加载状态和错误处理
function RemoteButton() {
  const [state, setState] = useState({
    Component: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadRemoteComponent()
      .then(Component => setState({ Component, loading: false, error: null }))
      .catch(error => setState({ Component: null, loading: false, error }));
  }, []);

  if (state.loading) return <Spinner />;
  if (state.error) return <ErrorFallback error={state.error} />;
  return <state.Component />;
}
```

### 3. 缓存策略

```typescript
// ✅ 好的做法：合理设置缓存时间
const { mf } = await loadRemoteMultiVersion({
  name: 'ui_lib',
  pkg: 'my-ui-components',
  version: 'latest',
  cacheTTL: 24 * 60 * 60 * 1000,  // 24 小时
  revalidate: true,  // 后台验证新版本
});

// ⚠️ 避免设置过短的缓存
cacheTTL: 60000,  // 1 分钟 - 太短，增加请求次数
```

### 4. 性能优化

```typescript
// ✅ 好的做法：并行加载多个组件
const [Button, Card] = await Promise.all([
  mf.loadRemote('ui_lib/Button'),
  mf.loadRemote('ui_lib/Card'),
]);

// ❌ 避免：顺序加载
const Button = await mf.loadRemote('ui_lib/Button');
const Card = await mf.loadRemote('ui_lib/Card');  // 等待 Button 加载完才开始
```

### 5. 本地开发

```typescript
// ✅ 好的做法：开发环境使用本地兜底
const isDev = process.env.NODE_ENV === 'development';

const { mf } = await loadRemoteMultiVersion({
  name: 'ui_lib',
  pkg: 'my-ui-components',
  version: '1.0.0',
  ...(isDev && {
    localFallback: 'http://localhost:3001/remoteEntry.js',
  }),
});
```

## 故障排查

### 常见问题

#### 1. 加载失败：网络错误

**症状**: 控制台显示 `[MF] 所有 CDN 加载失败`

**解决方案**:
- 检查网络连接
- 验证 CDN 地址是否可访问
- 增加 `retries` 和 `delay` 值
- 配置 `localFallback` 作为兜底

```typescript
{
  retries: 5,
  delay: 2000,
  localFallback: 'http://localhost:3001/remoteEntry.js',
}
```

#### 2. 版本缓存过期

**症状**: 使用 `latest` 时版本不是最新的

**解决方案**:
- 清除 localStorage 中的 `mf-multi-version` 键
- 减少 `cacheTTL` 值
- 手动指定版本号

```typescript
localStorage.removeItem('mf-multi-version');
```

#### 3. 组件渲染错误

**症状**: 组件加载成功但渲染报错

**解决方案**:
- 检查 React 版本兼容性
- 确认共享模块配置正确
- 使用错误边界捕获错误

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

#### 4. 类型错误

**症状**: TypeScript 报错找不到类型定义

**解决方案**:
- 确保远程组件已发布类型定义
- 检查 `tsconfig.json` 的 `moduleResolution` 配置
- 使用 `import type` 导入类型

```typescript
import type { ButtonProps } from 'my-ui-components';
```

### 调试技巧

#### 1. 启用详细日志

```typescript
const { mf } = await loadRemoteMultiVersion(options, [
  {
    name: 'debug-plugin',
    afterResolve(args) {
      console.log('[Debug] Resolved:', args);
    },
  },
]);
```

#### 2. 监控加载状态

```typescript
console.log('Starting load...');

const { scopeName, mf } = await loadRemoteMultiVersion(options);

console.log('MF instance created:', mf);

const mod = await mf.loadRemote(`${scopeName}/Button`);

console.log('Module loaded:', mod);
```

#### 3. 验证 CDN 地址

```typescript
function buildCdnUrls(pkg: string, version: string) {
  return [
    `https://cdn.jsdelivr.net/npm/${pkg}@${version}/dist/remoteEntry.js`,
    `https://unpkg.com/${pkg}@${version}/dist/remoteEntry.js`,
  ];
}

// 在浏览器中手动访问这些 URL 验证是否可用
```

## 高级功能

### 预加载远程模块

使用 `preloadRemote` 预加载远程模块，提升用户体验。

```typescript
import { preloadRemote } from 'remote-reload-utils';

// 空闲时预加载
preloadRemote({
  name: 'my-lib',
  pkg: 'my-ui-lib',
  version: '1.0.0',
  priority: 'idle',  // 'idle' 或 'high'
});

// 批量预加载
await preloadRemoteList([
  { name: 'lib1', pkg: 'pkg1', version: '1.0.0' },
  { name: 'lib2', pkg: 'pkg2', version: '2.0.0' },
], (loaded, total) => {
  console.log(`加载进度: ${loaded}/${total}`);
});

// 检查预加载状态
const status = getPreloadStatus('my-lib');
if (status?.loaded) {
  console.log('已预加载，时间戳:', status.timestamp);
}

// 取消预加载
cancelPreload('my-lib');

// 清除所有预加载缓存
clearPreloadCache();
```

### 卸载远程模块

使用 `unloadRemote` 卸载已加载的远程模块，释放资源。

```typescript
import { unloadRemote, unloadAll, getLoadedRemotes } from 'remote-reload-utils';

// 卸载指定模块
await unloadRemote({
  name: 'my-lib',
  pkg: 'my-ui-lib',
  version: '1.0.0',
});

// 卸载所有模块
await unloadAll(true);  // true 表示同时清除缓存

// 查看已加载的模块
const loaded = getLoadedRemotes();
console.log(loaded);
// [{ name, pkg, version, loadedModules, timestamp }]
```

### 健康检查

使用 `checkRemoteHealth` 检查远程模块的可用性和性能。

```typescript
import { checkRemoteHealth, getRemoteHealthReport, formatHealthStatus } from 'remote-reload-utils';

// 检查单个远程模块
const health = await checkRemoteHealth({
  name: 'my-lib',
  pkg: 'my-ui-lib',
  version: '1.0.0',
});

console.log(formatHealthStatus(health.status));
// 🟢 healthy 或 🟡 degraded 或 🔴 unhealthy

// 批量检查多个远程模块
const report = await getRemoteHealthReport([
  { name: 'lib1', pkg: 'pkg1' },
  { name: 'lib2', pkg: 'pkg2' },
]);

console.log('总体状态:', report.overall);
```

### React Hooks

提供 `useRemote` 和 `useRemoteList` Hooks，简化 React 中的使用。

```typescript
import { useRemote, useRemoteList, onRemoteReady, onRemoteError } from 'remote-reload-utils';

// 单个远程组件
function MyComponent() {
  const { component: Button, loading, error, retry } = useRemote({
    name: 'ui-lib',
    pkg: 'my-ui-lib',
    modulePath: 'Button',
    version: '1.0.0',
    onReady: (comp) => console.log('加载成功'),
    onError: (err) => console.error('加载失败', err),
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <button onClick={retry}>重试</button>;

  return Button ? <Button /> : null;
}

// 批量加载
function MultiComponent() {
  const { components, loading, errors } = useRemoteList({
    remotes: [
      { name: 'lib1', pkg: 'pkg1', modulePath: 'Button' },
      { name: 'lib2', pkg: 'pkg2', modulePath: 'Card' },
    ],
    onAllReady: (cmps) => console.log('全部加载完成'),
    onRemoteError: (err, pkg) => console.error(`${pkg} 加载失败`, err),
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {components.get('pkg1/Button')?.()}
      {components.get('pkg2/Card')?.()}
    </div>
  );
}

// 事件监听
onRemoteReady('ui-lib', (scopeName, mf) => {
  console.log('远程模块已就绪', scopeName);
});

onRemoteError('ui-lib', (error) => {
  console.error('远程模块加载失败', error);
});
```

### 跨模块共享状态

使用 `createSharedContext` 在不同远程模块间共享状态。

```typescript
import { createSharedContext } from 'remote-reload-utils';

// 创建共享上下文
const { Provider, useContext, useSharedState, useSelector, setValue, getValue, reset, destroy } =
  createSharedContext('app-store', { count: 0, user: null });

// 在 React 中使用
function App() {
  return (
    <Provider value={{ count: 0, user: null }}>
      <Counter />
      <UserInfo />
    </Provider>
  );
}

function Counter() {
  const [count, setCount] = useSharedState();
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

function UserInfo() {
  const user = useSelector((state) => state.user);
  return <div>{user?.name || '未登录'}</div>;
}

// 非 React 环境使用
setValue({ count: 5, user: { id: 1, name: '张三' } });
const current = getValue();
reset();  // 重置为初始值
destroy();  // 销毁上下文
```

### 事件总线

使用 `eventBus` 实现跨模块通信。

```typescript
import { eventBus, createEventBus } from 'remote-reload-utils';

// 监听事件
const unsubscribe = eventBus.on('user-login', (user) => {
  console.log('用户登录:', user);
});

// 一次性监听
eventBus.once('notification', (data) => {
  console.log('收到通知:', data);
});

// 发送事件
eventBus.emit('user-login', { id: 1, name: '张三' });
eventBus.emit('notification', { message: '有新消息' }, { source: 'system' });

// 带过滤条件监听
eventBus.on('order', (order) => {
  console.log('订单:', order);
}, { filter: (order) => order.status === 'paid' });

// 查看历史事件
const history = eventBus.getHistory('user-login');
console.log('登录历史:', history);

// 查看所有事件
console.log('所有事件:', eventBus.getEvents());

// 清除事件
eventBus.clear('user-login');  // 清除单个事件
eventBus.clear();  // 清除所有事件

// 创建独立的事件总线实例
const myBus = createEventBus();
```

### 版本兼容性检查

使用 `checkVersionCompatibility` 检查版本兼容性。

```typescript
import {
  checkVersionCompatibility,
  satisfiesVersion,
  findCompatibleVersion,
  fetchAvailableVersions,
  sortVersions,
  getLatestVersion,
  getStableVersions,
} from 'remote-reload-utils';

// 检查版本兼容性
const result = checkVersionCompatibility('18.2.0', '^18.0.0', 'react');
console.log(result.compatible);  // true
console.log(result.severity);    // 'info' | 'warning' | 'error'
console.log(result.message);     // 描述信息
console.log(result.suggestion);  // 升级建议

// 检查是否满足版本范围
satisfiesVersion('1.2.3', '^1.0.0');  // true
satisfiesVersion('2.0.0', '^1.0.0');  // false

// 查找兼容版本
const versions = ['1.0.0', '1.1.0', '2.0.0', '2.1.0'];
findCompatibleVersion(versions, { min: '1.0.0', max: '2.0.0' });  // '2.0.0'

// 获取可用版本
const available = await fetchAvailableVersions('react');
const sorted = sortVersions(available, 'desc');
const latest = getLatestVersion(available);
const stable = getStableVersions(available);  // 过滤掉 alpha/beta/rc 版本
```

### React 组件适配器

提供多种方式在 React 中使用远程组件。

```typescript
import { RemoteComponent, SuspenseRemote, ErrorBoundary, withRemote, lazyRemote } from 'remote-reload-utils';

// 1. 直接使用 RemoteComponent
function App() {
  return (
    <RemoteComponent
      name="ui-lib"
      pkg="my-ui-lib"
      modulePath="Button"
      version="1.0.0"
      fallback={<div>Loading...</div>}
      errorFallback={(error) => <div>加载失败: {error.message}</div>}
      onLoading={() => console.log('开始加载')}
      onError={(error) => console.error(error)}
    />
  );
}

// 2. 使用 SuspenseRemote（支持 React.Suspense）
function App() {
  return (
    <SuspenseRemote
      name="ui-lib"
      pkg="my-ui-lib"
      modulePath="Button"
      version="1.0.0"
      loading={<div>Loading...</div>}
    >
      <ChildComponent />
    </SuspenseRemote>
  );
}

// 3. 使用 withRemote 高阶组件
const RemoteButton = withRemote({
  name: 'ui-lib',
  pkg: 'my-ui-lib',
  modulePath: 'Button',
  version: '1.0.0',
})(OriginalButton);

// 4. 使用 lazyRemote（支持 React.lazy）
const RemoteButton = lazyRemote({
  name: 'ui-lib',
  pkg: 'my-ui-lib',
  modulePath: 'Button',
  version: '1.0.0',
});

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <RemoteButton />
    </React.Suspense>
  );
}

// 5. 使用 ErrorBoundary 包裹
function App() {
  return (
    <ErrorBoundary fallback={(error) => <div>出错了: {error.message}</div>}>
      <RemoteComponent {...config} />
    </ErrorBoundary>
  );
}
```

## 类型定义

```typescript
interface LoadRemoteOptions {
  name: string;  // 模块联邦 name（基础名）
  pkg: string;  // npm 包名
  version?: string;  // 指定版本 or "latest"
  retries?: number;  // 重试次数
  delay?: number;  // 重试间隔
  localFallback?: string;  // 本地兜底
  cacheTTL?: number;  // 缓存时间
  revalidate?: boolean;  // 灰度更新
  shared?: Record<string, ModuleFederationRuntimePlugin>;  // 自定义 shared 配置
}

interface VersionCache {
  [pkg: string]: {
    [version: string]: {
      timestamp: number;
    };
  };
}

interface LoadResult {
  scopeName: string;
  mf: ReturnType<typeof createInstance>;
}

// 预加载相关类型
interface PreloadOptions extends LoadRemoteOptions {
  priority?: 'idle' | 'high';
  force?: boolean;
}

interface PreloadCacheItem {
  version: string;
  scopeName: string;
  mf: any;
  timestamp: number;
}

interface PreloadStatus {
  loaded: boolean;
  timestamp: number;
}

// 健康检查相关类型
interface HealthCheckResult {
  pkg: string;
  version: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  cdn: string;
  details: {
    cdnReachable: boolean;
    remoteEntryValid: boolean;
    modulesLoadable: boolean;
    error?: string;
  };
}

interface RemoteHealthReport {
  timestamp: number;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  remotes: HealthCheckResult[];
}

// 事件总线相关类型
type EventCallback<T = any> = (data: T, meta?: EventMeta) => void;

interface EventMeta {
  timestamp: number;
  source?: string;
  id?: string;
}

interface EventEmitterOptions {
  once?: boolean;
  filter?: (data: any, meta: EventMeta) => boolean;
}

// 版本检查相关类型
interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
  raw: string;
}

interface CompatibilityResult {
  compatible: boolean;
  currentVersion: string;
  requiredVersion: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

interface VersionRange {
  min?: string;
  max?: string;
  exact?: string;
}

// React Hooks 相关类型
interface RemoteHookResult<T = any> {
  component: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
  scopeName: string | null;
  mf: any | null;
}

interface UseRemoteOptions extends LoadRemoteOptions {
  modulePath: string;
  plugins?: ModuleFederationRuntimePlugin[];
  onReady?: (component: any, scopeName: string) => void;
  onError?: (error: Error) => void;
  skip?: boolean;
}

// 共享上下文相关类型
interface SharedContextApi<T> {
  Provider: React.ComponentType<{ value: T; children: React.ReactNode }>;
  useContext: () => T;
  useSharedState: () => [T, (value: T | ((prev: T) => T)) => void];
  useSelector: <R>(selector: (value: T) => R) => R;
  setValue: (value: T | ((prev: T) => T)) => void;
  getValue: () => T;
  subscribe: (listener: (value: T) => void) => () => void;
  reset: () => void;
  destroy: () => void;
}
```

## 更多资源

- [Module Federation 官方文档](https://module-federation.io/)
- [@module-federation/enhanced 文档](https://github.com/module-federation/enhanced)
- [主项目 README](../../readme.md)
