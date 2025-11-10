// JSON Pointer utilities (RFC 6901)

import pointer from 'json-pointer';
import type { DataNode, DocumentNode } from './types.js';
import { toNative } from './utils.js';

/**
 * Get node at JSON Pointer path
 * Returns undefined if path doesn't exist
 *
 * @param root - Document root
 * @param ptr - JSON Pointer string (e.g., "/users/0/name")
 * @returns DataNode at path, or undefined if not found
 *
 * @example
 * ```typescript
 * const doc = json.parse('{"users": [{"name": "Alice"}]}');
 * const nameNode = getByPointer(doc, '/users/0/name');
 * // Returns StringNode with value "Alice"
 * ```
 */
export function getByPointer(root: DocumentNode, ptr: string): DataNode | undefined {
  if (!ptr || ptr === '') return root.body;

  try {
    // Traverse AST following the path
    return traversePath(root.body, ptr);
  } catch {
    return undefined;
  }
}

/**
 * Check if pointer exists in document
 *
 * @param root - Document root
 * @param ptr - JSON Pointer string
 * @returns True if path exists
 */
export function hasPointer(root: DocumentNode, ptr: string): boolean {
  return getByPointer(root, ptr) !== undefined;
}

/**
 * Parse JSON Pointer string to segments
 * Uses json-pointer package for RFC 6901 compliance
 *
 * @param ptr - JSON Pointer string (e.g., "/users/0/name")
 * @returns Array of path segments
 *
 * @example
 * ```typescript
 * parsePointer("/users/0/name")
 * // → ["users", 0, "name"]
 *
 * parsePointer("/a~1b/c~0d")
 * // → ["a/b", "c~d"]
 * ```
 */
export function parsePointer(ptr: string): Array<string | number> {
  return pointer.parse(ptr);
}

/**
 * Compile segments to JSON Pointer string
 * Uses json-pointer package for RFC 6901 compliance
 *
 * @param segments - Array of path segments
 * @returns JSON Pointer string
 *
 * @example
 * ```typescript
 * compilePointer(["users", 0, "name"])
 * // → "/users/0/name"
 *
 * compilePointer(["a/b", "c~d"])
 * // → "/a~1b/c~0d"
 * ```
 */
export function compilePointer(segments: Array<string | number>): string {
  return pointer.compile(segments.map(String));
}

/**
 * Get parent pointer
 *
 * @param ptr - JSON Pointer string
 * @returns Parent pointer, or null if at root
 *
 * @example
 * ```typescript
 * parentPointer("/users/0/name") // → "/users/0"
 * parentPointer("/users") // → ""
 * parentPointer("") // → null
 * ```
 */
export function parentPointer(ptr: string): string | null {
  if (!ptr || ptr === '') return null;

  const segments = parsePointer(ptr);
  if (segments.length === 0) return null;

  segments.pop();
  return compilePointer(segments);
}

/**
 * Traverse AST following JSON Pointer path
 * Direct AST traversal without converting to native
 */
function traversePath(node: DataNode, ptr: string): DataNode | undefined {
  const segments = parsePointer(ptr);
  let current: DataNode = node;

  for (const segment of segments) {
    if (current.type === 'Object') {
      const prop = current.properties.find((p) => p.key.value === String(segment));
      if (!prop) return undefined;
      current = prop.value;
    } else if (current.type === 'Array') {
      const index = typeof segment === 'number' ? segment : parseInt(String(segment), 10);
      if (isNaN(index) || index < 0 || index >= current.elements.length) {
        return undefined;
      }
      // Safe: index is within bounds (checked above)
      current = current.elements[index]!;
    } else {
      return undefined;
    }
  }

  return current;
}
