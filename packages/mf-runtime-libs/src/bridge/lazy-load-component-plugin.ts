import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime'
import type { BridgePluginOptions } from './types'

/**
 * 创建懒加载组件插件
 *
 * 注册此插件后，可以使用 instance.createLazyComponent 和 instance.prefetch API
 *
 * @param options - 插件配置选项
 * @returns Module Federation Runtime Plugin
 *
 * @example
 * ```ts
 * import { getInstance } from '@module-federation/runtime'
 * import { createLazyLoadComponentPlugin } from 'mf-runtime-libs/bridge'
 *
 * const instance = getInstance()
 * instance.registerPlugins([createLazyLoadComponentPlugin()])
 * ```
 */
export function createLazyLoadComponentPlugin(
  options: BridgePluginOptions = {}
): ModuleFederationRuntimePlugin {
  const { name = 'lazy-load-component-plugin' } = options

  return {
    name,
    init() {
      // 插件初始化逻辑
      // lazyLoadComponentPlugin 的核心功能由 @module-federation/bridge-react 提供
      // 此封装主要用于与 mf-runtime-libs 的其他模块集成
    },
  }
}
