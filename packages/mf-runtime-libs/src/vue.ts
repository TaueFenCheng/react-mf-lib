/**
 * Vue 专用入口 — 仅包含加载器和工具，不包含 React Bridge 组件
 */

export { createEventBus, eventBus } from './event-bus'
export {
  checkModuleLoadable,
  checkRemoteHealth,
  formatHealthStatus,
  getRemoteHealthReport,
} from './health'
export type {
  LoadRemoteExtraOptions,
  RemoteSourcePlugin,
  RemoteSourcePluginContext,
} from './loader'
export { createRemoteSourcePlugin, loadRemoteMultiVersion } from './loader'
export type { LoadResult, RuntimeRemote } from './loader/utils'
export {
  buildCdnUrls,
  buildFinalUrls,
  fetchLatestVersion,
  getFinalSharedConfig,
  getVersionCache,
  resolveFinalVersion,
  setVersionCache,
  tryLoadRemote,
} from './loader/utils'
export { fallbackPlugin } from './plugins/fallback'
export {
  cancelPreload,
  clearPreloadCache,
  getPreloadStatus,
  preloadRemote,
  preloadRemoteList,
} from './preload'
export type {
  LoadRemoteOptions,
  PreloadCacheItem,
  PreloadOptions,
  PreloadStatus,
  VersionCache,
} from './types'
export {
  getLoadedRemotes,
  isRemoteLoaded,
  registerLoadedModule,
  registerRemoteInstance,
  unloadAll,
  unloadRemote,
} from './unload'
export {
  checkVersionCompatibility,
  compareVersions,
  extractMajorVersion,
  fetchAvailableVersions,
  findCompatibleVersion,
  getCompatibleReactVersions,
  getLatestVersion,
  getStableVersions,
  isPrerelease,
  parseVersion,
  satisfiesVersion,
  sortVersions,
} from './version'
export { loadReactVersion } from './version/react'
