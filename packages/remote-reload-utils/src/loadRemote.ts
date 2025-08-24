import { createInstance } from '@module-federation/enhanced/runtime';
import { LoadRemoteOptions, VersionCache } from './types';

/**
 * 从 npm registry 获取最新版本
 */
async function fetchLatestVersion(pkg: string): Promise<string> {
  const res = await fetch(`https://registry.npmjs.org/${pkg}`);
  if (!res.ok) throw new Error(`无法获取 ${pkg} 的版本信息`);
  const data = await res.json();
  return (data as any)['dist-tags']?.latest;
}

/**
 * 读取多版本缓存
 */
function getVersionCache(): VersionCache {
  try {
    return JSON.parse(localStorage.getItem('mf-multi-version') || '{}');
  } catch {
    return {};
  }
}

/**
 * 写入多版本缓存
 */
function setVersionCache(pkg: string, version: string) {
  const cache = getVersionCache();
  cache[pkg] = cache[pkg] || {};
  cache[pkg][version] = { timestamp: Date.now() };
  localStorage.setItem('mf-multi-version', JSON.stringify(cache));
}

/**
 * 拼接 CDN 地址
 */
function buildCdnUrls(pkg: string, version: string): string[] {
  return [
    `https://cdn.jsdelivr.net/npm/${pkg}@${version}/dist/remoteEntry.js`,
    `https://unpkg.com/${pkg}@${version}/dist/remoteEntry.js`,
  ];
}

/**
 * 多版本共存的 loadRemote
 */
export async function loadRemoteMultiVersion(options: LoadRemoteOptions) {
  let {
    name,
    pkg,
    version = 'latest',
    retries = 3,
    delay = 1000,
    localFallback,
    cacheTTL = 24 * 60 * 60 * 1000,
    revalidate = true,
  } = options;

  let finalVersion = version;

  // 处理 latest 的情况，优先用缓存
  if (version === 'latest') {
    const cache = getVersionCache();
    const versions = cache[pkg] || {};
    const latestCached = Object.keys(versions).sort(
      (a, b) => versions[b].timestamp - versions[a].timestamp,
    )[0];

    if (
      latestCached &&
      Date.now() - versions[latestCached].timestamp < cacheTTL
    ) {
      finalVersion = latestCached;

      if (revalidate) {
        fetchLatestVersion(pkg)
          .then((latest) => {
            if (latest !== latestCached) {
              setVersionCache(pkg, latest);
            }
          })
          .catch(() => {});
      }
    } else {
      finalVersion = await fetchLatestVersion(pkg);
      setVersionCache(pkg, finalVersion);
    }
  }

  const scopeName = `${name}`;

  const urls = [
    `https://cdn.jsdelivr.net/npm/${pkg}@${finalVersion}/dist/remoteEntry.js`,
    `https://unpkg.com/${pkg}@${finalVersion}/dist/remoteEntry.js`,
  ];
  if (localFallback) urls.push(localFallback);

  for (let url of urls) {
    for (let i = 0; i < retries; i++) {
      try {
        // 创建一个 runtime 实例
        const mf = createInstance({
          name: 'host',
          remotes: [
            {
              name: scopeName, // 唯一 scope
              entry: url, // remoteEntry.js 的 url
            },
          ],
          // 共享react react-dom 版本
          shared: {
            react: {
              shareConfig: {
                singleton: true,
                eager: true, // 是否提前加载
                requiredVersion: false,
              },
            },
            'react-dom': {
              shareConfig: {
                singleton: true,
                eager: true, // 是否提前加载
                requiredVersion: false,
              },
            },
          },
        });

        // ⚠️ 不要 loadRemote remoteEntry
        // 这里直接返回实例，后续加载组件用 mf.loadRemote
        return { scopeName, mf };
      } catch {
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  throw new Error(`[MF] 所有 CDN 加载失败: ${urls.join(', ')}`);
}
