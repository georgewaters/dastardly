// Core AST type definitions for dASTardly
// Pure, immutable, format-agnostic data structures

// =============================================================================
// Position & Location Types
// =============================================================================

/**
 * A position in source text (line, column, and byte offset).
 * Lines are 1-indexed, columns and offsets are 0-indexed.
 */
export interface Position {
  readonly line: number;    // 1-indexed line number
  readonly column: number;  // 0-indexed column number
  readonly offset: number;  // 0-indexed byte offset from start of file
}

/**
 * A range in source text with start and end positions.
 */
export interface SourceRange {
  readonly start: Position;
  readonly end: Position;
}

/**
 * Source location with format metadata.
 */
export interface SourceLocation extends SourceRange {
  readonly source?: string;  // Source format: "json", "yaml", "xml", etc.
}

// =============================================================================
// AST Node Base Types
// =============================================================================

/**
 * Base interface for all AST nodes.
 */
export interface ASTNode {
  readonly type: string;
  readonly loc: SourceLocation;
}

// =============================================================================
// Value Nodes (Leaf nodes with scalar values)
// =============================================================================

/**
 * String value node.
 */
export interface StringNode extends ASTNode {
  readonly type: 'String';
  readonly value: string;
  readonly raw?: string;  // Original representation with quotes (e.g., '"hello"')
}

/**
 * Number value node.
 */
export interface NumberNode extends ASTNode {
  readonly type: 'Number';
  readonly value: number;
  readonly raw?: string;  // Original representation (e.g., "1.0", "1e5")
}

/**
 * Boolean value node.
 */
export interface BooleanNode extends ASTNode {
  readonly type: 'Boolean';
  readonly value: boolean;
}

/**
 * Null value node.
 */
export interface NullNode extends ASTNode {
  readonly type: 'Null';
  readonly value: null;
}

/**
 * Union of all value node types.
 */
export type ValueNode = StringNode | NumberNode | BooleanNode | NullNode;

// =============================================================================
// Container Nodes (Nodes with children)
// =============================================================================

/**
 * Object property (key-value pair).
 */
export interface PropertyNode extends ASTNode {
  readonly type: 'Property';
  readonly key: StringNode;
  readonly value: DataNode;
}

/**
 * Object node (map/dictionary).
 * No format-specific metadata - keep core pure.
 */
export interface ObjectNode extends ASTNode {
  readonly type: 'Object';
  readonly properties: readonly PropertyNode[];
}

/**
 * Array node (ordered list).
 */
export interface ArrayNode extends ASTNode {
  readonly type: 'Array';
  readonly elements: readonly DataNode[];
}

/**
 * Union of all data node types (containers + values).
 */
export type DataNode = ObjectNode | ArrayNode | ValueNode;

// =============================================================================
// Document Node (Root)
// =============================================================================

/**
 * Document root node.
 */
export interface DocumentNode extends ASTNode {
  readonly type: 'Document';
  readonly body: DataNode;
}
