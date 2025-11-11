// Test to verify tree-sitter buffer size limits and solutions

import { describe, it, expect, beforeEach } from 'vitest';
import Parser from 'tree-sitter';
import JsonLanguage from 'tree-sitter-json';

describe('Tree-sitter buffer size limits', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
    parser.setLanguage(JsonLanguage);
  });

  function generateLargeJSON(sizeInKB: number): string {
    // Generate a JSON object with enough data to reach the target size
    const targetBytes = sizeInKB * 1024;
    const items: string[] = [];

    // Each item is roughly 50 bytes: "key_XXXX": "value_XXXX_with_some_padding",
    const itemSize = 50;
    const itemCount = Math.ceil(targetBytes / itemSize);

    for (let i = 0; i < itemCount; i++) {
      items.push(`"key_${i.toString().padStart(6, '0')}": "value_${i.toString().padStart(6, '0')}_with_some_padding"`);
    }

    return `{\n  ${items.join(',\n  ')}\n}`;
  }

  it('should parse small JSON (10KB) without issues', () => {
    const json = generateLargeJSON(10);
    expect(json.length).toBeGreaterThan(10 * 1024);

    const tree = parser.parse(json);
    expect(tree.rootNode.hasError).toBe(false);
  });

  it('should parse medium JSON (20KB) without issues', () => {
    const json = generateLargeJSON(20);
    expect(json.length).toBeGreaterThan(20 * 1024);

    const tree = parser.parse(json);
    expect(tree.rootNode.hasError).toBe(false);
  });

  it('should parse large JSON (30KB) without issues', () => {
    const json = generateLargeJSON(30);
    expect(json.length).toBeGreaterThan(30 * 1024);

    const tree = parser.parse(json);
    expect(tree.rootNode.hasError).toBe(false);
  });

  it('should fail on very large JSON (48KB) without bufferSize option', () => {
    const json = generateLargeJSON(48);
    expect(json.length).toBeGreaterThan(48 * 1024);

    // This should throw "Invalid argument" error
    expect(() => {
      parser.parse(json);
    }).toThrow('Invalid argument');
  });

  it('should parse very large JSON (48KB) WITH bufferSize option', () => {
    const json = generateLargeJSON(48);
    expect(json.length).toBeGreaterThan(48 * 1024);

    // This should work with explicit bufferSize
    const tree = parser.parse(json, undefined, { bufferSize: 64 * 1024 });
    expect(tree.rootNode.hasError).toBe(false);
  });

  it('should parse huge JSON (100KB) with appropriate bufferSize', () => {
    const json = generateLargeJSON(100);
    expect(json.length).toBeGreaterThan(100 * 1024);

    const tree = parser.parse(json, undefined, { bufferSize: 128 * 1024 });
    expect(tree.rootNode.hasError).toBe(false);
  });

  it('should parse massive JSON (1MB) with appropriate bufferSize', () => {
    const json = generateLargeJSON(1024);
    expect(json.length).toBeGreaterThan(1024 * 1024);

    const tree = parser.parse(json, undefined, { bufferSize: 2 * 1024 * 1024 });
    expect(tree.rootNode.hasError).toBe(false);
  });

  it('should determine the exact size threshold (binary search)', () => {
    // Binary search to find the exact threshold where parsing fails
    let minFails = 32; // Known to work
    let maxWorks = 48; // Known to fail
    let threshold = -1;

    // Test sizes from 32KB to 48KB
    for (let sizeKB = 32; sizeKB <= 48; sizeKB++) {
      const json = generateLargeJSON(sizeKB);
      let failed = false;

      try {
        parser.parse(json);
      } catch (error) {
        failed = true;
        if (threshold === -1) {
          threshold = sizeKB;
        }
      }

      if (failed) {
        console.log(`Size ${sizeKB}KB (${json.length} bytes): FAILED`);
      } else {
        console.log(`Size ${sizeKB}KB (${json.length} bytes): OK`);
      }
    }

    console.log(`\nThreshold appears to be around ${threshold}KB`);
    expect(threshold).toBeGreaterThan(0);
    expect(threshold).toBeLessThanOrEqual(48);
  });
});
