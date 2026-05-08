import type { PrefetchOptions } from './types'

/**
 * 获取 Module Federation 实例的函数
 * 允许测试时注入 mock
 */
async function getDefaultInstance() {
  const { getInstance } = await import('@module-federation/enhanced/runtime')
  return getInstance()
}

/**
 * 预加载远程组件资源和数据
 *
 * 需要在调用前注册 lazyLoadComponentPlugin 插件
 *
 * @param options - 预加载选项
 * @param getInstanceFn - 可选的获取实例函数，用于测试注入
 *
 * @example
 * ```ts
 * // 注册插件
 * const instance = getInstance()
 * instance.registerPlugins([createLazyLoadComponentPlugin()])
 *
 * // 预加载组件
 * prefetchComponent({
 *   id: 'remote/Component',
 *   preloadComponentResource: true,
 * })
 */
export function prefetchComponent(
  options: PrefetchOptions,
  getInstanceFn?: () => unknown,
): void {
  const resolveInstance = async (): Promise<unknown> => {
    if (getInstanceFn) return getInstanceFn()
    return getDefaultInstance()
  }

  resolveInstance()
    .then((instance) => {
      const inst = instance as {
        prefetch?: (opts: PrefetchOptions) => void
      }

      if (!inst || typeof inst.prefetch !== 'function') {
        console.warn(
          '[mf-runtime-libs/bridge] instance.prefetch 不可用，请确保已注册 lazyLoadComponentPlugin 插件',
        )
        return
      }

      inst.prefetch({
        id: options.id,
        preloadComponentResource: options.preloadComponentResource,
        dataFetchParams: options.dataFetchParams,
      })
    })
    .catch((error) => {
      console.warn(
        '[mf-runtime-libs/bridge] 预加载失败:',
        error instanceof Error ? error.message : error,
      )
    })
}
