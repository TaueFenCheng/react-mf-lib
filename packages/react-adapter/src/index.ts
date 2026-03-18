// React 组件导出
export { ErrorBoundary } from './ErrorBoundary'
export type { ErrorBoundaryProps } from './ErrorBoundary'

export {
  RemoteModuleProvider,
  RemoteModuleRenderer,
  useRemoteModule,
} from './RemoteModuleProvider'
export type {
  RemoteModuleCardProps,
  UseRemoteModuleOptions,
} from './RemoteModuleProvider'

export {
  lazyRemote,
  SuspenseRemote,
  SuspenseRemoteLoader,
  withRemote,
  useRemoteModuleHook,
} from './SuspenseLoader'
export type {
  LazyRemoteOptions,
  SuspenseRemoteProps,
  SuspenseRemoteWithPropsProps,
} from './SuspenseLoader'
