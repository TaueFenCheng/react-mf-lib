/**
 * Vue Adapter for remote-reload-utils
 *
 * 使 Vue 3 项目能够加载和使用 React 远程组件
 * 自动将 React/ReactDOM 挂载到全局 window 对象
 *
 * @example
 * ```ts
 * // 在 Vue 项目的入口文件 (main.ts) 中
 * import { mountReactToGlobal } from '@react-mf-lib/vue-adapter'
 *
 * // 加载 React 到全局 (React 远程组件需要这些全局变量)
 * await mountReactToGlobal('18')
 *
 * // 然后创建 Vue 应用
 * createApp(App).mount('#app')
 * ```
 *
 * @example
 * ```vue
 * <!-- 在 Vue 组件中使用远程 React 组件 -->
 * <script setup lang="ts">
 * import { VueRemoteModuleProvider } from '@react-mf-lib/vue-adapter'
 * </script>
 *
 * <template>
 *   <VueRemoteModuleProvider
 *     pkg="my-react-components"
 *     version="1.0.0"
 *     moduleName="Button"
 *     scopeName="my_react_app"
 *   />
 * </template>
 * ```
 *
 * @example
 * ```vue
 * <!-- 使用 Hook 方式 -->
 * <script setup lang="ts">
 * import { useVueRemoteModule } from '@react-mf-lib/vue-adapter'
 *
 * const { component, loading, error, retry } = useVueRemoteModule({
 *   pkg: 'my-react-components',
 *   version: '1.0.0',
 *   moduleName: 'Button',
 *   scopeName: 'my_react_app'
 * })
 * </script>
 *
 * <template>
 *   <div>
 *     <div v-if="loading">Loading...</div>
 *     <div v-else-if="error">Error: {{ error.message }}</div>
 *     <component :is="component" v-else />
 *   </div>
 * </template>
 * ```
 */

// Vue 组件导出
export {
  createVueRemoteModuleProvider,
  VueRemoteModuleProvider,
} from './VueRemoteModuleProvider'
export type { VueRemoteModuleCardProps } from './VueRemoteModuleProvider'

// React 全局挂载工具
export {
  mountReactToGlobal,
  hasGlobalReact,
  getGlobalReactVersion,
  getGlobalReact,
  getGlobalReactDOM,
  unmountReactFromGlobal,
  createReactComponentRenderer,
} from './mountReactToGlobal'

// Vue Hook 导出
export { useVueRemoteModule } from './useVueRemoteModule'
export { useReactResolver } from './composables/useReactResolver'
export type {
  UseVueRemoteModuleOptions,
  UseVueRemoteModuleResult,
} from './useVueRemoteModule'
export type { ReactResolverResult } from './composables/useReactResolver'

// React 组件渲染器 (用于在 Vue 中渲染 React 组件)
export { ReactComponentRenderer } from './ReactComponentRenderer'
export type { ReactComponentRendererProps } from './ReactComponentRenderer'

// 类型导出
export type {
  MFInstance,
  ReactInstance,
  ReactDOMInstance,
  ReactDOMRoot,
  ReactComponentType,
  RemoteModuleResult,
} from './types'
