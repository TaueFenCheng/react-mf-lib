import type { RemoteComponentParams } from '@module-federation/bridge-react'
import type {
  ComponentType,
  CSSProperties,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  ReactNode,
  RefAttributes,
} from 'react'

// --- Bridge App 组件相关类型 (Host 端组件) ---
export type CreateBridgeAppOptions<
  TModule extends Record<string, unknown>,
  TExport extends keyof TModule = keyof TModule,
> = RemoteComponentParams<TModule, TExport>

export type BridgeAppProps<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = TProps & {
  fallback?: ComponentType<{ error: Error }>
  loading?: ReactNode
  basename?: string
  memoryRoute?: {
    entryPath: string
    initialState?: Record<string, unknown>
  }
  className?: string
  style?: CSSProperties
  [key: string]: unknown
}

export type BridgeAppComponent<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = ForwardRefExoticComponent<
  PropsWithoutRef<BridgeAppProps<TProps>> & RefAttributes<HTMLDivElement>
>
