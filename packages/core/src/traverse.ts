// Visitor pattern and tree traversal utilities

import type { ASTNode } from './types.js';

/**
 * Visitor interface for traversing AST.
 * Uses discriminated unions for type-safe node handling.
 *
 * @example
 * ```ts
 * const visitor: Visitor = {
 *   visit(node) {
 *     switch (node.type) {
 *       case 'String':
 *         // TypeScript knows node is StringNode here
 *         console.log(node.value);
 *         break;
 *       case 'Object':
 *         // TypeScript knows node is ObjectNode here
 *         console.log(node.properties.length);
 *         break;
 *     }
 *   }
 * };
 * ```
 */
export interface Visitor<T = void> {
  visit(node: ASTNode): T;
}

/**
 * Visit a single node with a visitor.
 * Does not traverse children.
 */
export function visit<T>(node: ASTNode, visitor: Visitor<T>): T {
  return visitor.visit(node);
}

/**
 * Recursively traverse all nodes in the tree (depth-first).
 * Visits each node and all its descendants.
 *
 * @example
 * ```ts
 * traverse(ast, {
 *   visit(node) {
 *     if (node.type === 'String') {
 *       console.log('Found string:', node.value);
 *     }
 *   }
 * });
 * ```
 */
export function traverse(node: ASTNode, visitor: Visitor<void>): void {
  visitor.visit(node);

  switch (node.type) {
    case 'Document': {
      const doc = node as import('./types.js').DocumentNode;
      traverse(doc.body, visitor);
      break;
    }

    case 'Object': {
      const obj = node as import('./types.js').ObjectNode;
      for (const prop of obj.properties) {
        traverse(prop, visitor);
      }
      break;
    }

    case 'Array': {
      const arr = node as import('./types.js').ArrayNode;
      for (const element of arr.elements) {
        traverse(element, visitor);
      }
      break;
    }

    case 'Property': {
      const prop = node as import('./types.js').PropertyNode;
      traverse(prop.key, visitor);
      traverse(prop.value, visitor);
      break;
    }

    // Value nodes have no children
  }
}

/**
 * Find all nodes matching a predicate (depth-first search).
 *
 * @example
 * ```ts
 * // Find all string nodes
 * const strings = findAll(ast, node => node.type === 'String');
 * ```
 */
export function findAll(
  node: ASTNode,
  predicate: (node: ASTNode) => boolean
): ASTNode[] {
  const results: ASTNode[] = [];

  traverse(node, {
    visit(n) {
      if (predicate(n)) {
        results.push(n);
      }
    },
  });

  return results;
}

/**
 * Find first node matching a predicate (depth-first search).
 * Returns undefined if no match found.
 *
 * @example
 * ```ts
 * // Find first number node with value > 100
 * const largeNumber = findFirst(ast, node =>
 *   node.type === 'Number' && node.value > 100
 * );
 * ```
 */
export function findFirst(
  node: ASTNode,
  predicate: (node: ASTNode) => boolean
): ASTNode | undefined {
  if (predicate(node)) return node;

  const children = getChildren(node);
  for (const child of children) {
    const result = findFirst(child, predicate);
    if (result) return result;
  }

  return undefined;
}

/**
 * Get immediate children of a node.
 * Returns an empty array for value nodes.
 */
export function getChildren(node: ASTNode): readonly ASTNode[] {
  switch (node.type) {
    case 'Document': {
      const doc = node as import('./types.js').DocumentNode;
      return [doc.body];
    }

    case 'Object': {
      const obj = node as import('./types.js').ObjectNode;
      return obj.properties;
    }

    case 'Array': {
      const arr = node as import('./types.js').ArrayNode;
      return arr.elements;
    }

    case 'Property': {
      const prop = node as import('./types.js').PropertyNode;
      return [prop.key, prop.value];
    }

    default:
      return [];
  }
}
