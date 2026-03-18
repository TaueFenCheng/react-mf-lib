import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime'

/**
 * 初始化全局 React/ReactDOM 到 Module Federation 共享作用域
 * 这是一个一次性操作，会在第一次调用时注册
 */
let hasInitialized = false

function initSharedScope() {
  if (hasInitialized) return

  const globalReact = (window as any).React
  const globalReactDOM = (window as any).ReactDOM

  if (!globalReact || !globalReactDOM) {
    console.warn('[register-shared-react] Global React or ReactDOM not found')
    return
  }

  // @ts-ignore - webpack 共享作用域
  if (!window.__webpack_share_scopes__) {
    // @ts-ignore
    window.__webpack_share_scopes__ = {}
  }

  // @ts-ignore
  if (!window.__webpack_share_scopes__.default) {
    // @ts-ignore
    window.__webpack_share_scopes__.default = {}
  }

  // 注册 react 到共享作用域
  // @ts-ignore
  window.__webpack_share_scopes__.default.react = {
    get: () => () => globalReact,
    config: {
      singleton: true,
      eager: true,
    },
    scope: 'default',
    version: globalReact.version || '18.0.0',
  }

  // 注册 react-dom 到共享作用域
  // @ts-ignore
  window.__webpack_share_scopes__.default['react-dom'] = {
    get: () => () => globalReactDOM,
    config: {
      singleton: true,
      eager: true,
    },
    scope: 'default',
    version: globalReactDOM.version || '18.0.0',
  }

  hasInitialized = true
  console.log('[register-shared-react] Registered global React and ReactDOM to share scope')
}

/**
 * 注册全局 React/ReactDOM 到 Module Federation 共享作用域
 */
export const registerSharedReact: () => ModuleFederationRuntimePlugin = () => ({
  name: 'register-shared-react',

  init(args: any) {
    initSharedScope()
    return args
  },
})

/**
 * 手动初始化共享作用域（在创建 MF 实例之前调用）
 */
export { initSharedScope }
