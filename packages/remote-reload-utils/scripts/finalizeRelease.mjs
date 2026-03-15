#!/usr/bin/env zx

import fs from 'node:fs/promises';
import path from 'node:path';
import { $, chalk } from 'zx';

$.verbose = false;

/**
 * 发布后更新 CHANGELOG，将 [未发布] 改为具体版本号
 */
async function finalizeChangelog(version) {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const today = new Date().toISOString().split('T')[0];

  let changelogContent = await fs.readFile(changelogPath, 'utf-8');

  // 将 [未发布] 替换为 [version] - date
  const unreleasedRegex = /## \[未发布\]/;
  if (unreleasedRegex.test(changelogContent)) {
    changelogContent = changelogContent.replace(
      unreleasedRegex,
      `## [未发布]\n\n## [${version}] - ${today}`
    );
    await fs.writeFile(changelogPath, changelogContent);
    console.log(chalk.blue(`Updated CHANGELOG.md for version ${version}`));
  } else {
    console.log(chalk.yellow('No [未发布] section found in CHANGELOG.md'));
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    const version = packageJson.version;

    console.log(chalk.blue(`Finalizing release for version ${version}`));

    await finalizeChangelog(version);

    // 提交 CHANGELOG 更新
    await $`git add CHANGELOG.md`;
    await $`git commit -m "docs: update CHANGELOG for v${version}"`;
    await $`git push`;

    console.log(chalk.green(`\n✅ Release v${version} finalized!\n`));

  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

main();
