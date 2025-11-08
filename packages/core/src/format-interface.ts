// Format package interface for dASTardly

import type { DocumentNode, DataNode } from './types.js';

/**
 * Base serialization options shared by all formats.
 *
 * Currently minimal - only truly universal options belong here
 * (e.g., future: encoding, unicode normalization, BOM handling).
 *
 * Format-specific options (indent, delimiters, quoting, etc.) belong in
 * format-specific extensions like JSONSerializeOptions or CSVSerializeOptions.
 */
export interface BaseSerializeOptions {
  // Intentionally minimal - most options are format-specific
}

/**
 * Common interface all format packages must implement.
 * Provides consistent API across JSON, YAML, XML, CSV, TOML, etc.
 *
 * Format packages export an object implementing this interface, ensuring
 * type safety and API consistency across all formats.
 *
 * @template TOptions - Format-specific serialization options extending BaseSerializeOptions
 *
 * @example
 * ```typescript
 * // Implementing a format package
 * import type { FormatPackage } from '@dastardly/core';
 *
 * export interface JSONSerializeOptions extends BaseSerializeOptions {
 *   indent?: number | string;
 *   preserveRaw?: boolean;
 * }
 *
 * export const json: FormatPackage<JSONSerializeOptions> = {
 *   parse(source) {
 *     // Parse JSON to AST
 *   },
 *
 *   parseValue(source) {
 *     return this.parse(source).body;
 *   },
 *
 *   serialize(node, options) {
 *     // Serialize AST to JSON
 *   }
 * };
 * ```
 */
export interface FormatPackage<
  TOptions extends BaseSerializeOptions = BaseSerializeOptions
> {
  /**
   * Parse source text into a dASTardly DocumentNode.
   *
   * @param source - Source text in the format (JSON, YAML, XML, etc.)
   * @returns Parsed DocumentNode AST with full position information
   * @throws ParseError if source is invalid or malformed
   *
   * @example
   * ```typescript
   * import { json } from '@dastardly/json';
   *
   * const ast = json.parse('{"name": "Alice", "age": 30}');
   * console.log(ast.type); // 'Document'
   * console.log(ast.body.type); // 'Object'
   * ```
   */
  parse(source: string): DocumentNode;

  /**
   * Parse source and return just the body (DataNode).
   *
   * Convenience method equivalent to `parse(source).body`.
   * Useful when you only need the data structure without document wrapper.
   *
   * @param source - Source text in the format
   * @returns DataNode AST (document body without wrapper)
   * @throws ParseError if source is invalid or malformed
   *
   * @example
   * ```typescript
   * import { yaml } from '@dastardly/yaml';
   *
   * const data = yaml.parseValue('name: Alice\nage: 30');
   * console.log(data.type); // 'Object' (not 'Document')
   * ```
   */
  parseValue(source: string): DataNode;

  /**
   * Serialize a dASTardly AST node to format-specific text.
   *
   * Accepts either a DocumentNode or DataNode and converts it to the
   * target format (JSON, YAML, XML, etc.) using format-specific options.
   *
   * @param node - DocumentNode or DataNode to serialize
   * @param options - Format-specific serialization options (optional)
   * @returns Serialized text in the target format
   *
   * @example
   * ```typescript
   * import { json } from '@dastardly/json';
   * import { objectNode, propertyNode, stringNode, numberNode } from '@dastardly/core';
   *
   * const ast = objectNode([
   *   propertyNode(stringNode('name'), stringNode('Alice')),
   *   propertyNode(stringNode('age'), numberNode(30))
   * ]);
   *
   * // Compact output
   * json.serialize(ast); // '{"name":"Alice","age":30}'
   *
   * // Pretty-printed
   * json.serialize(ast, { indent: 2 });
   * // {
   * //   "name": "Alice",
   * //   "age": 30
   * // }
   * ```
   */
  serialize(node: DocumentNode | DataNode, options?: TOptions): string;
}
