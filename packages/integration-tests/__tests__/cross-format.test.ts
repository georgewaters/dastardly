import { describe, it, expect } from 'vitest';
import { parse as parseJSON, serialize as serializeJSON } from '@dastardly/json';
import { parse as parseYAML, serialize as serializeYAML } from '@dastardly/yaml';
import { toNative } from '@dastardly/core';
import { loadJSONFixture, loadYAMLFixture } from './helpers/fixtures.js';

describe('Cross-format conversions: JSON ↔ YAML', () => {
  describe('JSON → YAML → JSON roundtrip', () => {
    it('converts simple string', () => {
      const jsonSource = loadJSONFixture('primitives/string');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);
      const jsonOutput = serializeJSON(yamlAst);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(jsonOutput).toBe('"hello world"');
    });

    it('converts numbers', () => {
      const jsonSource = loadJSONFixture('primitives/number');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(toNative(yamlAst)).toBe(42);
    });

    it('converts booleans', () => {
      const jsonSource = loadJSONFixture('primitives/boolean');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(toNative(yamlAst)).toBe(true);
    });

    it('converts null', () => {
      const jsonSource = loadJSONFixture('primitives/null');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(toNative(yamlAst)).toBe(null);
    });

    it('converts empty string', () => {
      const jsonSource = loadJSONFixture('primitives/empty-string');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(toNative(yamlAst)).toBe('');
    });

    it('converts unicode strings', () => {
      const jsonSource = loadJSONFixture('primitives/unicode');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(toNative(yamlAst)).toBe('Hello 世界 🌍');
    });

    it('converts simple objects', () => {
      const jsonSource = loadJSONFixture('collections/simple-object');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      const expected = { name: 'Alice', age: 30, active: true };
      expect(toNative(jsonAst)).toEqual(expected);
      expect(toNative(yamlAst)).toEqual(expected);
    });

    it('converts simple arrays', () => {
      const jsonSource = loadJSONFixture('collections/simple-array');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      const expected = [1, 2, 3, 4, 5];
      expect(toNative(jsonAst)).toEqual(expected);
      expect(toNative(yamlAst)).toEqual(expected);
    });

    it('converts nested objects', () => {
      const jsonSource = loadJSONFixture('collections/nested-object');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      const expected = {
        user: {
          name: 'Bob',
          contact: {
            email: 'bob@example.com',
            phone: '555-1234',
          },
        },
      };
      expect(toNative(jsonAst)).toEqual(expected);
      expect(toNative(yamlAst)).toEqual(expected);
    });

    it('converts nested arrays', () => {
      const jsonSource = loadJSONFixture('collections/nested-array');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      const expected = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      expect(toNative(jsonAst)).toEqual(expected);
      expect(toNative(yamlAst)).toEqual(expected);
    });

    it('converts mixed arrays', () => {
      const jsonSource = loadJSONFixture('collections/mixed-array');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      const expected = [1, 'two', true, null, { five: 5 }];
      expect(toNative(jsonAst)).toEqual(expected);
      expect(toNative(yamlAst)).toEqual(expected);
    });

    it('converts empty objects', () => {
      const jsonSource = loadJSONFixture('collections/empty-object');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual({});
      expect(toNative(yamlAst)).toEqual({});
    });

    it('converts empty arrays', () => {
      const jsonSource = loadJSONFixture('collections/empty-array');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual([]);
      expect(toNative(yamlAst)).toEqual([]);
    });
  });

  describe('YAML → JSON → YAML roundtrip', () => {
    it('converts block mappings', () => {
      const yamlSource = loadYAMLFixture('collections/block-mapping');
      const yamlAst = parseYAML(yamlSource);
      const jsonOutput = serializeJSON(yamlAst);
      const jsonAst = parseJSON(jsonOutput);

      const expected = { name: 'Alice', age: 30, active: true };
      expect(toNative(yamlAst)).toEqual(expected);
      expect(toNative(jsonAst)).toEqual(expected);
    });

    it('converts block sequences', () => {
      const yamlSource = loadYAMLFixture('collections/block-sequence');
      const yamlAst = parseYAML(yamlSource);
      const jsonOutput = serializeJSON(yamlAst);
      const jsonAst = parseJSON(jsonOutput);

      const expected = ['apple', 'banana', 'cherry'];
      expect(toNative(yamlAst)).toEqual(expected);
      expect(toNative(jsonAst)).toEqual(expected);
    });

    it('converts flow mappings', () => {
      const yamlSource = loadYAMLFixture('collections/flow-mapping');
      const yamlAst = parseYAML(yamlSource);
      const jsonOutput = serializeJSON(yamlAst);
      const jsonAst = parseJSON(jsonOutput);

      const expected = { name: 'Alice', age: 30 };
      expect(toNative(yamlAst)).toEqual(expected);
      expect(toNative(jsonAst)).toEqual(expected);
    });

    it('converts flow sequences', () => {
      const yamlSource = loadYAMLFixture('collections/flow-sequence');
      const yamlAst = parseYAML(yamlSource);
      const jsonOutput = serializeJSON(yamlAst);
      const jsonAst = parseJSON(jsonOutput);

      const expected = [1, 2, 3, 4, 5];
      expect(toNative(yamlAst)).toEqual(expected);
      expect(toNative(jsonAst)).toEqual(expected);
    });

    it('converts nested YAML structures', () => {
      const yamlSource = loadYAMLFixture('collections/nested');
      const yamlAst = parseYAML(yamlSource);
      const jsonOutput = serializeJSON(yamlAst);
      const jsonAst = parseJSON(jsonOutput);

      const expected = {
        user: {
          name: 'Bob',
          contact: {
            email: 'bob@example.com',
            phone: '555-1234',
          },
        },
      };
      expect(toNative(yamlAst)).toEqual(expected);
      expect(toNative(jsonAst)).toEqual(expected);
    });
  });

  describe('Real-world documents', () => {
    it('converts package.json to YAML and back', () => {
      const jsonSource = loadJSONFixture('real-world/package');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);
      const jsonOutput = serializeJSON(yamlAst);
      const finalAst = parseJSON(jsonOutput);

      expect(toNative(jsonAst)).toEqual(toNative(finalAst));
      expect(toNative(jsonAst)).toHaveProperty('name', 'example-package');
      expect(toNative(jsonAst)).toHaveProperty('dependencies.lodash');
    });

    it('converts tsconfig.json to YAML and back', () => {
      const jsonSource = loadJSONFixture('real-world/tsconfig');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(toNative(jsonAst)).toHaveProperty('compilerOptions.strict', true);
    });

    it('converts API response to YAML and back', () => {
      const jsonSource = loadJSONFixture('real-world/api-response');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(toNative(jsonAst)).toHaveProperty('status', 'success');
      expect(toNative(jsonAst)).toHaveProperty('data.users');
    });

    it('converts docker-compose.yaml to JSON and back', () => {
      const yamlSource = loadYAMLFixture('real-world/docker-compose');
      const yamlAst = parseYAML(yamlSource);
      const jsonOutput = serializeJSON(yamlAst);
      const jsonAst = parseJSON(jsonOutput);
      const yamlOutput = serializeYAML(jsonAst);
      const finalAst = parseYAML(yamlOutput);

      expect(toNative(yamlAst)).toEqual(toNative(finalAst));
      expect(toNative(yamlAst)).toHaveProperty('version', '3.8');
      expect(toNative(yamlAst)).toHaveProperty('services.web');
    });

    it('converts GitHub Actions workflow to JSON and back', () => {
      const yamlSource = loadYAMLFixture('real-world/github-actions');
      const yamlAst = parseYAML(yamlSource);
      const jsonOutput = serializeJSON(yamlAst);
      const jsonAst = parseJSON(jsonOutput);

      expect(toNative(yamlAst)).toEqual(toNative(jsonAst));
      expect(toNative(yamlAst)).toHaveProperty('name', 'CI');
      expect(toNative(yamlAst)).toHaveProperty('jobs.test');
    });
  });

  describe('Edge cases', () => {
    it('handles large numbers', () => {
      const jsonSource = loadJSONFixture('edge-cases/large-number');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(toNative(yamlAst)).toBe(9007199254740992);
    });

    it('handles scientific notation', () => {
      const jsonSource = loadJSONFixture('edge-cases/scientific-notation');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(toNative(yamlAst)).toBe(1.5e10);
    });

    it('handles deeply nested structures', () => {
      const jsonSource = loadJSONFixture('edge-cases/deeply-nested');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      expect(toNative(yamlAst)).toHaveProperty('a.b.c.d.e.f.g.h.i.j', 'deep');
    });

    it('handles objects with many properties', () => {
      const jsonSource = loadJSONFixture('edge-cases/many-properties');
      const jsonAst = parseJSON(jsonSource);
      const yamlOutput = serializeYAML(jsonAst);
      const yamlAst = parseYAML(yamlOutput);

      expect(toNative(jsonAst)).toEqual(toNative(yamlAst));
      const native = toNative(yamlAst) as Record<string, unknown>;
      expect(Object.keys(native).length).toBe(20);
    });
  });

  describe('YAML-specific features', () => {
    it('resolves anchors and aliases in conversion', () => {
      const yamlSource = loadYAMLFixture('yaml-specific/anchors-aliases');
      const yamlAst = parseYAML(yamlSource);
      const jsonOutput = serializeJSON(yamlAst);
      const jsonAst = parseJSON(jsonOutput);

      // Anchors should be resolved to their values
      expect(toNative(yamlAst)).toEqual(toNative(jsonAst));
      expect(toNative(jsonAst)).toHaveProperty('service1.timeout', 30);
      expect(toNative(jsonAst)).toHaveProperty('service2.timeout', 60);
    });

    it('resolves merge keys in conversion', () => {
      const yamlSource = loadYAMLFixture('yaml-specific/merge-keys');
      const yamlAst = parseYAML(yamlSource);
      const jsonOutput = serializeJSON(yamlAst);
      const jsonAst = parseJSON(jsonOutput);

      expect(toNative(yamlAst)).toEqual(toNative(jsonAst));
      expect(toNative(jsonAst)).toHaveProperty('extended.x', 1);
      expect(toNative(jsonAst)).toHaveProperty('extended.y', 2);
      expect(toNative(jsonAst)).toHaveProperty('extended.z', 3);
    });

    it('handles special YAML values (infinity, NaN)', () => {
      const yamlSource = loadYAMLFixture('yaml-specific/special-values');
      const yamlAst = parseYAML(yamlSource);

      // Note: JSON cannot represent Infinity or NaN, so we just verify parsing
      const native = toNative(yamlAst) as Record<string, unknown>;
      expect(native.positive_infinity).toBe(Infinity);
      expect(native.negative_infinity).toBe(-Infinity);
      expect(native.not_a_number).toBe(NaN);
    });

    it('handles multiline strings in conversion', () => {
      const yamlSource = loadYAMLFixture('scalars/multiline-string');
      const yamlAst = parseYAML(yamlSource);
      const jsonOutput = serializeJSON(yamlAst);
      const jsonAst = parseJSON(jsonOutput);

      expect(toNative(yamlAst)).toEqual(toNative(jsonAst));
      const value = toNative(jsonAst) as string;
      expect(value).toContain('This is a multiline');
      expect(value).toContain('string with line breaks');
    });
  });
});
