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
