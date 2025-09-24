/**
 * Cache entry with TTL support
 */
interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

/**
 * Storage interface to allow different storage backends
 */
interface CacheStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/**
 * Memory storage implementation (fallback when localStorage is not available)
 */
class MemoryStorage implements CacheStorage {
  private storage = new Map<string, string>()

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  // Additional methods for memory storage management
  size(prefix?: string): number {
    if (!prefix) return this.storage.size
    let count = 0
    for (const key of this.storage.keys()) {
      if (key.startsWith(prefix)) count++
    }
    return count
  }

  clear(prefix?: string): void {
    if (!prefix) {
      this.storage.clear()
      return
    }
    const keysToDelete: string[] = []
    for (const key of this.storage.keys()) {
      if (key.startsWith(prefix)) keysToDelete.push(key)
    }
    keysToDelete.forEach((key) => this.storage.delete(key))
  }
}

/**
 * LocalStorage wrapper that handles errors gracefully
 */
class LocalStorageWrapper implements CacheStorage {
  private fallback = new MemoryStorage()

  getItem(key: string): string | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : this.fallback.getItem(key)
    } catch {
      return this.fallback.getItem(key)
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value)
      } else {
        this.fallback.setItem(key, value)
      }
    } catch {
      this.fallback.setItem(key, value)
    }
  }

  removeItem(key: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key)
      } else {
        this.fallback.removeItem(key)
      }
    } catch {
      this.fallback.removeItem(key)
    }
  }
}

/**
 * TTL Cache with localStorage persistence
 * Automatically handles serialization/deserialization and TTL expiration
 */

const DEFAULT_KEY_PREFIX = 'ttl-cache'
const DEFAULT_TTL = 2 * 60 * 1000 // 2 minutes

export class TTLCache<T> {
  private storage: CacheStorage
  private keyPrefix: string
  private ttl: number
  private _isMemoryStorage: boolean = false
  // Track keys written by this instance (covers wrapper fallback/SSR)
  private keys = new Set<string>()

  get isMemoryStorage(): boolean {
    return this._isMemoryStorage && this.storage instanceof MemoryStorage
  }

  set isMemoryStorage(value: boolean) {
    this._isMemoryStorage = value
  }

  constructor(keyPrefix = DEFAULT_KEY_PREFIX, useLocalStorage = true, ttl = DEFAULT_TTL) {
    this.keyPrefix = keyPrefix
    this.ttl = ttl
    this.storage = useLocalStorage ? new LocalStorageWrapper() : new MemoryStorage()

    // Detect if we're using memory storage (fallback scenario)
    this.isMemoryStorage = this.storage instanceof MemoryStorage

    // Check if localStorage is actually available even when requested
    if (useLocalStorage && typeof localStorage === 'undefined') {
      this.isMemoryStorage = true
      this.storage = new MemoryStorage()
    }
  }

  /**
   * Set a value in the cache with TTL
   */
  set(key: string, value: T): void {
    // Skip storing when TTL <= 0 (disabled)
    if (this.ttl <= 0) return

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: this.ttl,
    }

    const storageKey = this.getStorageKey(key)
    try {
      this.storage.setItem(storageKey, JSON.stringify(entry))
    } catch (error) {
      console.warn('TTLCache: Failed to store cache entry', error)
    }
    this.keys.add(storageKey)
  }

  /**
   * Get a value from the cache, automatically checking TTL
   */
  get(key: string): T | undefined {
    const storageKey = this.getStorageKey(key)
    const item = this.storage.getItem(storageKey)

    if (!item) {
      return undefined
    }

    try {
      const entry: CacheEntry<T> = JSON.parse(item)
      const now = Date.now()

      if (now - entry.timestamp > entry.ttl) {
        // Entry has expired, remove it
        this.storage.removeItem(storageKey)
        this.keys.delete(storageKey)
        return undefined
      }

      return entry.value
    } catch (error) {
      console.warn('TTLCache: Failed to parse cache entry', error)
      // Remove corrupted entry
      this.storage.removeItem(storageKey)
      this.keys.delete(storageKey)
      return undefined
    }
  }

  /**
   * Remove a specific key from the cache
   */
  delete(key: string): void {
    const storageKey = this.getStorageKey(key)
    this.storage.removeItem(storageKey)
    this.keys.delete(storageKey)
  }

  /**
   * Clear all cache entries with this cache's prefix
   */
  clear(): void {
    const prefix = this.keyPrefix + ':'

    if (this.isMemoryStorage && this.storage instanceof MemoryStorage) {
      ;(this.storage as MemoryStorage).clear(prefix)
      this.keys.clear()
      return
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const keysToDelete: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(prefix)) {
            keysToDelete.push(key)
          }
        }
        keysToDelete.forEach((key) => localStorage.removeItem(key))
      } catch {
        // Fallback: If localStorage access fails, we can't clear it
        console.warn('TTLCache: Failed to clear localStorage cache')
      }
    }

    // Always clear instance-tracked keys (covers wrapper fallback/SSR)
    for (const key of Array.from(this.keys)) {
      try {
        this.storage.removeItem(key)
      } catch (error) {
        console.error('TTL Cache clear', error)
      }
      this.keys.delete(key)
    }
  }

  /**
   * Get the number of cache entries (approximate for localStorage)
   */
  size(): number {
    const prefix = this.keyPrefix + ':'
    if (this.isMemoryStorage && this.storage instanceof MemoryStorage) {
      return (this.storage as MemoryStorage).size(prefix)
    }
    // In SSR or wrapper-fallback scenarios, rely on the per-instance index
    if (typeof localStorage === 'undefined') {
      return this.keys.size
    }

    if (typeof localStorage !== 'undefined') {
      try {
        let count = 0
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(prefix)) {
            count++
          }
        }
        return count
      } catch {
        return 0
      }
    }
    return 0
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const prefix = this.keyPrefix + ':'
    if (typeof localStorage !== 'undefined') {
      try {
        const keysToDelete: string[] = []
        const now = Date.now()

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(prefix)) {
            const item = localStorage.getItem(key)
            if (item) {
              try {
                const entry: CacheEntry<T> = JSON.parse(item)
                if (now - entry.timestamp > entry.ttl) {
                  keysToDelete.push(key)
                }
              } catch {
                // Remove corrupted entries
                keysToDelete.push(key)
              }
            }
          }
        }

        keysToDelete.forEach((key) => localStorage.removeItem(key))
      } catch {
        console.warn('TTLCache: Failed to cleanup expired entries')
      }

      // Also clean instance-tracked keys (covers wrapper fallback/SSR)
      const now = Date.now()
      for (const key of Array.from(this.keys)) {
        const item = this.storage.getItem(key)
        if (!item) {
          this.keys.delete(key)
          continue
        }

        try {
          const entry: CacheEntry<T> = JSON.parse(item)
          if (now - entry.timestamp > entry.ttl) {
            this.storage.removeItem(key)
            this.keys.delete(key)
          }
        } catch {
          this.storage.removeItem(key)
          this.keys.delete(key)
        }
      }
    }
  }

  private getStorageKey(key: string): string {
    return `${this.keyPrefix}:${key}`
  }
}
