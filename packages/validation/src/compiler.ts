// Schema compiler - compiles JSON schemas to optimized validators

import type { JSONSchema7 } from 'json-schema';
import type { CompiledSchema, KeywordValidator } from './compiler-types.js';
import { createTypeValidator } from './validators/type.js';

/**
 * Schema compiler
 * Compiles JSON schemas into optimized validator functions
 *
 * Maintains a cache of compiled schemas by reference for performance
 */
export class SchemaCompiler {
  private readonly cache = new Map<JSONSchema7, CompiledSchema>();

  /**
   * Compile a JSON schema to optimized validators
   *
   * @param schema - JSON Schema to compile
   * @returns Compiled schema with validators
   */
  compile(schema: JSONSchema7): CompiledSchema {
    // Check cache first (by schema reference)
    const cached = this.cache.get(schema);
    if (cached) {
      return cached;
    }

    // Compile schema
    const compiled = this.compileSchema(schema);

    // Cache result
    this.cache.set(schema, compiled);

    return compiled;
  }

  /**
   * Compile schema to validators
   */
  private compileSchema(schema: JSONSchema7): CompiledSchema {
    const validators: KeywordValidator[] = [];

    // Type validation
    if (schema.type !== undefined) {
      validators.push(createTypeValidator(schema.type));
    }

    // TODO: Add more keyword validators
    // - String validators (minLength, maxLength, pattern)
    // - Number validators (minimum, maximum, multipleOf)
    // - Object validators (properties, required, additionalProperties)
    // - Array validators (items, minItems, maxItems)
    // - Combinators (allOf, anyOf, oneOf, not)
    // - Conditional (if/then/else)
    // - Enum/const
    // - $ref

    return {
      validators,
      schema,
    };
  }

  /**
   * Clear compilation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size (for debugging/testing)
   */
  get cacheSize(): number {
    return this.cache.size;
  }
}
