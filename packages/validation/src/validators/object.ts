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

/**
 * Create a minProperties validator
 *
 * Validates that an object has at least the minimum number of properties
 *
 * @param minProperties - Minimum number of properties
 * @returns Keyword validator for minProperties
 */
export function createMinPropertiesValidator(minProperties: number): KeywordValidator {
  return {
    validate(node, pointer, schemaPath) {
      if (node.type !== 'Object') return [];

      const propertyCount = node.properties.length;

      if (propertyCount < minProperties) {
        return [
          {
            path: pointer,
            message: `Object has ${propertyCount} properties, minimum is ${minProperties}`,
            keyword: 'minProperties',
            schemaPath: `${schemaPath}/minProperties`,
            location: node.loc,
            params: { minProperties },
          },
        ];
      }

      return [];
    },

    appliesTo: (node) => node.type === 'Object',
  };
}

/**
 * Create a maxProperties validator
 *
 * Validates that an object has at most the maximum number of properties
 *
 * @param maxProperties - Maximum number of properties
 * @returns Keyword validator for maxProperties
 */
export function createMaxPropertiesValidator(maxProperties: number): KeywordValidator {
  return {
    validate(node, pointer, schemaPath) {
      if (node.type !== 'Object') return [];

      const propertyCount = node.properties.length;

      if (propertyCount > maxProperties) {
        return [
          {
            path: pointer,
            message: `Object has ${propertyCount} properties, maximum is ${maxProperties}`,
            keyword: 'maxProperties',
            schemaPath: `${schemaPath}/maxProperties`,
            location: node.loc,
            params: { maxProperties },
          },
        ];
      }

      return [];
    },

    appliesTo: (node) => node.type === 'Object',
  };
}
