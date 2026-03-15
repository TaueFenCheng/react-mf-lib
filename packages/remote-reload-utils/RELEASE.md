# Release Guide

本指南说明如何使用 Changesets 管理 `remote-reload-utils` 的版本发布流程。

## 目录结构

```
packages/remote-reload-utils/
├── .changeset/           # Changeset 配置文件和变更记录
│   └── config.json       # Changeset 配置
├── scripts/              # 发布脚本
│   ├── initChangeset.mjs      # 初始化 Changeset
│   ├── generateReleasePr.mjs  # 生成发布 PR
│   └── finalizeRelease.mjs    # 完成发布
├── CHANGELOG.md          # 变更日志
└── package.json
```

## 快速开始

### 1. 初始化 Changeset（首次使用）

```bash
pnpm release:init
```

这会创建初始的 changeset 文件并更新 CHANGELOG.md。

### 2. 添加变更记录

每次开发新功能或修复 bug 时，运行：

```bash
pnpm changeset
```

按提示选择版本类型（major/minor/patch）并填写变更描述。

### 3. 准备发布

```bash
# 发布补丁版本 (0.0.x -> 0.0.x+1)
pnpm release:patch

# 发布小版本 (0.x.0 -> 0.x+1.0)
pnpm release:minor

# 发布主版本 (x.0.0 -> x+1.0.0)
pnpm release:major
```

这会自动：
- 创建新版本分支（如 `release/v0.0.9`）
- 生成 changeset 文件
- 更新版本号
- 更新 CHANGELOG.md
- 提交并推送分支

### 4. 创建 Pull Request

在 GitHub 上创建 PR，将发布分支合并到 `main`。

### 5. 合并 PR 并发布

PR 合并后，运行：

```bash
# 更新 CHANGELOG 格式
pnpm release:finalize

# 发布到 npm
pnpm changeset:publish
```

## 脚本说明

| 脚本 | 说明 |
|------|------|
| `pnpm changeset` | 添加新的变更记录 |
| `pnpm changeset:version` | 根据 changesets 更新版本 |
| `pnpm changeset:publish` | 发布到 npm |
| `pnpm release:init` | 初始化 Changeset |
| `pnpm release:prepare` | 准备发布（创建分支、更新版本） |
| `pnpm release:finalize` | 完成发布（更新 CHANGELOG） |
| `pnpm release:patch` | 发布补丁版本 |
| `pnpm release:minor` | 发布小版本 |
| `pnpm release:major` | 发布主版本 |

## 手动流程

如果不想使用自动化脚本，可以手动执行：

```bash
# 1. 添加变更
pnpm changeset

# 2. 更新版本
pnpm changeset version

# 3. 安装依赖（更新 lockfile）
pnpm install

# 4. 提交
git add .
git commit -m "Release vx.x.x"

# 5. 创建并发布 PR

# 6. 合并后发布
pnpm changeset publish
```

## Changeset 文件格式

`.changeset/*.md` 文件格式：

```markdown
---
"remote-reload-utils": minor
---

### 新增功能

- 添加了新功能 X
- 优化了性能

### Bug 修复

- 修复了问题 Y
```

## 版本命名规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **major**: 不兼容的 API 变更
- **minor**: 向后兼容的新功能
- **patch**: 向后兼容的 bug 修复

## 发布检查清单

- [ ] 所有 tests 通过
- [ ] CHANGELOG.md 已更新
- [ ] 版本号正确
- [ ] dist 目录已构建
- [ ] package.json 的 dependencies 正确

## 故障排查

### Changeset 未检测到变更

确保 `.changeset` 目录下有变更文件。

### 发布失败

检查 npm 登录状态：

```bash
npm whoami
```

如需重新登录：

```bash
npm login
```

## 相关资源

- [Changesets 官方文档](https://github.com/changesets/changesets)
- [@changesets/changelog-github](https://github.com/changesets/changesets/tree/main/packages/changelog-github)
- [语义化版本规范](https://semver.org/)
