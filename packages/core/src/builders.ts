// Builder functions for constructing AST nodes

import type {
  Position,
  SourceLocation,
  StringNode,
  NumberNode,
  BooleanNode,
  NullNode,
  PropertyNode,
  ObjectNode,
  ArrayNode,
  DocumentNode,
  DataNode,
} from './types.js';

// =============================================================================
// Position & Location Builders
// =============================================================================

/**
 * Create a position.
 */
export function position(line: number, column: number, offset: number): Position {
  return { line, column, offset };
}

/**
 * Create a source location.
 */
export function sourceLocation(
  start: Position,
  end: Position,
  source?: string
): SourceLocation {
  if (source === undefined) {
    return { start, end };
  }
  return { start, end, source };
}

// =============================================================================
// Node Builders
// =============================================================================

/**
 * Create a string node.
 */
export function stringNode(
  value: string,
  loc: SourceLocation,
  raw?: string
): StringNode {
  if (raw === undefined) {
    return { type: 'String', value, loc };
  }
  return { type: 'String', value, loc, raw };
}

/**
 * Create a number node.
 */
export function numberNode(
  value: number,
  loc: SourceLocation,
  raw?: string
): NumberNode {
  if (raw === undefined) {
    return { type: 'Number', value, loc };
  }
  return { type: 'Number', value, loc, raw };
}

/**
 * Create a boolean node.
 */
export function booleanNode(
  value: boolean,
  loc: SourceLocation
): BooleanNode {
  return { type: 'Boolean', value, loc };
}

/**
 * Create a null node.
 */
export function nullNode(loc: SourceLocation): NullNode {
  return { type: 'Null', value: null, loc };
}

/**
 * Create a property node.
 */
export function propertyNode(
  key: StringNode,
  value: DataNode,
  loc: SourceLocation
): PropertyNode {
  return { type: 'Property', key, value, loc };
}

/**
 * Create an object node.
 */
export function objectNode(
  properties: readonly PropertyNode[],
  loc: SourceLocation
): ObjectNode {
  return { type: 'Object', properties, loc };
}

/**
 * Create an array node.
 */
export function arrayNode(
  elements: readonly DataNode[],
  loc: SourceLocation
): ArrayNode {
  return { type: 'Array', elements, loc };
}

/**
 * Create a document node.
 */
export function documentNode(
  body: DataNode,
  loc: SourceLocation
): DocumentNode {
  return { type: 'Document', body, loc };
}
