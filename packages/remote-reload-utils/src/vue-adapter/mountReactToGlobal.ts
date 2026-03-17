/**
 * 全局 React 版本缓存
 */
interface GlobalReactCache {
  React?: any
  ReactDOM?: any
  version?: string
  loaded?: boolean
  loading?: Promise<{ React: any; ReactDOM: any }>
}

const globalReactCache: GlobalReactCache = {
  React: undefined,
  ReactDOM: undefined,
  version: undefined,
  loaded: false,
  loading: undefined,
}

/**
 * 动态加载 script 标签
 */
function loadScript(src: string, globalName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 如果已经存在，直接返回
    if ((window as any)[globalName]) {
      resolve()
      return
    }

    // 检查是否已经有相同的 script 标签在加载中
    const existingScript = document.querySelector(`script[src="${src}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)))
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.defer = true

    script.onload = () => {
      if ((window as any)[globalName]) {
        resolve()
      } else {
        reject(new Error(`Script loaded but ${globalName} not found on window`))
      }
    }

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`))
    }

    document.head.appendChild(script)
  })
}

/**
 * 创建一个 React 组件容器，用于在 Vue 中渲染 React 组件
 */
export function createReactComponentRenderer(
  ReactComponent: any,
  props: Record<string, any> = {},
  container: HTMLElement,
) {
  const React = (window as any).React
  const ReactDOM = (window as any).ReactDOM

  if (!React || !ReactDOM) {
    throw new Error('React or ReactDOM not found on window. Call mountReactToGlobal first.')
  }

  // 创建 React 元素
  const element = React.createElement(ReactComponent, props)

  // 优先使用 ReactDOM 18+ 的 createRoot API（如果可用）
  if (ReactDOM.createRoot) {
    const root = ReactDOM.createRoot(container)
    root.render(element)
    return () => root.unmount()
  } else if (ReactDOM.render) {
    // 使用旧的 ReactDOM.render API (React 17 及更早版本)
    ReactDOM.render(element, container)
    return () => ReactDOM.unmountComponentAtNode(container)
  } else {
    throw new Error('No suitable React rendering API found')
  }
}

/**
 * 将 React 和 ReactDOM 挂载到全局 window 对象
 * 通过动态加载 UMD 文件的方式
 *
 * @param version - React 版本号 ('17' | '18' | '19')
 * @returns Promise<{ React: any, ReactDOM: any }>
 */
export async function mountReactToGlobal(
  version: '17' | '18' | '19' = '18',
): Promise<{ React: any; ReactDOM: any }> {
  // 如果已经加载过相同版本，直接返回
  if (globalReactCache.loaded && globalReactCache.version === version) {
    return { React: globalReactCache.React!, ReactDOM: globalReactCache.ReactDOM! }
  }

  // 如果正在加载中，等待完成
  if (globalReactCache.loading) {
    return globalReactCache.loading
  }

  // 开始加载
  globalReactCache.loading = (async () => {
    try {
      // 加载 React
      const reactUrl = `https://cdn.jsdelivr.net/npm/react@${version}/umd/react.production.min.js`
      const reactDomUrl = `https://cdn.jsdelivr.net/npm/react-dom@${version}/umd/react-dom.production.min.js`

      await Promise.all([
        loadScript(reactUrl, 'React'),
        loadScript(reactDomUrl, 'ReactDOM'),
      ])

      const React = (window as any).React
      const ReactDOM = (window as any).ReactDOM

      if (!React || !ReactDOM) {
        throw new Error('React or ReactDOM not found on window after loading')
      }

      // 挂载到全局 window 对象
      ;(window as any).__REACT_VERSION__ = version

      // 更新缓存
      globalReactCache.React = React
      globalReactCache.ReactDOM = ReactDOM
      globalReactCache.version = version
      globalReactCache.loaded = true
      globalReactCache.loading = undefined

      console.log(`[Vue Adapter] React ${version} mounted to global window object`)

      return { React, ReactDOM }
    } catch (error) {
      globalReactCache.loading = undefined
      console.error('[Vue Adapter] Failed to mount React to global:', error)
      throw error
    }
  })()

  return globalReactCache.loading
}

/**
 * 检查全局是否已有 React
 */
export function hasGlobalReact(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).React && !!(window as any).ReactDOM
}

/**
 * 获取全局 React 版本
 */
export function getGlobalReactVersion(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as any).__REACT_VERSION__
}

/**
 * 获取全局 React 实例
 */
export function getGlobalReact(): any {
  if (typeof window === 'undefined') return null
  return (window as any).React || null
}

/**
 * 获取全局 ReactDOM 实例
 */
export function getGlobalReactDOM(): any {
  if (typeof window === 'undefined') return null
  return (window as any).ReactDOM || null
}

/**
 * 清除全局 React (用于测试或卸载)
 */
export function unmountReactFromGlobal(): void {
  if (typeof window !== 'undefined') {
    delete (window as any).React
    delete (window as any).ReactDOM
    delete (window as any).__REACT_VERSION__
  }
  globalReactCache.React = undefined
  globalReactCache.ReactDOM = undefined
  globalReactCache.version = undefined
  globalReactCache.loaded = false
}
