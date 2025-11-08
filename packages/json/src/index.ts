// @dastardly/json - JSON parser and serializer

import type { DocumentNode, DataNode, FormatPackage } from '@dastardly/core';
import { NodeTreeSitterRuntime } from '@dastardly/tree-sitter-runtime';
import JSON_LANGUAGE from 'tree-sitter-json';

// Re-export main classes and types
export { JSONParser } from './parser.js';
export type { JSONSerializeOptions } from './serializer.js';

// Re-export utilities
export { escapeString, unescapeString, normalizeIndent } from './utils.js';

import { JSONParser } from './parser.js';
import { serialize as serializeNode, type JSONSerializeOptions } from './serializer.js';

/**
 * JSON format package implementing the FormatPackage interface.
 * Provides parsing and serialization for JSON documents.
 *
 * @example
 * ```typescript
 * import { json } from '@dastardly/json';
 *
 * // Parse JSON
 * const ast = json.parse('{"name": "Alice", "age": 30}');
 *
 * // Serialize with options
 * const output = json.serialize(ast, { indent: 2 });
 * console.log(output);
 * // {
 * //   "name": "Alice",
 * //   "age": 30
 * // }
 * ```
 */
export const json: FormatPackage<JSONSerializeOptions> = {
  /**
   * Parse JSON string into a dASTardly DocumentNode.
   *
   * @param source - JSON string to parse
   * @returns DocumentNode AST
   * @throws ParseError if source is invalid JSON
   */
  parse(source: string): DocumentNode {
    const runtime = new NodeTreeSitterRuntime();
    const parser = new JSONParser(runtime, JSON_LANGUAGE);
    return parser.parse(source);
  },

  /**
   * Parse JSON string and return just the body (DataNode).
   * Convenience for parse(source).body
   *
   * @param source - JSON string to parse
   * @returns DataNode AST
   * @throws ParseError if source is invalid JSON
   */
  parseValue(source: string): DataNode {
    return this.parse(source).body;
  },

  /**
   * Serialize a dASTardly AST node to JSON string.
   *
   * @param node - DocumentNode or DataNode to serialize
   * @param options - JSON serialization options
   * @returns JSON string
   */
  serialize(node: DocumentNode | DataNode, options?: JSONSerializeOptions): string {
    return serializeNode(node, options ?? {});
  },
};

// Convenience exports for destructuring
export const { parse, parseValue, serialize } = json;
