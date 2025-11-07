// Utility functions for working with AST nodes

import type { DataNode } from './types.js';

/**
 * Convert AST to native JavaScript value.
 * Loses all position/location information.
 *
 * @example
 * ```ts
 * const ast = objectNode([
 *   propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)
 * ], loc);
 *
 * const native = toNative(ast);
 * // { name: 'Alice' }
 * ```
 */
export function toNative(node: DataNode): unknown {
  switch (node.type) {
    case 'String':
    case 'Number':
    case 'Boolean':
    case 'Null':
      return node.value;

    case 'Object': {
      const obj: Record<string, unknown> = {};
      for (const prop of node.properties) {
        obj[prop.key.value] = toNative(prop.value);
      }
      return obj;
    }

    case 'Array':
      return node.elements.map(toNative);
  }
}
