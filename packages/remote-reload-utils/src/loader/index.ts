import { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import type { LoadRemoteOptions } from '../types';
import {
  resolveFinalVersion,
  buildFinalUrls,
  getFinalSharedConfig,
  tryLoadRemote,
} from './utils';

/**
 * 多版本共存的 loadRemote
 */
export async function loadRemoteMultiVersion(
  options: LoadRemoteOptions,
  plugins: ModuleFederationRuntimePlugin[],
) {
  const {
    name,
    pkg,
    version = 'latest',
    retries = 3,
    delay = 1000,
    localFallback,
    cacheTTL = 24 * 60 * 60 * 1000,
    revalidate = true,
    shared: customShared,
  } = options;

  // 1. 解析最终版本号
  const finalVersion = await resolveFinalVersion(
    pkg,
    version,
    cacheTTL,
    revalidate,
  );

  // 2. 构建最终 URL 列表
  const scopeName = `${name}`;
  const urls = buildFinalUrls(pkg, finalVersion, localFallback);

  // 3. 合并共享配置
  const finalSharedConfig = getFinalSharedConfig(customShared);

  // 4. 遍历 URL 并尝试加载（故障转移/Fallback）
  for (const url of urls) {
    try {
      return await tryLoadRemote(
        scopeName,
        url,
        retries,
        delay,
        finalSharedConfig,
        plugins,
      );
    } catch (e) {
      console.warn(`[MF] 切换 CDN 路径：${url} 失败，尝试下一个...`, e);
    }
  }

  // 5. 全部失败，抛出错误
  throw new Error(`[MF] 所有加载源 (${urls.length} 个) 均加载失败。`);
}
