import { loadRemote } from '@module-federation/runtime';

export interface LoadRemoteOptions {
  name: string; // 模块联邦 name（基础名）
  pkg: string; // npm 包名
  version?: string; // 指定版本 or "latest"
  retries?: number; // 重试次数
  delay?: number; // 重试间隔
  localFallback?: string; // 本地兜底
  cacheTTL?: number; // 缓存时间
  revalidate?: boolean; // 灰度更新
}

interface VersionCache {
  [pkg: string]: {
    [version: string]: {
      timestamp: number;
    };
  };
}

/**
 * 从 npm registry 获取最新版本
 */
async function fetchLatestVersion(pkg: string): Promise<string> {
  const res = await fetch(`https://registry.npmjs.org/${pkg}`);
  if (!res.ok) throw new Error(`无法获取 ${pkg} 的版本信息`);
  const data = await res.json();
  return data['dist-tags']?.latest;
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
      console.log(`[MF] 使用缓存版本: ${pkg}@${latestCached}`);
      finalVersion = latestCached;

      // 后台 revalidate
      if (revalidate) {
        fetchLatestVersion(pkg)
          .then((latest) => {
            if (latest !== latestCached) {
              console.log(`[MF] 检测到新版本: ${pkg}@${latest} (下次可用)`);
              setVersionCache(pkg, latest);
            }
          })
          .catch((err) => console.warn(`[MF] 检查更新失败: ${pkg}`, err));
      }
    } else {
      finalVersion = await fetchLatestVersion(pkg);
      console.log(`[MF] 获取最新版本: ${pkg}@${finalVersion}`);
      setVersionCache(pkg, finalVersion);
    }
  }

  // 生成唯一 scope，避免冲突
  const scopeName = `${name}@${finalVersion}`;
  const urls = buildCdnUrls(pkg, finalVersion);
  if (localFallback) urls.push(localFallback);

  for (let url of urls) {
    let success = false;
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[MF] 尝试加载: ${url} (第 ${i + 1} 次)`);
        await loadRemote({ url, name: scopeName });
        console.log(`[MF] 成功加载: ${scopeName}`);
        success = true;
        break;
      } catch (err) {
        console.warn(`[MF] 加载失败: ${url}, 重试中...`, err);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    if (success) return scopeName;
  }

  throw new Error(`[MF] 所有 CDN 加载失败: ${urls.join(', ')}`);
}
