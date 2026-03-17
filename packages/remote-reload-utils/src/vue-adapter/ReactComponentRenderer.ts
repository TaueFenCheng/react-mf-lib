import {
  defineComponent,
  h,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  type PropType,
} from 'vue'

/**
 * React 组件渲染器 Props
 */
export interface ReactComponentRendererProps {
  /** React 组件 */
  component: any
  /** 传递给 React 组件的 props */
  componentProps?: Record<string, any>
  /** 容器类名 */
  className?: string
  /** 容器样式 */
  style?: Record<string, any>
}

/**
 * React 组件渲染器
 * 用于在 Vue 中渲染 React 组件
 */
export const ReactComponentRenderer = defineComponent<ReactComponentRendererProps>({
  name: 'ReactComponentRenderer',

  props: {
    component: { type: [Object, Function] as PropType<any>, required: true },
    componentProps: { type: Object, default: () => ({}) },
    className: { type: String, default: '' },
    style: { type: Object, default: () => ({}) },
  },

  setup(props) {
    console.log(props,'3280923809482034')
    const containerRef = ref<HTMLElement | null>(null)
    const reactRootRef = ref<any>(null)

    /**
     * 渲染 React 组件到容器
     */
    function renderReactComponent() {
      if (!containerRef.value || !props.component) return

      const React = (window as any).React
      const ReactDOM = (window as any).ReactDOM
      console.log(React,'React')
      console.log(ReactDOM,'ReactDOMReactDOMReactDOM')

      if (!React || !ReactDOM) {
        console.error('[ReactComponentRenderer] React or ReactDOM not found on window')
        return
      }

      // 清理之前的 React 实例
      if (reactRootRef.value) {
        reactRootRef.value.unmount()
      }

      // 创建 React 元素
      const element = React.createElement(props.component, props.componentProps || {})

      // 使用 ReactDOM 18 的 createRoot API
      if (ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(containerRef.value)
        root.render(element)
        reactRootRef.value = root
      } else {
        // 使用旧的 ReactDOM.render API
        ReactDOM.render(element, containerRef.value)
        reactRootRef.value = {
          unmount: () => ReactDOM.unmountComponentAtNode(containerRef.value!),
        }
      }
    }

    // 监听 component 和 componentProps 变化
    watch(
      () => [props.component, props.componentProps],
      () => {
        // 等待下一个 tick 确保 DOM 已更新
        setTimeout(() => {
          renderReactComponent()
        }, 0)
      },
      { deep: true, immediate: true },
    )

    // 组件卸载时清理 React 实例
    onBeforeUnmount(() => {
      if (reactRootRef.value) {
        reactRootRef.value.unmount()
      }
    })

    // 主渲染函数 - 只返回容器
    return () =>
      h('div', {
        ref: containerRef,
        class: props.className,
        style: props.style,
      })
  },
})
