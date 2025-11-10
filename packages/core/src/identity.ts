// Content-based identity system for AST nodes

import hash from 'object-hash';
import type { DataNode, DocumentNode, ASTNode } from './types.js';
import { traverse } from './traverse.js';

/**
 * Content-based identity for AST nodes
 * Stable across re-parses if content unchanged
 */
export interface NodeIdentity {
  /** JSON Pointer path: "/users/0/name" */
  pointer: string;

  /** Content hash (semantic only, ignores position) */
  contentHash: string;

  /** Combined cache key: "/users/0/name@hash123" */
  id: string;
}

/**
 * Compute content hash for node (semantic content only)
 * Uses object-hash for deterministic hashing
 *
 * Ignores position information (loc), only hashes semantic content
 *
 * @param node - AST node to hash
 * @returns Content hash as hex string
 *
 * @example
 * ```typescript
 * const node = stringNode('Alice', loc);
 * const hash = hashNode(node);
 * // hash is stable - same for all stringNode('Alice') regardless of position
 * ```
 */
export function hashNode(node: DataNode): string {
  // Convert to semantic representation (no position info)
  const semantic = toSemantic(node);

  // Use object-hash for deterministic hashing
  return hash(semantic, {
    algorithm: 'sha1',
    encoding: 'hex',
    respectType: true,
    respectFunctionNames: false,
    respectFunctionProperties: false,
    unorderedArrays: false,
    unorderedSets: false,
    unorderedObjects: false,
  });
}

/**
 * Semantic representation of an AST node (position-free)
 */
type SemanticNode =
  | { type: 'String'; value: string }
  | { type: 'Number'; value: number }
  | { type: 'Boolean'; value: boolean }
  | { type: 'Null' }
  | { type: 'Object'; properties: Array<{ key: string; value: SemanticNode }> }
  | { type: 'Array'; elements: SemanticNode[] };

/**
 * Convert AST node to semantic representation
 * Strips position info, keeps only semantic content
 */
function toSemantic(node: DataNode): SemanticNode {
  switch (node.type) {
    case 'String':
      return { type: 'String', value: node.value };
    case 'Number':
      return { type: 'Number', value: node.value };
    case 'Boolean':
      return { type: 'Boolean', value: node.value };
    case 'Null':
      return { type: 'Null' };
    case 'Object':
      return {
        type: 'Object',
        properties: node.properties.map((p) => ({
          key: p.key.value,
          value: toSemantic(p.value),
        })),
      };
    case 'Array':
      return {
        type: 'Array',
        elements: node.elements.map(toSemantic),
      };
  }
}

/**
 * Compute identities for all nodes in tree
 * Uses JSON Pointer for path representation (RFC 6901)
 * Returns WeakMap for O(1) lookup by node reference
 *
 * @param root - Document node to compute identities for
 * @returns WeakMap mapping each DataNode to its identity
 *
 * @example
 * ```typescript
 * const identities = computeIdentities(doc);
 * const nameNode = getByPointer(doc, '/user/name');
 * const identity = identities.get(nameNode);
 * console.log(identity.pointer); // "/user/name"
 * console.log(identity.id); // "/user/name@abc123..."
 * ```
 */
export function computeIdentities(root: DocumentNode): WeakMap<DataNode, NodeIdentity> {
  const identities = new WeakMap<DataNode, NodeIdentity>();

  function visit(node: ASTNode, pointer: string): void {
    if (node.type === 'Document') {
      visit(node.body, '');
      return;
    }

    if (node.type === 'Property') {
      return; // Properties are not data nodes
    }

    // At this point, TypeScript knows node is DataNode
    // (ASTNode excluding Document and Property)
    const contentHash = hashNode(node);
    const id = pointer ? `${pointer}@${contentHash}` : `@${contentHash}`;

    identities.set(node, {
      pointer,
      contentHash,
      id,
    });

    switch (node.type) {
      case 'Object':
        for (const prop of node.properties) {
          const propPointer = `${pointer}/${escapePointer(prop.key.value)}`;
          visit(prop.value, propPointer);
        }
        break;
      case 'Array':
        for (let i = 0; i < node.elements.length; i++) {
          // Safe: i is within bounds (i < length)
          visit(node.elements[i]!, `${pointer}/${i}`);
        }
        break;
    }
  }

  visit(root, '');
  return identities;
}

/**
 * Create identity for single node (requires pointer)
 *
 * @param node - Data node
 * @param pointer - JSON Pointer path
 * @returns Node identity
 *
 * @example
 * ```typescript
 * const node = stringNode('Alice', loc);
 * const identity = createIdentity(node, '/user/name');
 * console.log(identity.id); // "/user/name@abc123..."
 * ```
 */
export function createIdentity(node: DataNode, pointer: string): NodeIdentity {
  const contentHash = hashNode(node);
  const id = pointer ? `${pointer}@${contentHash}` : `@${contentHash}`;

  return { pointer, contentHash, id };
}

/**
 * Escape string for use in JSON Pointer (RFC 6901)
 * Replaces ~ with ~0 and / with ~1
 */
function escapePointer(str: string): string {
  return str.replace(/~/g, '~0').replace(/\//g, '~1');
}
