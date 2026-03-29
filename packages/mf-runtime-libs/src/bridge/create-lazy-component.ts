import { useState, useEffect, type ComponentType } from 'react'
import type { LazyComponentOptions, ErrorInfo } from './types'

export { ERROR_TYPE } from './types'
export type { ErrorInfo } from './types'

export interface UseLazyComponentResult<T> {
  loading: boolean
  error: ErrorInfo | null
  Component: ComponentType<T> | null
}

/**
 * React Hook 用于懒加载远程组件
 *
 * @param options - 加载选项
 * @returns 包含 loading 状态、错误信息和组件的返回值
 *
 * @example
 * ```ts
 * const { loading, error, Component } = useLazyComponent({
 *   loader: () => loadRemoteMultiVersion({ name: 'remote', pkg: '@org/remote', version: '1.0.0' }),
 *   loading: <div>Loading...</div>,
 *   fallback: ({ error }) => <div>Error: {error.message}</div>,
 * })
 * ```
 */
export function useLazyComponent<T = unknown>(
  options: LazyComponentOptions<T>
): UseLazyComponentResult<T> {
  const {
    loader,
    loading,
    fallback,
    delayLoading,
    export: exportName = 'default',
    dataFetchParams,
    noSSR,
  } = options

  const [loadingState, setLoadingState] = useState(true)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [Component, setComponent] = useState<ComponentType<T> | null>(null)
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    // 处理延迟显示 loading
    let delayTimer: NodeJS.Timeout | undefined
    if (delayLoading) {
      delayTimer = setTimeout(() => {
        if (mounted && loadingState) {
          setShowLoading(true)
        }
      }, delayLoading)
    } else {
      setShowLoading(true)
    }

    const loadComponent = async () => {
      try {
        const module = await loader()

        if (!mounted) return

        // 处理默认导出和具名导出
        const exportedComponent =
          exportName === 'default'
            ? (module as { default?: ComponentType<T> }).default
            : (module as Record<string, ComponentType<T>>)[exportName]

        if (!exportedComponent) {
          throw new Error(`Export "${exportName}" not found in module`)
        }

        setComponent(() => exportedComponent)
        setLoadingState(false)
      } catch (err) {
        if (!mounted) return

        setError({
          error: err instanceof Error ? err : new Error(String(err)),
          errorType: 'LOAD_REMOTE' as ErrorInfo['errorType'],
        })
        setLoadingState(false)
      } finally {
        if (delayTimer) {
          clearTimeout(delayTimer)
        }
      }
    }

    loadComponent()

    return () => {
      mounted = false
      if (delayTimer) {
        clearTimeout(delayTimer)
      }
    }
  }, [
    loader,
    exportName,
    delayLoading,
    dataFetchParams,
    noSSR,
  ])

  return {
    loading: loadingState && showLoading,
    error,
    Component,
  }
}

/**
 * 创建懒加载 React 组件
 *
 * @param options - 加载选项
 * @returns React 组件
 *
 * @example
 * ```ts
 * const LazyButton = createLazyComponent({
 *   loader: () => loadRemoteMultiVersion({ name: 'remote', pkg: '@org/remote', version: '1.0.0' }),
 *   loading: <div>Loading...</div>,
 *   fallback: ({ error }) => <div>Error: {error.message}</div>,
 * })
 *
 * // 使用
 * <LazyButton prop1="value" prop2={123} />
 * ```
 */
export function createLazyComponent<T extends Record<string, unknown>>(
  options: LazyComponentOptions<T>
): ComponentType<T> {
  const LazyComponent: ComponentType<T> = (props: T) => {
    const { loading, error, Component } = useLazyComponent(options)

    // 渲染错误状态
    if (error) {
      return options.fallback(error) as JSX.Element
    }

    // 渲染加载状态
    if (loading) {
      return options.loading as JSX.Element
    }

    // 渲染组件
    if (Component) {
      return <Component {...props} />
    }

    return null
  }

  // 设置组件显示名称
  LazyComponent.displayName = 'LazyComponent'

  return LazyComponent
}
