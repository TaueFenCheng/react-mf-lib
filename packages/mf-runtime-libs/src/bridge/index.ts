// 插件
export { createLazyLoadComponentPlugin } from './lazy-load-component-plugin'

// 组件加载
export {
  createLazyComponent,
  useLazyComponent,
  type UseLazyComponentResult,
} from './create-lazy-component'

// 预加载
export { prefetchComponent } from './prefetch'

// 类型
export type {
  LazyComponentOptions,
  PrefetchOptions,
  BridgePluginOptions,
  ErrorInfo,
  ERROR_TYPE,
} from './types'
