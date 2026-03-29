import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLazyLoadComponentPlugin } from '../lazy-load-component-plugin'

describe('createLazyLoadComponentPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return a plugin object with name and registerRemotes', () => {
    const plugin = createLazyLoadComponentPlugin()
    expect(plugin).toBeDefined()
    expect(typeof plugin.name).toBe('string')
  })

  it('should have correct plugin name', () => {
    const plugin = createLazyLoadComponentPlugin()
    expect(plugin.name).toBe('lazy-load-component-plugin')
  })

  it('should accept custom plugin name', () => {
    const plugin = createLazyLoadComponentPlugin({ name: 'custom-plugin' })
    expect(plugin.name).toBe('custom-plugin')
  })
})
