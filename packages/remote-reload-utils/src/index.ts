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
export { loadRemoteMultiVersion } from './loader'
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

// React 组件导出（已迁移到 @react-mf-lib/react-adapter）
// 请改用 import { ... } from '@react-mf-lib/react-adapter';
// 为了向后兼容，这里重新导出
export {
  ErrorBoundary,
  RemoteModuleProvider,
  RemoteModuleRenderer,
  useRemoteModule,
  lazyRemote,
  SuspenseRemote,
  SuspenseRemoteLoader,
  withRemote,
  useRemoteModuleHook,
} from '@react-mf-lib/react-adapter'
export type {
  ErrorBoundaryProps,
  RemoteModuleCardProps,
  UseRemoteModuleOptions,
  LazyRemoteOptions,
  SuspenseRemoteProps,
  SuspenseRemoteWithPropsProps,
} from '@react-mf-lib/react-adapter'

// Vue 适配器导出 (用于 Vue 项目加载 React 远程组件)
// 注意：Vue 适配器已独立为单独的包，请使用 @react-mf-lib/vue-adapter
// 为了向后兼容，这里重新导出
export {
  VueRemoteModuleProvider,
  mountReactToGlobal,
  hasGlobalReact,
  getGlobalReactVersion,
  getGlobalReact,
  getGlobalReactDOM,
  unmountReactFromGlobal,
  useVueRemoteModule,
  ReactComponentRenderer,
} from '@react-mf-lib/vue-adapter'
export type {
  VueRemoteModuleCardProps,
  UseVueRemoteModuleOptions,
  UseVueRemoteModuleResult,
  ReactComponentRendererProps,
} from '@react-mf-lib/vue-adapter'
