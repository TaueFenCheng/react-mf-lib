import {
  createInstance,
  ModuleFederationRuntimePlugin,
} from '@module-federation/enhanced/runtime';
// 假设这些来自本地文件
import { fallbackPlugin } from './plugins';
import type { LoadRemoteOptions, VersionCache } from './types';

// --- 核心配置抽象 ---

/** 默认的 CDN 地址模板 */
const DEFAULT_CDN_TEMPLATES = [
  'https://cdn.jsdelivr.net/npm/{pkg}@{version}/dist/remoteEntry.js',
  'https://unpkg.com/{pkg}@{version}/dist/remoteEntry.js',
];

/** 默认的共享模块配置 (React/ReactDOM) */
const DEFAULT_SHARED_CONFIG = {
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
};

// --- 工具函数 ---

interface NpmRegistryResponse {
  'dist-tags'?: {
    latest: string;
    [tag: string]: string | undefined;
  };
}

/**
 * 从 npm registry 获取最新版本，并增加类型安全性
 */
async function fetchLatestVersion(pkg: string): Promise<string> {
  const res = await fetch(`https://registry.npmjs.org/${pkg}`);
  if (!res.ok)
    throw new Error(`[MF] 无法获取 ${pkg} 的版本信息，状态码: ${res.status}`);
  const data = (await res.json()) as NpmRegistryResponse;
  const latest = data['dist-tags']?.latest;

  if (!latest) throw new Error(`[MF] 无法从 NPM 获取 ${pkg} 的 latest tag`);
  return latest;
}

/**
 * 读取多版本缓存，增强健壮性
 */
function getVersionCache(): VersionCache {
  try {
    const cacheStr = localStorage.getItem('mf-multi-version');
    return cacheStr ? JSON.parse(cacheStr) : {};
  } catch (e) {
    console.error('[MF Cache] 读取缓存失败:', e);
    return {};
  }
}

/**
 * 写入多版本缓存，增强健壮性
 */
function setVersionCache(pkg: string, version: string) {
  try {
    const cache = getVersionCache();
    cache[pkg] = cache[pkg] || {};
    cache[pkg][version] = { timestamp: Date.now() };
    localStorage.setItem('mf-multi-version', JSON.stringify(cache));
  } catch (e) {
    console.error('[MF Cache] 写入缓存失败:', e);
  }
}

/**
 * 拼接 CDN 地址 (统一使用抽象的模板)
 */
function buildCdnUrls(pkg: string, version: string): string[] {
  return DEFAULT_CDN_TEMPLATES.map((template) =>
    template.replace('{pkg}', pkg).replace('{version}', version),
  );
}

// --- 核心加载逻辑 ---

interface LoadResult {
  scopeName: string;
  mf: ReturnType<typeof createInstance>;
}

/**
 * 尝试加载单个远程模块 URL，包含重试逻辑
 */
async function tryLoadRemote(
  scopeName: string,
  url: string,
  retries: number,
  delay: number,
  sharedConfig: Record<string, any>,
  plugins: ModuleFederationRuntimePlugin[],
): Promise<LoadResult> {
  let lastError: Error | unknown;

  for (let i = 0; i < retries; i++) {
    try {
      const mf = createInstance({
        name: 'host',
        remotes: [
          {
            name: scopeName,
            entry: url,
          },
        ],
        shared: sharedConfig,
        plugins: [...plugins, fallbackPlugin()],
      });

      return { scopeName, mf };
    } catch (e) {
      lastError = e;
      console.warn(`[MF] URL ${url} 加载失败，第 ${i + 1} 次重试...`);
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  // 抛出最后一次具体的错误信息
  throw new Error(`[MF] URL ${url} 经过 ${retries} 次重试仍加载失败。`, {
    cause: lastError,
  });
}

/**
 * 多版本共存的 loadRemote (优化版本)
 */
export async function loadRemoteMultiVersion(
  options: LoadRemoteOptions,
  plugins: ModuleFederationRuntimePlugin[],
): Promise<LoadResult> {
  const {
    name,
    pkg,
    version = 'latest',
    retries = 3,
    delay = 1000,
    localFallback,
    cacheTTL = 24 * 60 * 60 * 1000,
    revalidate = true,
    shared: customShared = {}, // 接受自定义共享配置
  } = options;

  let finalVersion = version;

  // 1. 处理 'latest' 版本
  if (version === 'latest') {
    const cache = getVersionCache();
    const versions = cache[pkg] || {};
    // 找到最新的缓存版本
    const latestCached = Object.keys(versions).sort(
      (a, b) => versions[b].timestamp - versions[a].timestamp,
    )[0];

    // 如果有未过期缓存
    if (
      latestCached &&
      Date.now() - versions[latestCached].timestamp < cacheTTL
    ) {
      finalVersion = latestCached;

      // 如果开启了重新验证，异步检查是否有新版本，不阻塞主流程
      if (revalidate) {
        fetchLatestVersion(pkg)
          .then((latest) => {
            if (latest !== latestCached) {
              console.log(`[MF] 发现 ${pkg} 新版本 ${latest}，已更新缓存。`);
              setVersionCache(pkg, latest);
            }
          })
          .catch((e) => console.error(`[MF] 异步检查最新版本失败:`, e));
      }
    } else {
      // 缓存过期或首次加载，同步获取最新版本（阻塞）
      finalVersion = await fetchLatestVersion(pkg);
      setVersionCache(pkg, finalVersion);
    }
  }

  // 2. 构造最终的 URL 列表
  const scopeName = `${name}`;
  const urls = buildCdnUrls(pkg, finalVersion);
  if (localFallback) urls.push(localFallback);

  // 合并共享配置
  const finalSharedConfig = { ...DEFAULT_SHARED_CONFIG, ...customShared };

  // 3. 遍历 URL 并尝试加载 (故障转移/Fallback)
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
      // tryLoadRemote 内部已经处理了重试，这里只需打印警告并尝试下一个 URL
      console.warn(`[MF] 切换 CDN 路径: ${url} 失败，尝试下一个...`, e);
    }
  }

  // 4. 全部失败，抛出错误
  throw new Error(`[MF] 所有加载源 (${urls.length} 个) 均加载失败。`);
}
