import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationCache } from '../src/cache.js';
import type { ValidationResult } from '../src/types.js';

describe('ValidationCache', () => {
  let cache: ValidationCache;

  const validResult: ValidationResult = {
    valid: true,
    errors: [],
  };

  const invalidResult: ValidationResult = {
    valid: false,
    errors: [
      {
        path: '/name',
        message: 'Required property missing',
        keyword: 'required',
        schemaPath: '#/required',
        location: {
          start: { line: 1, column: 0, offset: 0 },
          end: { line: 1, column: 10, offset: 10 },
        },
      },
    ],
  };

  beforeEach(() => {
    cache = new ValidationCache();
  });

  describe('basic operations', () => {
    it('returns undefined for cache miss', () => {
      const result = cache.get('/user/name', 'hash123');
      expect(result).toBeUndefined();
    });

    it('stores and retrieves validation results', () => {
      cache.set('/user/name', 'hash123', validResult);
      const result = cache.get('/user/name', 'hash123');
      expect(result).toBe(validResult);
    });

    it('returns undefined for wrong content hash', () => {
      cache.set('/user/name', 'hash123', validResult);
      const result = cache.get('/user/name', 'hash456'); // Different hash
      expect(result).toBeUndefined();
    });

    it('returns undefined for wrong pointer', () => {
      cache.set('/user/name', 'hash123', validResult);
      const result = cache.get('/user/age', 'hash123'); // Different pointer
      expect(result).toBeUndefined();
    });

    it('tracks cache size', () => {
      expect(cache.size).toBe(0);

      cache.set('/a', 'hash1', validResult);
      expect(cache.size).toBe(1);

      cache.set('/b', 'hash2', validResult);
      expect(cache.size).toBe(2);
    });

    it('clears all entries', () => {
      cache.set('/a', 'hash1', validResult);
      cache.set('/b', 'hash2', validResult);
      expect(cache.size).toBe(2);

      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('/a', 'hash1')).toBeUndefined();
    });
  });

  describe('content-addressable behavior', () => {
    it('treats same pointer with different hashes as different entries', () => {
      cache.set('/user/name', 'hash1', validResult);
      cache.set('/user/name', 'hash2', invalidResult);

      expect(cache.get('/user/name', 'hash1')).toBe(validResult);
      expect(cache.get('/user/name', 'hash2')).toBe(invalidResult);
      expect(cache.size).toBe(2);
    });

    it('automatic invalidation via content hash change', () => {
      // Original value cached
      cache.set('/user/age', 'oldHash', validResult);
      expect(cache.get('/user/age', 'oldHash')).toBe(validResult);

      // Value changed, hash changed, old cache entry becomes unreachable
      expect(cache.get('/user/age', 'newHash')).toBeUndefined();

      // New validation result cached
      cache.set('/user/age', 'newHash', invalidResult);
      expect(cache.get('/user/age', 'newHash')).toBe(invalidResult);

      // Old entry still exists but is unreachable (will be evicted eventually)
      expect(cache.size).toBe(2);
    });
  });

  describe('size limit', () => {
    it('respects maximum size', () => {
      const smallCache = new ValidationCache(3);

      smallCache.set('/a', 'hash1', validResult);
      smallCache.set('/b', 'hash2', validResult);
      smallCache.set('/c', 'hash3', validResult);
      expect(smallCache.size).toBe(3);

      // Adding 4th entry evicts first
      smallCache.set('/d', 'hash4', validResult);
      expect(smallCache.size).toBe(3);
      expect(smallCache.get('/a', 'hash1')).toBeUndefined(); // Evicted
      expect(smallCache.get('/d', 'hash4')).toBe(validResult);
    });

    it('does not evict when updating existing entry', () => {
      const smallCache = new ValidationCache(2);

      smallCache.set('/a', 'hash1', validResult);
      smallCache.set('/b', 'hash2', validResult);
      expect(smallCache.size).toBe(2);

      // Update existing entry
      smallCache.set('/a', 'hash1', invalidResult);
      expect(smallCache.size).toBe(2);
      expect(smallCache.get('/a', 'hash1')).toBe(invalidResult);
      expect(smallCache.get('/b', 'hash2')).toBe(validResult);
    });

    it('uses default size of 1000', () => {
      const defaultCache = new ValidationCache();

      for (let i = 0; i < 1000; i++) {
        defaultCache.set(`/item${i}`, `hash${i}`, validResult);
      }
      expect(defaultCache.size).toBe(1000);

      // 1001st entry evicts first
      defaultCache.set('/item1000', 'hash1000', validResult);
      expect(defaultCache.size).toBe(1000);
      expect(defaultCache.get('/item0', 'hash0')).toBeUndefined();
    });
  });

  describe('key format', () => {
    it('uses pointer@hash format', () => {
      cache.set('/user/name', 'abc123', validResult);

      // Verify it's truly content-addressable
      expect(cache.get('/user/name', 'abc123')).toBe(validResult);
      expect(cache.get('/user/name', 'def456')).toBeUndefined();
    });

    it('handles root pointer', () => {
      cache.set('', 'rootHash', validResult);
      expect(cache.get('', 'rootHash')).toBe(validResult);
    });

    it('handles complex pointers', () => {
      cache.set('/users/0/addresses/1/zipCode', 'complexHash', validResult);
      expect(cache.get('/users/0/addresses/1/zipCode', 'complexHash')).toBe(validResult);
    });
  });

  describe('validation result integrity', () => {
    it('stores complete validation errors', () => {
      cache.set('/user', 'hash1', invalidResult);
      const retrieved = cache.get('/user', 'hash1');

      expect(retrieved).toBeDefined();
      expect(retrieved!.valid).toBe(false);
      expect(retrieved!.errors).toHaveLength(1);
      expect(retrieved!.errors[0]?.keyword).toBe('required');
      expect(retrieved!.errors[0]?.message).toBe('Required property missing');
    });

    it('stores valid results correctly', () => {
      cache.set('/user', 'hash1', validResult);
      const retrieved = cache.get('/user', 'hash1');

      expect(retrieved).toBeDefined();
      expect(retrieved!.valid).toBe(true);
      expect(retrieved!.errors).toHaveLength(0);
    });
  });
});
