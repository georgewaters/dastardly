// Test to find the exact buffer size threshold

import { describe, it, expect, beforeEach } from 'vitest';
import Parser from 'tree-sitter';
import JsonLanguage from 'tree-sitter-json';

describe('Tree-sitter exact buffer size threshold', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
    parser.setLanguage(JsonLanguage);
  });

  function generateJSONOfSize(targetBytes: number): string {
    // Generate a JSON array with enough data to reach target size
    const items: string[] = [];
    let currentSize = 2; // Start with "[]"

    let i = 0;
    while (currentSize < targetBytes) {
      const item = `"item_${i.toString().padStart(6, '0')}"`;
      const itemWithComma = items.length > 0 ? `, ${item}` : item;

      if (currentSize + itemWithComma.length > targetBytes) {
        break;
      }

      items.push(item);
      currentSize += itemWithComma.length;
      i++;
    }

    const json = `[${items.join(', ')}]`;
    return json;
  }

  it('should find exact threshold by testing byte sizes', () => {
    const testSizes = [
      30000, 30500, 31000, 31500, 32000, 32500, 32768, 33000, 33500, 34000
    ];

    console.log('\nTesting various byte sizes:');
    console.log('─'.repeat(60));

    for (const size of testSizes) {
      const json = generateJSONOfSize(size);
      const actualSize = json.length;
      let failed = false;

      try {
        const tree = parser.parse(json);
        console.log(`${actualSize.toString().padStart(6)} bytes: ✓ SUCCESS`);
      } catch (error: any) {
        failed = true;
        console.log(`${actualSize.toString().padStart(6)} bytes: ✗ FAILED (${error.message})`);
      }
    }
  });

  it('should work with bufferSize option for large files', () => {
    const json = generateJSONOfSize(100000);
    console.log(`\nTesting ${json.length} bytes WITH bufferSize option...`);

    const tree = parser.parse(json, undefined, { bufferSize: 128 * 1024 });
    expect(tree.rootNode.hasError).toBe(false);
    console.log('✓ Successfully parsed with bufferSize option');
  });
});
