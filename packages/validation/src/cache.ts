// Simple content-addressable validation cache

import type { ValidationResult } from './types.js';

/**
 * Cache key combining pointer and content hash
 * Format: "/path@contentHash"
 */
type CacheKey = string;

/**
 * Simple size-limited validation cache
 * Content-addressable: keys include content hash for automatic invalidation
 *
 * When a node changes, its hash changes, making old cache entries unreachable.
 * This provides automatic cache invalidation without explicit tracking.
 */
export class ValidationCache {
  private readonly cache = new Map<CacheKey, ValidationResult>();
  private readonly maxSize: number;

  /**
   * Create a new validation cache
   *
   * @param maxSize - Maximum number of entries (default: 1000)
   */
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Get cached validation result
   *
   * @param pointer - JSON Pointer path
   * @param contentHash - Content hash of the node
   * @returns Cached result, or undefined if not found
   */
  get(pointer: string, contentHash: string): ValidationResult | undefined {
    const key = this.makeKey(pointer, contentHash);
    return this.cache.get(key);
  }

  /**
   * Store validation result in cache
   * Evicts oldest entry if cache is full
   *
   * @param pointer - JSON Pointer path
   * @param contentHash - Content hash of the node
   * @param result - Validation result to cache
   */
  set(pointer: string, contentHash: string, result: ValidationResult): void {
    const key = this.makeKey(pointer, contentHash);

    // Simple size limit: delete first entry if full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, result);
  }

  /**
   * Clear all cached results
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Create cache key from pointer and content hash
   */
  private makeKey(pointer: string, contentHash: string): CacheKey {
    return `${pointer}@${contentHash}`;
  }
}
