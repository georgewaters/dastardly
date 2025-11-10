// JSON Schema validator for dASTardly ASTs

import type { JSONSchema7 } from 'json-schema';
import type { DocumentNode, DataNode, NodeIdentity } from '@dastardly/core';
import { computeIdentities, getByPointer } from '@dastardly/core';
import { ValidationCache } from './cache.js';
import type { ValidationResult, ValidationError } from './types.js';

/**
 * Validator options
 */
export interface ValidatorOptions {
  /** Enable validation caching (default: true) */
  cache?: boolean;

  /** Maximum cache size (default: 1000) */
  cacheSize?: number;

  /** Fail fast - stop on first error (default: false) */
  failFast?: boolean;
}

/**
 * JSON Schema validator for dASTardly ASTs
 * Supports JSON Schema Draft 7 with content-addressable caching
 *
 * @example
 * ```typescript
 * const validator = new Validator(schema);
 * const result = validator.validate(document);
 * if (!result.valid) {
 *   for (const error of result.errors) {
 *     console.error(`${error.path}: ${error.message}`);
 *   }
 * }
 * ```
 */
export class Validator {
  private readonly schema: JSONSchema7;
  private readonly cache: ValidationCache | null;
  private readonly failFast: boolean;

  /**
   * Create a new validator
   *
   * @param schema - JSON Schema (must be fully resolved, no remote $refs)
   * @param options - Validator options
   */
  constructor(schema: JSONSchema7, options: ValidatorOptions = {}) {
    this.schema = schema;
    this.cache = options.cache !== false ? new ValidationCache(options.cacheSize) : null;
    this.failFast = options.failFast ?? false;
  }

  /**
   * Validate a document against the schema
   *
   * @param document - Document to validate
   * @returns Validation result
   */
  validate(document: DocumentNode): ValidationResult {
    // Compute identities for all nodes (for caching and error reporting)
    const identities = computeIdentities(document);

    // Validate root node
    const errors: ValidationError[] = [];
    this.validateNode(document.body, '', this.schema, '#', identities, errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.cache?.clear();
  }

  /**
   * Validate a single node against a schema
   *
   * @param node - AST node to validate
   * @param pointer - JSON Pointer path to node
   * @param schema - Schema to validate against
   * @param schemaPath - Path in schema (for error reporting)
   * @param identities - Node identities map
   * @param errors - Accumulated errors
   * @returns True if validation should stop (fail-fast mode)
   */
  private validateNode(
    node: DataNode,
    pointer: string,
    schema: JSONSchema7,
    schemaPath: string,
    identities: WeakMap<DataNode, NodeIdentity>,
    errors: ValidationError[]
  ): boolean {
    // Check cache
    if (this.cache) {
      const identity = identities.get(node);
      if (identity) {
        const cached = this.cache.get(pointer, identity.contentHash);
        if (cached) {
          errors.push(...cached.errors);
          return this.failFast && !cached.valid;
        }
      }
    }

    // Validate node
    const nodeErrors: ValidationError[] = [];
    const shouldStop = this.validateNodeUncached(
      node,
      pointer,
      schema,
      schemaPath,
      identities,
      nodeErrors
    );

    // Cache result
    if (this.cache) {
      const identity = identities.get(node);
      if (identity) {
        this.cache.set(pointer, identity.contentHash, {
          valid: nodeErrors.length === 0,
          errors: nodeErrors,
        });
      }
    }

    errors.push(...nodeErrors);
    return shouldStop;
  }

  /**
   * Validate node without cache (implementation)
   */
  private validateNodeUncached(
    node: DataNode,
    pointer: string,
    schema: JSONSchema7,
    schemaPath: string,
    identities: WeakMap<DataNode, NodeIdentity>,
    errors: ValidationError[]
  ): boolean {
    // TODO: Implement schema validation keywords
    // For now, just a placeholder that validates basic types

    // Type validation
    if (schema.type !== undefined) {
      if (!this.validateType(node, schema.type, pointer, schemaPath, errors)) {
        return this.failFast;
      }
    }

    return false;
  }

  /**
   * Validate node type
   */
  private validateType(
    node: DataNode,
    schemaType: JSONSchema7['type'],
    pointer: string,
    schemaPath: string,
    errors: ValidationError[]
  ): boolean {
    if (typeof schemaType === 'string') {
      if (!this.nodeMatchesType(node, schemaType)) {
        const nodeType = this.getNodeTypeForError(node);
        errors.push({
          path: pointer,
          message: `Expected type ${schemaType}, got ${nodeType}`,
          keyword: 'type',
          schemaPath: `${schemaPath}/type`,
          location: node.loc,
          params: { type: schemaType },
        });
        return false;
      }
    } else if (Array.isArray(schemaType)) {
      const matches = schemaType.some((t) => this.nodeMatchesType(node, t));
      if (!matches) {
        const nodeType = this.getNodeTypeForError(node);
        errors.push({
          path: pointer,
          message: `Expected one of ${schemaType.join(', ')}, got ${nodeType}`,
          keyword: 'type',
          schemaPath: `${schemaPath}/type`,
          location: node.loc,
          params: { type: schemaType },
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Check if node matches a JSON Schema type
   */
  private nodeMatchesType(node: DataNode, schemaType: string): boolean {
    switch (node.type) {
      case 'String':
        return schemaType === 'string';
      case 'Number':
        // Numbers match both 'number' and 'integer' (if they're integers)
        if (schemaType === 'number') return true;
        if (schemaType === 'integer') return node.value % 1 === 0;
        return false;
      case 'Boolean':
        return schemaType === 'boolean';
      case 'Null':
        return schemaType === 'null';
      case 'Array':
        return schemaType === 'array';
      case 'Object':
        return schemaType === 'object';
    }
  }

  /**
   * Get JSON Schema type name for error messages
   */
  private getNodeTypeForError(node: DataNode): string {
    switch (node.type) {
      case 'String':
        return 'string';
      case 'Number':
        return node.value % 1 === 0 ? 'integer' : 'number';
      case 'Boolean':
        return 'boolean';
      case 'Null':
        return 'null';
      case 'Array':
        return 'array';
      case 'Object':
        return 'object';
    }
  }
}
