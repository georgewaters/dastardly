// AST change detection

import type { DocumentNode } from './types.js';
import { computeIdentities } from './identity.js';
import { traverse } from './traverse.js';

/**
 * Changes between two AST versions
 */
export interface ASTDiff {
  /** Paths that exist in new but not old */
  added: Set<string>;

  /** Paths that exist in old but not new */
  removed: Set<string>;

  /** Paths where content hash changed */
  modified: Set<string>;

  /** Paths with identical content hash */
  unchanged: Set<string>;
}

/**
 * Compute diff between two ASTs
 * Returns null if nothing changed (fast path via root hash comparison)
 *
 * Time complexity:
 * - Best case (no changes): O(1) - just compare root hashes
 * - Worst case (everything changed): O(n) - visit all nodes
 *
 * @param oldAst - Previous document version
 * @param newAst - Current document version
 * @returns Diff object, or null if nothing changed
 *
 * @example
 * ```typescript
 * const doc1 = json.parse('{"name": "Alice", "age": 30}');
 * const doc2 = json.parse('{"name": "Alice", "age": 31}');
 *
 * const diff = diffASTs(doc1, doc2);
 * console.log(diff.modified); // Set(["/age"])
 * console.log(diff.unchanged); // Set(["/name"])
 * ```
 */
export function diffASTs(oldAst: DocumentNode, newAst: DocumentNode): ASTDiff | null {
  const oldIdentities = computeIdentities(oldAst);
  const newIdentities = computeIdentities(newAst);

  // Fast path: compare root hashes
  const oldRootHash = oldIdentities.get(oldAst.body)?.contentHash;
  const newRootHash = newIdentities.get(newAst.body)?.contentHash;

  if (oldRootHash === newRootHash) {
    return null; // Nothing changed
  }

  // Build path → hash maps
  const oldMap = new Map<string, string>();
  const newMap = new Map<string, string>();

  traverse(oldAst, {
    visit(node) {
      if (node.type === 'Document' || node.type === 'Property') return;
      const id = oldIdentities.get(node);
      if (id) oldMap.set(id.pointer, id.contentHash);
    },
  });

  traverse(newAst, {
    visit(node) {
      if (node.type === 'Document' || node.type === 'Property') return;
      const id = newIdentities.get(node);
      if (id) newMap.set(id.pointer, id.contentHash);
    },
  });

  // Compute differences
  const diff: ASTDiff = {
    added: new Set(),
    removed: new Set(),
    modified: new Set(),
    unchanged: new Set(),
  };

  const allPaths = new Set([...oldMap.keys(), ...newMap.keys()]);

  for (const path of allPaths) {
    const oldHash = oldMap.get(path);
    const newHash = newMap.get(path);

    if (!oldHash) {
      diff.added.add(path);
    } else if (!newHash) {
      diff.removed.add(path);
    } else if (oldHash !== newHash) {
      diff.modified.add(path);
    } else {
      diff.unchanged.add(path);
    }
  }

  return diff;
}

/**
 * Fast check if ASTs are identical (content-wise)
 * O(1) operation via root hash comparison
 *
 * @param a - First document
 * @param b - Second document
 * @returns True if ASTs have identical content
 *
 * @example
 * ```typescript
 * const doc1 = json.parse('{"name": "Alice"}');
 * const doc2 = json.parse('{"name": "Alice"}');
 *
 * console.log(areIdentical(doc1, doc2)); // true
 * ```
 */
export function areIdentical(a: DocumentNode, b: DocumentNode): boolean {
  return diffASTs(a, b) === null;
}
