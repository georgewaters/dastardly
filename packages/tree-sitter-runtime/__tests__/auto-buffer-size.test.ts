// Test auto-detection of buffer size in NodeTreeSitterRuntime

import { describe, it, expect, beforeEach } from 'vitest';
import { NodeTreeSitterRuntime } from '../src/runtime.js';
import JsonLanguage from 'tree-sitter-json';

describe('NodeTreeSitterRuntime auto buffer size', () => {
  let runtime: NodeTreeSitterRuntime;

  beforeEach(() => {
    runtime = new NodeTreeSitterRuntime();
    runtime.setLanguage(JsonLanguage);
  });

  function generateLargeJSON(sizeInKB: number): string {
    const targetBytes = sizeInKB * 1024;
    const items: string[] = [];
    const itemSize = 50;
    const itemCount = Math.ceil(targetBytes / itemSize);

    for (let i = 0; i < itemCount; i++) {
      items.push(`"key_${i.toString().padStart(6, '0')}": "value_${i.toString().padStart(6, '0')}_with_some_padding"`);
    }

    return `{\n  ${items.join(',\n  ')}\n}`;
  }

  it('should auto-detect buffer size for 48KB file', () => {
    const json = generateLargeJSON(48);
    console.log(`\nTesting ${json.length} bytes with AUTO buffer size detection...`);

    // This should work WITHOUT explicit bufferSize due to auto-detection
    const tree = runtime.parse(json);
    expect(tree.rootNode.hasError).toBe(false);
    console.log('✓ Successfully parsed with auto-detected buffer size');
  });

  it('should auto-detect buffer size for 100KB file', () => {
    const json = generateLargeJSON(100);
    console.log(`\nTesting ${json.length} bytes with AUTO buffer size detection...`);

    const tree = runtime.parse(json);
    expect(tree.rootNode.hasError).toBe(false);
    console.log('✓ Successfully parsed with auto-detected buffer size');
  });

  it('should auto-detect buffer size for 1MB file', () => {
    const json = generateLargeJSON(1024);
    console.log(`\nTesting ${json.length} bytes with AUTO buffer size detection...`);

    const tree = runtime.parse(json);
    expect(tree.rootNode.hasError).toBe(false);
    console.log('✓ Successfully parsed with auto-detected buffer size');
  });

  it('should respect explicit bufferSize when provided', () => {
    const json = generateLargeJSON(100);
    console.log(`\nTesting ${json.length} bytes with EXPLICIT buffer size...`);

    const tree = runtime.parse(json, undefined, { bufferSize: 200 * 1024 });
    expect(tree.rootNode.hasError).toBe(false);
    console.log('✓ Successfully parsed with explicit buffer size');
  });

  it('should work with small files (no auto-detection needed)', () => {
    const json = '{"key": "value"}';
    console.log(`\nTesting ${json.length} bytes (small file)...`);

    const tree = runtime.parse(json);
    expect(tree.rootNode.hasError).toBe(false);
    console.log('✓ Successfully parsed small file');
  });
});
