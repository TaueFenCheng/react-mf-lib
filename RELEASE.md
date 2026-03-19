# Release Scripts

统一的内容发布管理脚本，基于 Changesets 实现多包版本管理和发布。

## 快速开始

### 使用 npm/pnpm 脚本

```bash
# 查看所有 changeset 状态
pnpm status

# 添加新的 changeset
pnpm add

# 应用版本变更（更新版本号、生成 CHANGELOG）
pnpm version

# 发布所有包到 npm
pnpm publish

# 进入预发布模式
pnpm pre enter beta    # 进入 beta 预发布
pnpm pre exit          # 退出预发布模式
```

### 使用 shell 脚本

```bash
# 查看所有 changeset 状态
./release.sh status

# 添加新的 changeset
./release.sh add

# 应用版本变更
./release.sh version

# 发布所有包
./release.sh publish

# 进入预发布模式
./release.sh pre enter beta
./release.sh pre exit
```

## 完整工作流

### 1. 开发阶段

创建新的 changeset 来记录你的更改：

```bash
pnpm add
```

这会引导你选择受影响的包并填写变更说明。

### 2. 发布前准备

应用所有 changesets 来更新版本号并生成 CHANGELOG：

```bash
pnpm version
```

这个命令会：
- 根据 changesets 更新所有包的版本号
- 生成/更新 CHANGELOG.md
- 自动运行 `pnpm install` 更新依赖

### 3. 发布到 npm

```bash
pnpm publish
```

这个命令会：
- 构建所有包（如果有 build 脚本）
- 发布所有包到 npm
- 创建 git tag

### 4. 预发布流程

对于 beta、rc 等预发布版本：

```bash
# 进入预发布模式
pnpm pre enter beta

# 正常的 add -> version -> publish 流程
pnpm add
pnpm version
pnpm publish --tag beta

# 完成后退出预发布模式
pnpm pre exit
```

## Changeset 格式

每个 changeset 文件使用 Markdown 格式：

```markdown
---
'remote-reload-utils': minor
'@react-mf-lib/react-adapter': patch
---

这里描述变更内容

- 新增功能
- 修复的问题
```

## 注意事项

1. **发布顺序**: 总是先 `version` 再 `publish`
2. **Git 提交**: version 命令后会产生 git 变更，记得提交
3. **版本号**: 遵循语义化版本规范 (major.minor.patch)
4. **Workspace 依赖**: 内部依赖会自动更新

## 故障排查

### 发布失败

检查 npm token 是否有效：

```bash
npm whoami
```

### 版本冲突

如果有冲突的 changeset，运行：

```bash
pnpm status --verbose
```

### 手动发布

如需手动控制发布过程：

```bash
cd packages/remote-reload-utils
npm publish --access public
```
