// Type guard functions for AST nodes

import type {
  ASTNode,
  ValueNode,
  ObjectNode,
  ArrayNode,
  StringNode,
  NumberNode,
  BooleanNode,
  NullNode,
  DocumentNode,
  PropertyNode,
} from './types.js';

/**
 * Type guard for value nodes.
 */
export function isValueNode(node: ASTNode): node is ValueNode {
  return (
    node.type === 'String' ||
    node.type === 'Number' ||
    node.type === 'Boolean' ||
    node.type === 'Null'
  );
}

/**
 * Type guard for container nodes.
 */
export function isContainerNode(node: ASTNode): node is ObjectNode | ArrayNode {
  return node.type === 'Object' || node.type === 'Array';
}

/**
 * Type guard for object node.
 */
export function isObjectNode(node: ASTNode): node is ObjectNode {
  return node.type === 'Object';
}

/**
 * Type guard for array node.
 */
export function isArrayNode(node: ASTNode): node is ArrayNode {
  return node.type === 'Array';
}

/**
 * Type guard for string node.
 */
export function isStringNode(node: ASTNode): node is StringNode {
  return node.type === 'String';
}

/**
 * Type guard for number node.
 */
export function isNumberNode(node: ASTNode): node is NumberNode {
  return node.type === 'Number';
}

/**
 * Type guard for boolean node.
 */
export function isBooleanNode(node: ASTNode): node is BooleanNode {
  return node.type === 'Boolean';
}

/**
 * Type guard for null node.
 */
export function isNullNode(node: ASTNode): node is NullNode {
  return node.type === 'Null';
}

/**
 * Type guard for document node.
 */
export function isDocumentNode(node: ASTNode): node is DocumentNode {
  return node.type === 'Document';
}

/**
 * Type guard for property node.
 */
export function isPropertyNode(node: ASTNode): node is PropertyNode {
  return node.type === 'Property';
}
