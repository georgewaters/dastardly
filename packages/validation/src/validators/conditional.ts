// Conditional validation keywords (if/then/else)

import type { JSONSchema7Definition } from 'json-schema';
import type { KeywordValidator } from '../compiler-types.js';
import { SchemaCompiler } from '../compiler.js';
import { validateAgainstSchema } from '../utils/validate-schema.js';

/**
 * Create an if/then/else validator
 *
 * Conditional validation based on if-schema:
 * - If the if-schema is valid, apply then-schema (if present)
 * - If the if-schema is invalid, apply else-schema (if present)
 *
 * @param ifSchema - Condition schema
 * @param thenSchema - Schema to apply if condition passes
 * @param elseSchema - Schema to apply if condition fails
 * @param compiler - Schema compiler for caching subschemas
 * @returns Keyword validator for if/then/else
 */
export function createIfThenElseValidator(
  ifSchema: JSONSchema7Definition,
  thenSchema: JSONSchema7Definition | undefined,
  elseSchema: JSONSchema7Definition | undefined,
  compiler: SchemaCompiler
): KeywordValidator {
  return {
    validate(node, pointer, schemaPath, context) {
      // First, check if the "if" schema is valid
      const ifErrors = validateAgainstSchema(
        node,
        ifSchema,
        pointer,
        `${schemaPath}/if`,
        context,
        compiler
      );

      const ifIsValid = ifErrors.length === 0;

      // Apply then or else based on if result
      if (ifIsValid && thenSchema !== undefined) {
        // If condition passed, validate against then-schema
        return validateAgainstSchema(
          node,
          thenSchema,
          pointer,
          `${schemaPath}/then`,
          context,
          compiler
        );
      } else if (!ifIsValid && elseSchema !== undefined) {
        // If condition failed, validate against else-schema
        return validateAgainstSchema(
          node,
          elseSchema,
          pointer,
          `${schemaPath}/else`,
          context,
          compiler
        );
      }

      // No applicable schema (if passed but no then, or if failed but no else)
      return [];
    },

    appliesTo: () => true,
  };
}
