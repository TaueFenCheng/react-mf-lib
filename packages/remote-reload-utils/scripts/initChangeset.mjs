#!/usr/bin/env zx

import fs from 'node:fs/promises';
import path from 'node:path';
import { $, chalk } from 'zx';

$.verbose = false;

/**
 * 初始化 Changeset 并创建第一个 changeset 文件
 */
async function main() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    const version = packageJson.version;

    console.log(chalk.blue(`Initializing Changeset for ${packageJson.name}@${version}`));

    // 创建 .changeset 目录
    const changesetDir = path.join(process.cwd(), '.changeset');
    await fs.mkdir(changesetDir, { recursive: true });

    // 创建初始 changeset 文件
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `${randomId}-initial-release.md`;
    const content = `---
"remote-reload-utils": minor
---

Initial release of remote-reload-utils

### Features

- Remote module loading with multi-version support
- React version management (v17/v18/v19)
- Preload and unload utilities
- Health check and event bus
- CDN failover and retry mechanism
`;

    await fs.writeFile(path.join(changesetDir, filename), content);
    console.log(chalk.blue(`Generated initial changeset: ${filename}`));

    // 更新 CHANGELOG.md
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const today = new Date().toISOString().split('T')[0];

    let changelogContent = await fs.readFile(changelogPath, 'utf-8');

    // 检查是否已存在 [未发布] 部分
    if (!changelogContent.includes('## [未发布]')) {
      const header = `# Changelog

所有重要的项目变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### Features

- Initial release of remote-reload-utils

`;
      changelogContent = header + changangelogContent;
      await fs.writeFile(changelogPath, changelogContent);
      console.log(chalk.blue('Updated CHANGELOG.md'));
    }

    console.log(chalk.green(`\n✅ Changeset initialized!\n`));
    console.log(chalk.yellow('Next steps:'));
    console.log(chalk.white('  1. Run `pnpm changeset version` to bump version'));
    console.log(chalk.white('  2. Run `pnpm install` to update lockfile'));
    console.log(chalk.white('  3. Commit and push changes\n'));

  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

main();
