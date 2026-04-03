import { resolveRegisteredRemotes } from '../loader/remote-source'
import {
  buildFinalUrls,
  getFinalSharedConfig,
  resolveFinalVersion,
  tryLoadRemote,
} from '../loader/utils'
import type { BridgeAppLoaderOptions } from './types'

function normalizeRemoteModule(mod: unknown): Record<string, unknown> {
  if (!mod) {
    throw new Error('[Bridge] Remote module is empty')
  }

  if (typeof mod === 'function') {
    return { default: mod }
  }

  if (typeof mod === 'object') {
    return mod as Record<string, unknown>
  }

  throw new Error(
    `[Bridge] Invalid remote module type: ${typeof mod}. Check remote entry/moduleName and fallback behavior.`,
  )
}

export function createBridgeRemoteLoader(options: BridgeAppLoaderOptions) {
  return async (): Promise<Record<string, unknown>> => {
    const { moduleName, extraOptions, ...loadOptions } = options
    const {
      name,
      pkg,
      version = 'latest',
      retries = 3,
      delay = 1000,
      localFallback,
      cacheTTL = 24 * 60 * 60 * 1000,
      revalidate = true,
      shared: customShared,
    } = loadOptions
    const {
      remoteSourcePlugins = [],
      baseRemotes = [],
      registerOptions = {},
    } = extraOptions || {}

    const finalVersion = await resolveFinalVersion(
      pkg,
      version,
      cacheTTL,
      revalidate,
    )
    const urls = buildFinalUrls(pkg, finalVersion, localFallback)
    const finalSharedConfig = getFinalSharedConfig(customShared)

    let lastError: unknown

    for (const url of urls) {
      try {
        const registeredRemotes = await resolveRegisteredRemotes(
          {
            options: loadOptions,
            scopeName: name,
            pkg,
            finalVersion,
            currentEntry: url,
            allEntries: urls,
          },
          baseRemotes,
          remoteSourcePlugins,
        )

        const { mf } = await tryLoadRemote(
          name,
          url,
          retries,
          delay,
          finalSharedConfig,
          [],
          registeredRemotes,
          registerOptions,
        )

        const mod = await mf.loadRemote(`${name}/${moduleName}`)
        return normalizeRemoteModule(mod)
      } catch (error) {
        lastError = error
        console.warn(`[Bridge] 加载源 ${url} 失败，尝试下一个...`, error)
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`[Bridge] 所有加载源 (${urls.length} 个) 均加载失败。`)
  }
}
