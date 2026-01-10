# React Module Federation Utils

一个用于运行时动态加载远程 React 组件的工具库，支持多版本共存和 CDN 故障转移。

## 特性

- 🚀 **运行时动态加载** - 无需重新构建即可加载远程组件
- 📦 **多版本支持** - 支持同一包的多个版本同时运行
- 🔄 **CDN 故障转移** - 自动在多个 CDN 之间切换，提高可用性
- 💾 **智能缓存** - 内置版本缓存机制，减少网络请求
- 🎯 **TypeScript 支持** - 完整的类型定义
- ⚛️ **React 友好** - 专为 React 组件 Module Federation 设计
- 🔧 **可扩展** - 插件系统支持自定义扩展

## 项目结构

```
react-mf-lib/
├── packages/
│   ├── remote-reload-utils/    # 核心工具库
│   └── test-mf-unpkg/          # 远程组件示例
└── apps/
    └── host-rsbuild-remote/    # 宿主应用示例
```

## 快速开始

### 安装

```bash
# 安装依赖
pnpm install
```

### 运行示例

#### 1. 启动远程组件（remote）

```bash
cd packages/test-mf-unpkg
pnpm dev
```

#### 2. 启动宿主应用（host）

```bash
cd apps/host-rsbuild-remote
pnpm dev
```

访问 http://localhost:3000 查看运行效果。

## 核心使用

### 1. 配置远程组件

远程组件需要使用 Module Federation 进行配置：

```javascript
// packages/test-mf-unpkg/rspack.config.ts
import { rspack } from '@rspack/core';

export default {
  plugins: [
    new rspack.container.ModuleFederationPlugin({
      name: 'react_mf_lib',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button.tsx',
        './Card': './src/Card.tsx',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
};
```

### 2. 在宿主应用中加载

```typescript
import { loadRemoteMultiVersion } from 'remote-reload-utils';
import { useEffect, useState } from 'react';

const App = () => {
  const [Button, setButton] = useState(null);

  useEffect(() => {
    async function loadRemoteComponent() {
      // 加载远程组件
      const { scopeName, mf } = await loadRemoteMultiVersion({
        name: 'react_mf_lib',
        pkg: 'test-mf-unpkg',
        version: '1.0.5',
      });

      // 加载具体的暴露模块
      const mod = await mf.loadRemote(`${scopeName}/Button`);
      setButton(mod.default);
    }

    loadRemoteComponent();
  }, []);

  return (
    <div>
      <h1>Host Application</h1>
      {Button && <Button />}
    </div>
  );
};
```

## API 文档

### loadRemoteMultiVersion

动态加载远程模块，支持多版本和故障转移。

```typescript
import { loadRemoteMultiVersion } from 'remote-reload-utils';

const { scopeName, mf } = await loadRemoteMultiVersion(options, plugins);
```

#### 参数

**options**: `LoadRemoteOptions`

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | `string` | ✅ | - | Module Federation 的名称（基础名） |
| `pkg` | `string` | ✅ | - | npm 包名 |
| `version` | `string` | ❌ | `'latest'` | 指定版本号或 `'latest'` |
| `retries` | `number` | ❌ | `3` | 每个 CDN 的重试次数 |
| `delay` | `number` | ❌ | `1000` | 重试间隔（毫秒） |
| `localFallback` | `string` | ❌ | - | 本地兜底 URL |
| `cacheTTL` | `number` | ❌ | `86400000` | 缓存时间（毫秒，默认 24 小时） |
| `revalidate` | `boolean` | ❌ | `true` | 是否异步重新验证最新版本 |
| `shared` | `Record<string, ModuleFederationRuntimePlugin>` | ❌ | - | 自定义共享模块配置 |

**plugins**: `ModuleFederationRuntimePlugin[]`

Module Federation 运行时插件数组。

#### 返回值

`Promise<{ scopeName: string, mf: ReturnType<typeof createInstance> }>`

