// 样式导入
import './styles/index.css'

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

// React 组件导出
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
} from './components'
export type {
  ErrorBoundaryProps,
  RemoteModuleCardProps,
  UseRemoteModuleOptions,
  LazyRemoteOptions,
  SuspenseRemoteProps,
  SuspenseRemoteWithPropsProps,
} from './components'

// Vue 适配器导出 (用于 Vue 项目加载 React 远程组件)
export {
  VueRemoteModuleProvider,
  mountReactToGlobal,
  hasGlobalReact,
  getGlobalReactVersion,
  getGlobalReact,
  getGlobalReactDOM,
  unmountReactFromGlobal,
  useVueRemoteModule,
} from './vue-adapter'
export type {
  VueRemoteModuleCardProps,
  UseVueRemoteModuleOptions,
  UseVueRemoteModuleResult,
} from './vue-adapter'
