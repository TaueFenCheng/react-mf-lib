import { describe, it, expect, vi } from 'vitest'
import { fallbackPlugin } from '../src/plugins/fallback'

describe('fallbackPlugin', () => {
  it('should return a plugin object with correct name', () => {
    const plugin = fallbackPlugin()
    expect(plugin.name).toBe('fallback-plugin')
  })

  it('should have errorLoadRemote hook', () => {
    const plugin = fallbackPlugin()
    expect(plugin.errorLoadRemote).toBeDefined()
    expect(typeof plugin.errorLoadRemote).toBe('function')
  })

  describe('errorLoadRemote', () => {
    it('should return "fallback" string when called', () => {
      const plugin = fallbackPlugin()
      const result = plugin.errorLoadRemote({ error: new Error('test') })
      expect(result).toBe('fallback')
    })

    it('should log the args to console', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const plugin = fallbackPlugin()
      const testArgs = { error: new Error('test'), extra: 'data' }

      plugin.errorLoadRemote(testArgs)

      expect(consoleSpy).toHaveBeenCalledWith(testArgs, 'args')
      consoleSpy.mockRestore()
    })
  })
})
