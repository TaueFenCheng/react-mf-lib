// 版本管理模块
export { loadReactVersion } from './version/react'
export {
  checkVersionCompatibility,
  satisfiesVersion,
  findCompatibleVersion,
  getCompatibleReactVersions,
  fetchAvailableVersions,
  sortVersions,
  getLatestVersion,
  getStableVersions,
  extractMajorVersion,
  isPrerelease,
  compareVersions,
  parseVersion,
} from './version'

// 核心加载模块
export {
  loadRemoteMultiVersion,
  createRemoteSourcePlugin,
  type RemoteSourcePlugin,
  type RemoteSourcePluginContext,
  type LoadRemoteExtraOptions,
} from './loader'
export {
  fetchLatestVersion,
  getVersionCache,
  setVersionCache,
  buildCdnUrls,
  tryLoadRemote,
  getFinalSharedConfig,
  resolveFinalVersion,
  buildFinalUrls,
  type LoadResult,
  type RuntimeRemote,
} from './loader/utils'

// 预加载模块
export {
  preloadRemote,
  preloadRemoteList,
  cancelPreload,
  clearPreloadCache,
  getPreloadStatus,
} from './preload'

// 卸载管理模块
export {
  unloadRemote,
  unloadAll,
  registerRemoteInstance,
  registerLoadedModule,
  getLoadedRemotes,
  isRemoteLoaded,
} from './unload'

// 健康检查模块
export {
  checkRemoteHealth,
  checkModuleLoadable,
  getRemoteHealthReport,
  formatHealthStatus,
} from './health'

// 事件总线模块
export {
  eventBus,
  createEventBus,
} from './event-bus'

// 类型导出
export type {
  LoadRemoteOptions,
  VersionCache,
  PreloadOptions,
  PreloadCacheItem,
  PreloadStatus,
} from './types'

// 插件导出
export { fallbackPlugin } from './plugins/fallback'

// Bridge 模块（懒加载组件）
export {
  createLazyLoadComponentPlugin,
  createLazyComponent,
  useLazyComponent,
  prefetchComponent,
} from './bridge'
export type {
  LazyComponentOptions,
  PrefetchOptions,
  BridgePluginOptions,
  ErrorInfo,
  UseLazyComponentResult,
} from './bridge'
export { ERROR_TYPE } from './bridge/types'
