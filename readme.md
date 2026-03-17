# React Module Federation Utils

一个用于运行时动态加载远程 React 组件的工具库，支持多版本共存、CDN 故障转移和完整的模块生命周期管理。

[![npm version](https://img.shields.io/npm/v/remote-reload-utils.svg)](https://www.npmjs.com/package/remote-reload-utils)
[![License](https://img.shields.io/npm/l/remote-reload-utils.svg)](https://github.com/TaueFenCheng/react-mf-lib/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

## 特性

- 🚀 **运行时动态加载** - 无需重新构建即可加载远程组件
- 📦 **多版本支持** - 支持同一包的多个版本同时运行
- 🔄 **CDN 故障转移** - 自动在多个 CDN 之间切换，提高可用性
- 💾 **智能缓存** - 内置版本缓存机制，减少网络请求
- 🎯 **TypeScript 支持** - 完整的类型定义
- ⚛️ **React 友好** - 专为 React 组件 Module Federation 设计
- 🔧 **可扩展** - 插件系统支持自定义扩展
- 📊 **性能优化** - 预加载、卸载、健康检查
- 🔗 **事件总线** - 跨模块通信支持
- ✅ **质量保障** - 155+ 单元测试，高覆盖率

## 安装

```bash
npm install remote-reload-utils
# 或
pnpm add remote-reload-utils
# 或
yarn add remote-reload-utils
```

## 快速开始

### 基本使用

```typescript
import { loadRemoteMultiVersion } from 'remote-reload-utils';

async function loadRemoteComponent() {
  const { scopeName, mf } = await loadRemoteMultiVersion({
    name: 'my-remote-app',
    pkg: '@myorg/remote-app',
    version: '1.0.0',
  });

  const mod = await mf.loadRemote(`${scopeName}/Button`);
  return mod.default;
}
```

### React Hooks 方式

```typescript
import { useRemoteModuleHook } from 'remote-reload-utils';

function MyComponent() {
  const { component: RemoteButton, loading, error } = useRemoteModuleHook({
    pkg: '@myorg/remote-app',
    version: '^1.0.0',
    moduleName: 'Button',
    scopeName: 'myorg',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!RemoteButton) return null;

  return <RemoteButton onClick={() => console.log('clicked')} />;
}
```

### 使用 RemoteModuleProvider

```typescript
import { RemoteModuleProvider } from 'remote-reload-utils';

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
    />
  );
}
```

## 完整 API 文档

### 核心加载

#### loadRemoteMultiVersion

动态加载远程模块，支持多版本和故障转移。

```typescript
import { loadRemoteMultiVersion } from 'remote-reload-utils';

const { scopeName, mf } = await loadRemoteMultiVersion(options, plugins);
```

**参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | `string` | ✅ | - | Module Federation 的名称 |
| `pkg` | `string` | ✅ | - | npm 包名 |
| `version` | `string` | ❌ | `'latest'` | 版本号或 `'latest'` |
| `retries` | `number` | ❌ | `3` | 每个 CDN 的重试次数 |
| `delay` | `number` | ❌ | `1000` | 重试间隔（毫秒） |
| `localFallback` | `string` | ❌ | - | 本地兜底 URL |
| `cacheTTL` | `number` | ❌ | `86400000` | 缓存时间（毫秒） |
| `revalidate` | `boolean` | ❌ | `true` | 异步重新验证最新版本 |
| `shared` | `Record<string, any>` | ❌ | - | 自定义共享模块配置 |

**返回值**: `Promise<{ scopeName: string, mf: ModuleFederationInstance }>`

### 预加载

```typescript
import { preloadRemote, preloadRemoteList } from 'remote-reload-utils';

// 预加载单个模块
await preloadRemote({
  pkg: '@myorg/remote-app',
  version: '1.0.0',
  name: 'myorg',
  priority: 'idle', // 'idle' | 'high'
  force: false,
});

// 预加载多个模块
await preloadRemoteList([
  { pkg: '@myorg/app1', version: '1.0.0', name: 'app1' },
  { pkg: '@myorg/app2', version: '2.0.0', name: 'app2' },
], (loaded, total) => {
  console.log(`Progress: ${loaded}/${total}`);
});
```

### 卸载

```typescript
import { unloadRemote, unloadAll } from 'remote-reload-utils';

// 卸载特定模块
await unloadRemote({
  name: 'myorg',
  pkg: '@myorg/remote-app',
  version: '1.0.0',
  clearCache: true,
});

// 卸载所有模块
await unloadAll(true); // true = 清除所有缓存
```

### 健康检查

```typescript
import { checkRemoteHealth, getRemoteHealthReport } from 'remote-reload-utils';

// 检查单个远程模块健康状态
const health = await checkRemoteHealth({
  pkg: '@myorg/remote-app',
  version: '1.0.0',
  name: 'myorg',
});

console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'
console.log(health.latency); // 延迟（毫秒）

// 生成健康报告
const report = await getRemoteHealthReport([
  { pkg: '@myorg/app1', version: '1.0.0', name: 'app1' },
  { pkg: '@myorg/app2', version: '2.0.0', name: 'app2' },
]);

console.log(report.overall); // 'healthy' | 'degraded' | 'unhealthy'
```

### 事件总线

```typescript
import { eventBus } from 'remote-reload-utils';

// 订阅事件
const unsubscribe = eventBus.on('user-login', (user, meta) => {
  console.log('User logged in:', user);
  console.log('Event meta:', meta); // { timestamp, source, id }
});

// 发送事件
eventBus.emit('user-login', { id: 1, name: 'John' });

// 只触发一次的订阅
eventBus.once('notification', (msg) => {
  console.log('Received once:', msg);
});

// 带过滤器的订阅
eventBus.on(
  'message',
  (data) => console.log('Received:', data),
  { filter: (data) => data.priority === 'high' }
);

// 取消订阅
unsubscribe();

// 获取事件历史
const history = eventBus.getHistory('user-login');

// 获取所有事件
const events = eventBus.getEvents();
```

### 版本工具

```typescript
import {
  checkVersionCompatibility,
  satisfiesVersion,
  parseVersion,
  compareVersions,
  getLatestVersion,
  getStableVersions,
} from 'remote-reload-utils';

// 检查版本兼容性
const result = checkVersionCompatibility('18.2.0', '^18.0.0', 'react');
console.log(result.compatible); // true
console.log(result.severity); // 'info' | 'warning' | 'error'

// 版本范围匹配
satisfiesVersion('1.5.0', '^1.0.0'); // true
satisfiesVersion('2.0.0', '~1.2.0'); // false
satisfiesVersion('1.2.5', '>=1.2.0'); // true

// 版本解析
const parsed = parseVersion('1.2.3-alpha.1');
// { major: 1, minor: 2, patch: 3, prerelease: 'alpha.1', raw: '1.2.3-alpha.1' }

// 版本比较
compareVersions('2.0.0', '1.0.0'); // > 0
compareVersions('1.0.0', '1.0.0'); // 0

// 获取最新稳定版本
const versions = ['1.0.0', '2.0.0-alpha', '2.0.0', '3.0.0-beta'];
getLatestVersion(versions); // '3.0.0-beta'
getStableVersions(versions); // ['1.0.0', '2.0.0']
```

### React 组件

#### ErrorBoundary

```typescript
import { ErrorBoundary } from 'remote-reload-utils';

<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
  onError={(error, errorInfo) => {
    console.error('Caught error:', error, errorInfo);
  }}
  onReset={() => console.log('Reset clicked')}
>
  <MyComponent />
</ErrorBoundary>
```

#### SuspenseRemoteLoader

```typescript
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

#### lazyRemote

```typescript
import { lazyRemote } from 'remote-reload-utils';
import { Suspense } from 'react';

const RemoteDashboard = lazyRemote({
  pkg: '@myorg/remote-app',
  version: '^1.0.0',
  moduleName: 'Dashboard',
  scopeName: 'myorg',
  maxRetries: 3,
  retryDelay: 1000,
});

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RemoteDashboard userId={123} />
    </Suspense>
  );
}
```

### 工具函数

```typescript
import {
  // 版本缓存
  getVersionCache,
  setVersionCache,
  fetchLatestVersion,

  // URL 构建
  buildCdnUrls,
  buildFinalUrls,

  // 共享配置
  getFinalSharedConfig,

  // 卸载状态
  getLoadedRemotes,
  isRemoteLoaded,
  registerRemoteInstance,
  registerLoadedModule,

  // 预加载状态
  getPreloadStatus,
  clearPreloadCache,
  cancelPreload,

  // 格式化
  formatHealthStatus,
} from 'remote-reload-utils';
```

## 项目结构

```
react-mf-lib/
├── packages/
│   ├── remote-reload-utils/          # 核心工具库
│   │   ├── src/
│   │   │   ├── index.ts              # 主入口
│   │   │   ├── loader/
│   │   │   │   ├── index.ts          # loadRemoteMultiVersion
│   │   │   │   └── utils.ts          # 加载工具函数
│   │   │   ├── preload/              # 预加载模块
│   │   │   ├── unload/               # 卸载管理
│   │   │   ├── health/               # 健康检查
│   │   │   ├── version/              # 版本工具
│   │   │   ├── event-bus/            # 事件总线
│   │   │   ├── components/           # React 组件
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── RemoteModuleProvider.tsx
│   │   │   │   └── SuspenseLoader.tsx
│   │   │   └── plugins/              # 插件系统
│   │   ├── __tests__/                # 单元测试
│   │   │   ├── loader.test.ts
│   │   │   ├── preload.test.ts
│   │   │   ├── unload.test.ts
│   │   │   ├── health.test.ts
│   │   │   ├── eventBus.test.ts
│   │   │   ├── versionCheck.test.ts
│   │   │   ├── fallback.test.ts
│   │   │   ├── loadRemote.test.ts
│   │   │   └── types.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── test-mf-unpkg/                # 远程组件示例
└── apps/
    └── host-rsbuild-remote/          # 宿主应用示例
```

## 运行示例

### 1. 启动远程组件（remote）

```bash
cd packages/test-mf-unpkg
pnpm dev
```

### 2. 启动宿主应用（host）

```bash
cd apps/host-rsbuild-remote
pnpm dev
```

访问 http://localhost:3000 查看运行效果。

## 开发

### 安装依赖

```bash
pnpm install
```

### 构建

```bash
# 构建工具库
pnpm --filter remote-reload-utils build

# 监听模式
pnpm --filter remote-reload-utils dev
```

### 测试

```bash
# 运行所有测试
pnpm --filter remote-reload-utils test

# 监听模式
pnpm --filter remote-reload-utils test:watch

# 生成覆盖率报告
pnpm --filter remote-reload-utils test --coverage
```

### 代码检查

```bash
# 格式化代码
pnpm --filter remote-reload-utils format

# 代码检查
pnpm --filter remote-reload-utils check
```

## 技术栈

- **构建工具**: Rslib, Rsbuild, Rspack
- **运行时**: @module-federation/enhanced
- **包管理**: pnpm (workspace)
- **代码规范**: Biome
- **测试框架**: Vitest
- **类型检查**: TypeScript

## 最佳实践

### 1. 版本管理

```typescript
// ✅ 推荐：生产环境使用固定版本
await loadRemoteMultiVersion({
  name: 'my-app',
  pkg: '@myorg/remote-app',
  version: '1.2.3',
});

// ⚠️ 注意：使用 latest 时设置合理的 cacheTTL
await loadRemoteMultiVersion({
  name: 'my-app',
  pkg: '@myorg/remote-app',
  version: 'latest',
  cacheTTL: 3600000, // 1 小时
  revalidate: true,
});
```

### 2. 错误处理

```typescript
try {
  const { mf } = await loadRemoteMultiVersion(options);
  const mod = await mf.loadRemote(`${scopeName}/MyComponent`);
} catch (error) {
  console.error('Failed to load remote module:', error);
  // 显示降级 UI
}
```

### 3. 预加载优化

```typescript
// 在应用空闲时预加载
preloadRemote({
  pkg: '@myorg/remote-app',
  version: '1.0.0',
  priority: 'idle',
});

// 高优先级立即加载
preloadRemote({
  pkg: '@myorg/critical-module',
  priority: 'high',
});
```

### 4. 资源清理

```typescript
// 组件卸载时清理
useEffect(() => {
  return () => {
    unloadRemote({ name: 'my-app', pkg: '@myorg/remote-app' });
  };
}, []);
```

## 故障排查

### 加载失败

1. 检查 CDN 地址是否可访问
2. 查看浏览器控制台的错误信息
3. 验证远程组件是否正确构建
4. 检查 Module Federation 配置是否匹配

### 版本冲突

1. 确认共享模块的 `singleton` 配置
2. 检查 React 版本是否兼容
3. 使用不同的 `name` 避免命名冲突

### 类型错误

1. 确认远程组件已发布类型定义
2. 检查 TypeScript 配置
3. 使用 `import type` 导入类型

## 更新日志

### v0.0.12

- 重构：使用 remote-reload-utils 替换 RemoteModuleCard
- 新增：完整的单元测试覆盖（155+ 测试）
- 新增：健康检查模块
- 新增：事件总线模块
- 新增：版本兼容性检查

[查看详细更新日志](./packages/remote-reload-utils/CHANGELOG.md)

## 许可证

ISC

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 相关链接

- [remote-reload-utils 详细文档](./packages/remote-reload-utils/loadRemote.md)
- [Module Federation 官方文档](https://module-federation.io/)
- [Rsbuild 文档](https://rsbuild.dev/)
- [npm 包页面](https://www.npmjs.com/package/remote-reload-utils)
