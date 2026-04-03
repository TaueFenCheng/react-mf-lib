import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBridgeRemoteLoader } from '../src/app_bridge/create-bridge-loader'

vi.mock('../src/loader/utils', async () => {
  const actual = await vi.importActual('../src/loader/utils')
  return {
    ...(actual as object),
    buildFinalUrls: vi.fn(),
    getFinalSharedConfig: vi.fn(),
    resolveFinalVersion: vi.fn(),
    tryLoadRemote: vi.fn(),
  }
})

vi.mock('../src/loader/remote-source', async () => {
  const actual = await vi.importActual('../src/loader/remote-source')
  return {
    ...(actual as object),
    resolveRegisteredRemotes: vi.fn(),
  }
})

const {
  buildFinalUrls,
  getFinalSharedConfig,
  resolveFinalVersion,
  tryLoadRemote,
} = await import('../src/loader/utils')
const { resolveRegisteredRemotes } = await import('../src/loader/remote-source')

describe('app_bridge/create-bridge-loader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fallback to next url when module load fails on current remote entry', async () => {
    const providerFactory = vi.fn()
    const badMf = {
      loadRemote: vi
        .fn()
        .mockRejectedValue(new Error('remoteEntryExports is undefined')),
    }
    const goodMf = {
      loadRemote: vi.fn().mockResolvedValue(providerFactory),
    }

    vi.mocked(resolveFinalVersion).mockResolvedValue('1.0.0')
    vi.mocked(buildFinalUrls).mockReturnValue([
      'https://cdn.jsdelivr.net/npm/demo-app-bridge-provider@1.0.0/dist/remoteEntry.js',
      'http://localhost:3101/remoteEntry.js',
    ])
    vi.mocked(getFinalSharedConfig).mockReturnValue({})
    vi.mocked(resolveRegisteredRemotes).mockResolvedValue([])
    vi.mocked(tryLoadRemote)
      .mockResolvedValueOnce({
        scopeName: 'demo_app_provider',
        mf: badMf as never,
      })
      .mockResolvedValueOnce({
        scopeName: 'demo_app_provider',
        mf: goodMf as never,
      })

    const loader = createBridgeRemoteLoader({
      name: 'demo_app_provider',
      pkg: 'demo-app-bridge-provider',
      version: '1.0.0',
      moduleName: 'export-app',
      localFallback: 'http://localhost:3101/remoteEntry.js',
    })

    const result = await loader()

    expect(result).toEqual({ default: providerFactory })
    expect(tryLoadRemote).toHaveBeenCalledTimes(2)
    expect(badMf.loadRemote).toHaveBeenCalledWith('demo_app_provider/export-app')
    expect(goodMf.loadRemote).toHaveBeenCalledWith('demo_app_provider/export-app')
  })

  it('should throw last error when all urls fail', async () => {
    vi.mocked(resolveFinalVersion).mockResolvedValue('1.0.0')
    vi.mocked(buildFinalUrls).mockReturnValue([
      'https://cdn.jsdelivr.net/npm/demo-app-bridge-provider@1.0.0/dist/remoteEntry.js',
      'http://localhost:3101/remoteEntry.js',
    ])
    vi.mocked(getFinalSharedConfig).mockReturnValue({})
    vi.mocked(resolveRegisteredRemotes).mockResolvedValue([])
    vi.mocked(tryLoadRemote).mockResolvedValue({
      scopeName: 'demo_app_provider',
      mf: {
        loadRemote: vi
          .fn()
          .mockRejectedValue(new Error('remoteEntryExports is undefined')),
      } as never,
    })

    const loader = createBridgeRemoteLoader({
      name: 'demo_app_provider',
      pkg: 'demo-app-bridge-provider',
      version: '1.0.0',
      moduleName: 'export-app',
      localFallback: 'http://localhost:3101/remoteEntry.js',
    })

    await expect(loader()).rejects.toThrow('remoteEntryExports is undefined')
    expect(tryLoadRemote).toHaveBeenCalledTimes(2)
  })
})
