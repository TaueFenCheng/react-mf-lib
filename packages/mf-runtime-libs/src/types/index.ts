import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime'

export type { ModuleFederationRuntimePlugin }

export interface LocalDebugOptions {
  /**
   * 是否开启本地 localhost 调试入口
   * - 仅在 localDebug 对象存在时生效
   * - 默认 true
   */
  enabled?: boolean
  /**
   * 本地调试入口地址，例如 http://localhost:3000/remoteEntry.js
   */
  entry: string
}

export interface LoadRemoteOptions {
  name: string // 模块联邦 name（基础名）
  pkg: string // npm 包名
  version?: string // 指定版本 or "latest"
  retries?: number // 重试次数
  delay?: number // 重试间隔
  cdnFallbackEntry?: string // CDN 多环境兜底地址（单个）
  localDebug?: LocalDebugOptions // localhost 本地调试配置
  cacheTTL?: number // 缓存时间
  revalidate?: boolean // 灰度更新
  shared?: Record<string, any> // 自定义 shared 配置
}

export interface VersionCache {
  [pkg: string]: {
    [version: string]: {
      timestamp: number
    }
  }
}

export interface PreloadOptions extends LoadRemoteOptions {
  priority?: 'idle' | 'high'
  force?: boolean
}

export interface PreloadCacheItem {
  version: string
  scopeName: string
  mf: any
  timestamp: number
}

export interface PreloadStatus {
  loaded: boolean
  timestamp: number
}
