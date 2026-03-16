// React 组件导出
export { ErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps } from './ErrorBoundary';

export { RemoteModuleCard } from './RemoteModuleCard';
export type { RemoteModuleCardProps } from './RemoteModuleCard';

export {
  lazyRemote,
  SuspenseRemote,
  SuspenseRemoteLoader,
  withRemote,
  useRemoteModuleHook,
} from './SuspenseLoader';
export type { LazyRemoteOptions, SuspenseRemoteProps, SuspenseRemoteWithPropsProps } from './SuspenseLoader';
