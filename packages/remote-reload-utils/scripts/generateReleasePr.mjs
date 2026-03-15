#!/usr/bin/env zx

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { $, chalk } from 'zx';

$.verbose = false;

/**
 * 获取当前版本号
 */
async function getCurrentVersion() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  return packageJson.version;
}

/**
 * 计算下一个版本号
 */
async function getNextVersion(currentVersion, type) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  switch (type) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default:
      throw new Error('Invalid version type');
  }
}

/**
 * 生成 changeset 文件
 */
async function generateChangesetFile(bumpType, nextVersion) {
  const changesetDir = path.join(process.cwd(), '.changeset');
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const filename = `${randomId}-${bumpType}-release-${nextVersion}.md`;
  const content = `---
"remote-reload-utils": ${bumpType}
---

Release version ${nextVersion}

### What's Changed

- Release version ${nextVersion} with updated CHANGELOG
`;

  await fs.mkdir(changesetDir, { recursive: true });
  await fs.writeFile(path.join(changesetDir, filename), content);

  console.log(chalk.blue(`Generated changeset file: ${filename}`));
}

/**
 * 更新 CHANGELOG.md，添加新版本条目
 */
async function updateChangelog(nextVersion) {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const today = new Date().toISOString().split('T')[0];

  let changelogContent = await fs.readFile(changelogPath, 'utf-8');

  // 检查是否已存在该版本的标题
  const versionRegex = new RegExp(`## \\[未发布\\]`);
  if (!versionRegex.test(changelogContent)) {
    // 在文件开头添加新版本部分
    const newSection = `# Changelog

所有重要的项目变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

## [${nextVersion}] - ${today}

### Release

- Published version ${nextVersion}

`;
    changelogContent = newSection + changangelogContent.split('\n').slice(5).join('\n');
  }

  await fs.writeFile(changelogPath, changelogContent);
  console.log(chalk.blue('Updated CHANGELOG.md'));
}

/**
 * 主函数
 */
async function main() {
  try {
    // 1. 读取当前版本
    const currentVersion = await getCurrentVersion();
    console.log(chalk.blue(`Current version: ${currentVersion}`));

    // 2. 确定版本类型和下一个版本号
    const options = {
      type: {
        type: 'string',
        short: 't',
        default: 'patch',
      },
      message: {
        type: 'string',
        short: 'm',
        default: '',
      },
    };
    const args = process.argv.slice(3);
    const { values } = parseArgs({ args, options });

    const bumpType = values.type;
    const message = values.message;

    if (!['major', 'minor', 'patch'].includes(bumpType)) {
      console.error(chalk.red('Invalid bump type. Please select major, minor, or patch.'));
      process.exit(1);
    }

    console.log(chalk.blue(`Bump type: ${bumpType}`));

    const nextVersion = await getNextVersion(currentVersion, bumpType);
    console.log(chalk.blue(`Next version: ${nextVersion}`));

    // 3. 创建并切换到新分支
    const branchName = `release/v${nextVersion}`;
    console.log(chalk.blue(`Creating branch: ${branchName}`));

    await $`git checkout -b ${branchName}`;

    // 4. 生成 changeset 文件
    await generateChangesetFile(bumpType, nextVersion);

    // 5. 运行 changeset version 命令
    console.log(chalk.blue('Running changeset version...'));
    await $`pnpm changeset version`;

    // 6. 更新 CHANGELOG
    if (message) {
      await updateChangelogWithMessage(message, nextVersion);
    }

    // 7. 安装依赖
    console.log(chalk.blue('Running pnpm install...'));
    await $`pnpm install --ignore-scripts`;

    // 8. 提交更改
    console.log(chalk.blue('Committing changes...'));
    await $`git add .`;
    await $`git commit -m "Release v${nextVersion}"`;

    // 9. 推送到远程仓库
    console.log(chalk.blue(`Pushing branch: ${branchName}`));
    await $`git push -u origin ${branchName}`;

    console.log(chalk.green(`\n✅ Successfully created and pushed ${branchName}`));
    console.log(chalk.green(`   Next step: Create a PR to merge into main\n`));

  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * 使用自定义消息更新 CHANGELOG
 */
async function updateChangelogWithMessage(message, version) {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const today = new Date().toISOString().split('T')[0];

  let changelogContent = await fs.readFile(changelogPath, 'utf-8');

  // 在 [未发布] 部分后添加新版本条目
  const unreleasedIndex = changelogContent.indexOf('## [未发布]');
  if (unreleasedIndex !== -1) {
    const insertPos = changelogContent.indexOf('\n', unreleasedIndex) + 1;
    const newSection = `
## [${version}] - ${today}

### Release

${message}

`;
    changelogContent = changelogContent.slice(0, insertPos) + newSection + changelogContent.slice(insertPos);
    await fs.writeFile(changelogPath, changelogContent);
    console.log(chalk.blue('Updated CHANGELOG.md with release message'));
  }
}

main();
