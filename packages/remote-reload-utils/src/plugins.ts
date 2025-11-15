import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime'

export const fallbackPlugin: () => ModuleFederationRuntimePlugin = () => ({
  name: 'fallback-plugin',
  errorLoadRemote(args:any) {
    const fallback = 'fallback'
    console.log(args,'args')
    return fallback
  },
})
