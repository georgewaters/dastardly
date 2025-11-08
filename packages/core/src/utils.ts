// Utility functions for working with AST nodes

import type { DataNode, ASTNode } from './types.js';

/**
 * Convert AST to native JavaScript value.
 * Loses all position/location information.
 *
 * Accepts either a DataNode or a DocumentNode. If a DocumentNode is provided,
 * converts its root node.
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
export function toNative(node: ASTNode): unknown {
  // Handle Document nodes by converting their body
  if (node.type === 'Document') {
    return toNative(node.body);
  }

  // Handle DataNode types
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

    default:
      // Exhaustiveness check - should never reach here
      console.error('toNative: Unknown node type:', node.type, 'Full node:', node);
      throw new Error(`Unknown node type: ${(node as any).type}`);
  }
}
