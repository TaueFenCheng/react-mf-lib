export interface BoundedCacheOptions {
  /** 最大条目数，超出时淘汰最久未访问的条目 */
  maxSize?: number
  /** 条目 TTL（毫秒），过期条目在读取时惰性清除 */
  ttl?: number
}

/**
 * 带 TTL 和 LRU 淘汰的有界缓存。
 * API 兼容 Map 的常用子集。
 */
export class BoundedCache<K, V> {
  private map = new Map<K, { value: V; lastAccess: number }>()
  private maxSize: number
  private ttl: number

  constructor(options: BoundedCacheOptions = {}) {
    this.maxSize = options.maxSize ?? 200
    this.ttl = options.ttl ?? 10 * 60 * 1000 // 默认 10 分钟
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined

    if (Date.now() - entry.lastAccess > this.ttl) {
      this.map.delete(key)
      return undefined
    }

    // 更新访问时间（LRU）
    entry.lastAccess = Date.now()
    return entry.value
  }

  set(key: K, value: V): void {
    // 如果已存在则删除再插入，保证顺序（LRU）
    if (this.map.has(key)) {
      this.map.delete(key)
    }

    this.map.set(key, { value, lastAccess: Date.now() })
    this.evict()
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): void {
    this.map.delete(key)
  }

  clear(): void {
    this.map.clear()
  }

  get size(): number {
    return this.map.size
  }

  /** 获取所有未过期的 key */
  keys(): K[] {
    const now = Date.now()
    const result: K[] = []
    this.map.forEach((entry, key) => {
      if (now - entry.lastAccess <= this.ttl) {
        result.push(key)
      }
    })
    return result
  }

  /** 淘汰超出 maxSize 的最旧条目 */
  private evict(): void {
    while (this.map.size > this.maxSize) {
      const oldest = this.map.keys().next().value
      if (oldest !== undefined) {
        this.map.delete(oldest)
      } else {
        break
      }
    }
  }
}
