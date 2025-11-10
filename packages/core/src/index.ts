// dASTardly core - format-agnostic AST types and utilities

// Export all type definitions
export type {
  Position,
  SourceRange,
  SourceLocation,
  ASTNode,
  StringNode,
  NumberNode,
  BooleanNode,
  NullNode,
  ValueNode,
  PropertyNode,
  ObjectNode,
  ArrayNode,
  DataNode,
  DocumentNode,
} from './types.js';

// Export builder functions
export {
  position,
  sourceLocation,
  stringNode,
  numberNode,
  booleanNode,
  nullNode,
  propertyNode,
  objectNode,
  arrayNode,
  documentNode,
} from './builders.js';

// Export type guards
export {
  isValueNode,
  isContainerNode,
  isObjectNode,
  isArrayNode,
  isStringNode,
  isNumberNode,
  isBooleanNode,
  isNullNode,
  isDocumentNode,
  isPropertyNode,
} from './guards.js';

// Export visitor pattern and traversal
export type { Visitor } from './traverse.js';
export { visit, traverse, findAll, findFirst, getChildren } from './traverse.js';

// Export utilities
export { toNative } from './utils.js';

// Export format package interface
export type { FormatPackage, BaseParseOptions, BaseSerializeOptions } from './format-interface.js';

// Export identity system (content-based node identity)
export type { NodeIdentity } from './identity.js';
export { hashNode, computeIdentities, createIdentity } from './identity.js';

// Export JSON Pointer utilities (RFC 6901)
export {
  getByPointer,
  hasPointer,
  parsePointer,
  compilePointer,
  parentPointer,
} from './pointer.js';

// Export diffing utilities
export type { ASTDiff } from './diff.js';
export { diffASTs, areIdentical } from './diff.js';
