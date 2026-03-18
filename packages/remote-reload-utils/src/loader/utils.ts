import {
  createInstance,
  ModuleFederationRuntimePlugin,
} from '@module-federation/enhanced/runtime'
import { fallbackPlugin } from '../plugins/fallback'
import { initSharedScope, registerSharedReact } from '../plugins/register-shared-react'
import type { VersionCache } from '../types'

// --- 核心配置抽象 ---

/** 默认的 CDN 地址模板 */
const DEFAULT_CDN_TEMPLATES = [
  'https://cdn.jsdelivr.net/npm/{pkg}@{version}/dist/remoteEntry.js',
  'https://unpkg.com/{pkg}@{version}/dist/remoteEntry.js',
]

/** 默认的共享模块配置 (React/ReactDOM) */
const DEFAULT_SHARED_CONFIG = {
  react: {
    singleton: true,
    eager: true, // 是否提前加载
    requiredVersion: false,
  },
  'react-dom': {
    singleton: true,
    eager: true, // 是否提前加载
    requiredVersion: false,
  },
}

// --- 工具函数 ---

interface NpmRegistryResponse {
  'dist-tags'?: {
    latest: string
    [tag: string]: string | undefined
  }
}

/**
 * 从 npm registry 获取最新版本，并增加类型安全性
 */
export async function fetchLatestVersion(pkg: string): Promise<string> {
  const res = await fetch(`https://registry.npmjs.org/${pkg}`)
  if (!res.ok)
    throw new Error(`[MF] 无法获取 ${pkg} 的版本信息，状态码：${res.status}`)
  const data = (await res.json()) as NpmRegistryResponse
  const latest = data['dist-tags']?.latest

  if (!latest) throw new Error(`[MF] 无法从 NPM 获取 ${pkg} 的 latest tag`)
  return latest
}

/**
 * 读取多版本缓存，增强健壮性
 */
export function getVersionCache(): VersionCache {
  try {
    const cacheStr = localStorage.getItem('mf-multi-version')
    return cacheStr ? JSON.parse(cacheStr) : {}
  } catch (e) {
    console.error('[MF Cache] 读取缓存失败:', e)
    return {}
  }
}

/**
 * 写入多版本缓存，增强健壮性
 */
export function setVersionCache(pkg: string, version: string) {
  try {
    const cache = getVersionCache()
    cache[pkg] = cache[pkg] || {}
    cache[pkg][version] = { timestamp: Date.now() }
    localStorage.setItem('mf-multi-version', JSON.stringify(cache))
  } catch (e) {
    console.error('[MF Cache] 写入缓存失败:', e)
  }
}

/**
 * 拼接 CDN 地址 (统一使用抽象的模板)
 */
export function buildCdnUrls(pkg: string, version: string): string[] {
  return DEFAULT_CDN_TEMPLATES.map((template) =>
    template.replace('{pkg}', pkg).replace('{version}', version),
  )
}

// --- 核心加载逻辑 ---

export interface LoadResult {
  scopeName: string
  mf: ReturnType<typeof createInstance>
}

/**
 * 尝试加载单个远程模块 URL，包含重试逻辑
 */
export async function tryLoadRemote(
  scopeName: string,
  url: string,
  retries: number,
  delay: number,
  sharedConfig: Record<string, any>,
  plugins: ModuleFederationRuntimePlugin[],
): Promise<LoadResult> {
  let lastError: Error | unknown

  for (let i = 0; i < retries; i++) {
    try {
      // 在创建 MF 实例之前先初始化共享作用域
      initSharedScope()

      const mf = createInstance({
        name: 'host',
        remotes: [
          {
            name: scopeName,
            entry: url,
          },
        ],
        shared: sharedConfig,
        plugins: [...plugins, fallbackPlugin(), registerSharedReact()],
      })

      return { scopeName, mf }
    } catch (e) {
      lastError = e
      console.warn(`[MF] URL ${url} 加载失败，第 ${i + 1} 次重试...`)
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay))
      }
    }
  }

  // 抛出最后一次具体的错误信息
  throw new Error(`[MF] URL ${url} 经过 ${retries} 次重试仍加载失败。`, {
    cause: lastError,
  })
}

/**
 * 获取最终的共享配置
 */
export function getFinalSharedConfig(
  customShared?: Record<string, any>,
): Record<string, any> {
  // 检查全局是否有 React/ReactDOM（用于 Vue 项目加载 React 远程组件）
  const globalReact = (window as any).React
  const globalReactDOM = (window as any).ReactDOM

  const globalShared: Record<string, any> = {}

  if (globalReact && globalReactDOM) {
    // 验证 React 实例是否有效
    const isValidReact = typeof globalReact === 'object' && typeof globalReact.useCallback === 'function'

    if (isValidReact) {
      // 如果全局有有效的 React，使用全局实例作为共享模块
      // 使用 get 函数返回全局 React 实例
      globalShared.react = {
        singleton: true,
        eager: true,
        requiredVersion: false,
        get: () => () => globalReact,
        version: globalReact.version || '18.0.0',
      }
      globalShared['react-dom'] = {
        singleton: true,
        eager: true,
        requiredVersion: false,
        get: () => () => globalReactDOM,
        version: globalReactDOM.version || '18.0.0',
      }
      console.log('[getFinalSharedConfig] Using global React instance', {
        version: globalReact.version,
      })
    } else {
      console.warn('[getFinalSharedConfig] Global React found but is invalid', {
        type: typeof globalReact,
        useCallback: typeof globalReact?.useCallback,
      })
    }
  } else {
    console.log('[getFinalSharedConfig] No global React found, using default shared config')
  }

  return { ...DEFAULT_SHARED_CONFIG, ...globalShared, ...(customShared || {}) }
}

/**
 * 解析最终版本号（处理 latest 情况）
 */
export async function resolveFinalVersion(
  pkg: string,
  version: string,
  cacheTTL: number,
  revalidate: boolean,
): Promise<string> {
  let finalVersion = version

  if (version === 'latest') {
    const cache = getVersionCache()
    const versions = cache[pkg] || {}
    // 找到最新的缓存版本
    const latestCached = Object.keys(versions).sort(
      (a, b) => versions[b].timestamp - versions[a].timestamp,
    )[0]

    // 如果有未过期缓存
    if (
      latestCached &&
      Date.now() - versions[latestCached].timestamp < cacheTTL
    ) {
      finalVersion = latestCached

      // 如果开启了重新验证，异步检查是否有新版本，不阻塞主流程
      if (revalidate) {
        fetchLatestVersion(pkg)
          .then((latest) => {
            if (latest !== latestCached) {
              console.log(`[MF] 发现 ${pkg} 新版本 ${latest}，已更新缓存。`)
              setVersionCache(pkg, latest)
            }
          })
          .catch((e) => console.error(`[MF] 异步检查最新版本失败:`, e))
      }
    } else {
      // 缓存过期或首次加载，同步获取最新版本（阻塞）
      finalVersion = await fetchLatestVersion(pkg)
      setVersionCache(pkg, finalVersion)
    }
  }

  return finalVersion
}

/**
 * 构建最终的 URL 列表（包含本地 fallback）
 */
export function buildFinalUrls(
  pkg: string,
  version: string,
  localFallback?: string,
): string[] {
  const urls = buildCdnUrls(pkg, version)
  if (localFallback) urls.push(localFallback)
  return urls
}
