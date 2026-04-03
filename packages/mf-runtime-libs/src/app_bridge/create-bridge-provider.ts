import { createBridgeComponent } from '@module-federation/bridge-react/v18'
import type {
  BridgeAppProviderFactory,
  BridgeAppProviderOptions,
} from './types'

export function createBridgeAppProvider<
  TProps extends Record<string, unknown> = Record<string, unknown>,
>(options: BridgeAppProviderOptions<TProps>): BridgeAppProviderFactory {
  return createBridgeComponent<TProps>(options)
}
