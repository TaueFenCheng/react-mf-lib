/**
 * Loader 和 Health 模块共享的常量和工具函数
 */

/** CDN 地址模板 */
export const CDN_TEMPLATES = [
  'https://cdn.jsdelivr.net/npm/{pkg}@{version}/dist/remoteEntry.js',
  'https://unpkg.com/{pkg}@{version}/dist/remoteEntry.js',
]

interface NpmRegistryResponse {
  'dist-tags'?: {
    latest: string
    [tag: string]: string | undefined
  }
}

/**
 * 从 npm registry 获取最新版本
 * @param pkg - 包名
 * @param silent - 为 true 时失败返回 null（供 health 模块使用），否则抛异常
 */
export async function fetchLatestVersion(
  pkg: string,
  silent?: false,
): Promise<string>
export async function fetchLatestVersion(
  pkg: string,
  silent: true,
): Promise<string | null>
export async function fetchLatestVersion(
  pkg: string,
  silent = false,
): Promise<string | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${pkg}`)
    if (!res.ok) {
      if (silent) return null
      throw new Error(
        `[MF] 无法获取 ${pkg} 的版本信息，状态码：${res.status}`,
      )
    }
    const data = (await res.json()) as NpmRegistryResponse
    const latest = data['dist-tags']?.latest
    if (!latest) {
      if (silent) return null
      throw new Error(`[MF] 无法从 NPM 获取 ${pkg} 的 latest tag`)
    }
    return latest
  } catch (e) {
    if (silent) return null
    throw e
  }
}

/** React 单例共享模块的 shareConfig */
export const SINGLETON_SHARE_CONFIG = {
  singleton: true,
  eager: true,
  requiredVersion: false,
  strictVersion: false,
} as const

/** 需要保持单例的 React 相关包名 */
export const REACT_SINGLETON_PACKAGES = [
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
] as const