- `scopeName`: 远程模块的作用域名称
- `mf`: Module Federation 实例，可用于加载具体模块

#### CDN 源

默认使用以下 CDN（按顺序尝试）：

1. `https://cdn.jsdelivr.net/npm/${pkg}@${version}/dist/remoteEntry.js`
2. `https://unpkg.com/${pkg}@${version}/dist/remoteEntry.js`
3. `localFallback`（如果提供）

### loadReactVersion

加载特定版本的 React 和 ReactDOM。

```typescript
import { loadReactVersion } from 'remote-reload-utils';

const { React, ReactDOM } = await loadReactVersion('18');
```

#### 参数

- `version`: `'17' | '18' | '19'` - React 版本号

## 高级用法

### 多版本共存

```typescript
// 加载不同版本的远程组件
const { mf: mfV1 } = await loadRemoteMultiVersion({
  name: 'app_v1',
  pkg: 'my-component',
  version: '1.0.0',
});

const { mf: mfV2 } = await loadRemoteMultiVersion({
  name: 'app_v2',
  pkg: 'my-component',
  version: '2.0.0',
});

// 同时使用两个版本
const ComponentV1 = await mfV1.loadRemote('app_v1/Button');
const ComponentV2 = await mfV2.loadRemote('app_v2/Button');
```

### 自定义共享模块

```typescript
const { mf } = await loadRemoteMultiVersion(
  {
    name: 'my_app',
    pkg: 'my-component',
    version: '1.0.0',
    shared: {
      lodash: {
        shareConfig: {
          singleton: true,
          eager: false,
        },
      },
    },
  },
  [],
);
```

### 本地开发兜底

```typescript
const { mf } = await loadRemoteMultiVersion({
  name: 'my_app',
  pkg: 'my-component',
  version: '1.0.0',
  // 本地开发时使用本地构建
  localFallback: 'http://localhost:3001/remoteEntry.js',
});
```

### 版本缓存机制

库会自动缓存版本信息到 `localStorage`，键为 `mf-multi-version`：

```typescript
// 缓存结构
{
  "my-component": {
    "1.0.0": {
      "timestamp": 1704067200000
    },
    "1.0.1": {
      "timestamp": 1704153600000
    }
  }
}
```

## 开发

### 构建

```bash
# 构建工具库
pnpm --filter remote-reload-utils build

# 构建远程组件
pnpm --filter test-mf-unpkg build

# 构建宿主应用
pnpm --filter host-rsbuild-remote build
```

### 测试

```bash
# 运行所有测试
pnpm --filter remote-reload-utils test

# 运行单个测试文件
pnpm --filter remote-reload-utils test path/to/test-file.test.ts

# 运行匹配的测试
pnpm --filter remote-reload-utils test --run --grep "test name"
```

### 代码检查

```bash
# 格式化代码
pnpm --filter remote-reload-utils lint

# 检查并自动修复
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

1. **版本管理**
   - 生产环境建议使用固定版本号
   - 开发环境可以使用 `'latest'` 进行快速迭代
   - 合理设置 `cacheTTL` 避免版本更新延迟

2. **错误处理**
   - 始终使用 try-catch 包裹加载操作
   - 为用户提供加载失败时的降级 UI
   - 监控加载失败率并配置告警

3. **性能优化**
   - 使用 `eager: true` 预加载共享模块
   - 合理设置重试次数和延迟
   - 考虑使用 Service Worker 缓存 remoteEntry

4. **安全性**
   - 验证加载的远程组件来源
   - 在生产环境使用 HTTPS CDN
   - 实施 CSP 策略限制脚本来源

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

## 许可证

ISC

## 贡献

欢迎提交 Issue 和 Pull Request！

## 链接

- [remote-reload-utils 详细文档](./packages/remote-reload-utils/loadRemote.md)
- [Module Federation 官方文档](https://module-federation.io/)
- [Rsbuild 文档](https://rsbuild.dev/)
