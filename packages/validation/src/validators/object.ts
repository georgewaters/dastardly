// Object validation keywords

import type { KeywordValidator } from '../compiler-types.js';

/**
 * Create a required validator
 *
 * Validates that all required properties are present in an object
 *
 * @param required - Array of required property names
 * @returns Keyword validator for required
 */
export function createRequiredValidator(required: readonly string[]): KeywordValidator {
  return {
    validate(node, pointer, schemaPath) {
      if (node.type !== 'Object') return [];

      const errors = [];
      const propertyKeys = new Set(node.properties.map((p) => p.key.value));

      for (const requiredKey of required) {
        if (!propertyKeys.has(requiredKey)) {
          errors.push({
            path: pointer,
            message: `Missing required property: ${requiredKey}`,
            keyword: 'required',
            schemaPath: `${schemaPath}/required`,
            location: node.loc,
            params: { missingProperty: requiredKey },
          });
        }
      }

      return errors;
    },

    appliesTo: (node) => node.type === 'Object',
  };
}
