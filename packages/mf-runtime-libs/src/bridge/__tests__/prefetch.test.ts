import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prefetchComponent } from '../prefetch'

describe('prefetchComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call instance.prefetch with correct options', async () => {
    const mockPrefetch = vi.fn()
    const mockInstance = {
      prefetch: mockPrefetch,
    }

    const mockGetInstance = vi.fn().mockReturnValue(mockInstance)

    prefetchComponent({ id: 'remote/Component' }, mockGetInstance)

    await vi.waitFor(() => {
      expect(mockPrefetch).toHaveBeenCalledWith({
        id: 'remote/Component',
      })
    })
  })

  it('should pass preloadComponentResource option', async () => {
    const mockPrefetch = vi.fn()
    const mockInstance = {
      prefetch: mockPrefetch,
    }

    const mockGetInstance = vi.fn().mockReturnValue(mockInstance)

    prefetchComponent(
      {
        id: 'remote/Component',
        preloadComponentResource: true,
      },
      mockGetInstance,
    )

    await vi.waitFor(() => {
      expect(mockPrefetch).toHaveBeenCalledWith({
        id: 'remote/Component',
        preloadComponentResource: true,
      })
    })
  })
})
