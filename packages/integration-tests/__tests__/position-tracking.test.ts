import { describe, it, expect } from 'vitest';
import { parse as parseJSON } from '@dastardly/json';
import { parse as parseYAML } from '@dastardly/yaml';
import {
  assertAllPositionsValid,
  assertSourceLocationValid,
  assertPositionRangesValid,
} from './helpers/assertions.js';
import { loadJSONFixture, loadYAMLFixture } from './helpers/fixtures.js';
import type { ArrayNode, ObjectNode } from '@dastardly/core';

describe('Position tracking', () => {
  describe('JSON position tracking', () => {
    it('tracks positions for primitives', () => {
      const source = loadJSONFixture('primitives/string');
      const ast = parseJSON(source);

      assertAllPositionsValid(ast);
      expect(ast.loc.source).toBe('json');
    });

    it('tracks positions for objects', () => {
      const source = loadJSONFixture('collections/simple-object');
      const ast = parseJSON(source);

      assertAllPositionsValid(ast);

      // Verify document has valid location
      expect(ast.type).toBe('Document');
      assertSourceLocationValid(ast.loc);

      // Verify body object has valid location
      expect(ast.body).toBeTruthy();
      if (ast.body) {
        assertSourceLocationValid(ast.body.loc);
        expect(ast.body.type).toBe('Object');
      }
    });

    it('tracks positions for arrays', () => {
      const source = loadJSONFixture('collections/simple-array');
      const ast = parseJSON(source);

      assertAllPositionsValid(ast);

      if (ast.body?.type === 'Array') {
        const arrayNode = ast.body as ArrayNode;
        // Each element should have valid positions
        for (const element of arrayNode.elements) {
          assertSourceLocationValid(element.loc);
        }

        // Elements should not overlap
        assertPositionRangesValid(arrayNode.elements);
      }
    });

    it('tracks positions for nested structures', () => {
      const source = loadJSONFixture('collections/nested-object');
      const ast = parseJSON(source);

      assertAllPositionsValid(ast);

      // Verify nested structure positions
      if (ast.body?.type === 'Object') {
        const objectNode = ast.body as ObjectNode;
        for (const prop of objectNode.properties) {
          assertSourceLocationValid(prop.loc);
          assertSourceLocationValid(prop.key.loc);
          assertSourceLocationValid(prop.value.loc);

          // Key should come before value
          expect(prop.key.loc.end.offset).toBeLessThanOrEqual(
            prop.value.loc.start.offset
          );
        }
      }
    });

    it('tracks positions for real-world JSON', () => {
      const source = loadJSONFixture('real-world/package');
      const ast = parseJSON(source);

      assertAllPositionsValid(ast);
    });

    it('tracks positions with unicode', () => {
      const source = loadJSONFixture('primitives/unicode');
      const ast = parseJSON(source);

      assertAllPositionsValid(ast);

      // Unicode characters should be handled correctly
      if (ast.body?.type === 'String') {
        const start = ast.body.loc.start.offset;
        const end = ast.body.loc.end.offset;
        const substring = source.substring(start, end);
        expect(substring).toContain('世界');
        expect(substring).toContain('🌍');
      }
    });
  });

  describe('YAML position tracking', () => {
    it('tracks positions for scalars', () => {
      const source = loadYAMLFixture('scalars/plain-string');
      const ast = parseYAML(source);

      assertAllPositionsValid(ast);
      expect(ast.loc.source).toBe('yaml');
    });

    it('tracks positions for block mappings', () => {
      const source = loadYAMLFixture('collections/block-mapping');
      const ast = parseYAML(source);

      assertAllPositionsValid(ast);

      if (ast.body?.type === 'Object') {
        const objectNode = ast.body as ObjectNode;
        for (const prop of objectNode.properties) {
          assertSourceLocationValid(prop.loc);
          assertSourceLocationValid(prop.key.loc);
          assertSourceLocationValid(prop.value.loc);
        }
      }
    });

    it('tracks positions for block sequences', () => {
      const source = loadYAMLFixture('collections/block-sequence');
      const ast = parseYAML(source);

      assertAllPositionsValid(ast);

      if (ast.body?.type === 'Array') {
        const arrayNode = ast.body as ArrayNode;
        for (const element of arrayNode.elements) {
          assertSourceLocationValid(element.loc);
        }
      }
    });

    it('tracks positions for nested YAML', () => {
      const source = loadYAMLFixture('collections/nested');
      const ast = parseYAML(source);

      assertAllPositionsValid(ast);
    });

    it('tracks positions for real-world YAML', () => {
      const source = loadYAMLFixture('real-world/docker-compose');
      const ast = parseYAML(source);

      assertAllPositionsValid(ast);
    });

    it('tracks positions with multiline strings', () => {
      const source = loadYAMLFixture('scalars/multiline-string');
      const ast = parseYAML(source);

      assertAllPositionsValid(ast);

      // Multiline string should span multiple lines
      if (ast.body?.type === 'String') {
        const loc = ast.body.loc;
        expect(loc.end.line).toBeGreaterThan(loc.start.line);
      }
    });

    it('tracks positions with anchors and aliases', () => {
      const source = loadYAMLFixture('yaml-specific/anchors-aliases');
      const ast = parseYAML(source);

      // All resolved nodes should have valid positions
      assertAllPositionsValid(ast);
    });
  });

  describe('Position accuracy', () => {
    it('JSON: line numbers match source', () => {
      const source = loadJSONFixture('collections/simple-object');
      const ast = parseJSON(source);

      const lines = source.split('\n');

      // Verify that positions reference actual lines
      if (ast.body?.type === 'Object') {
        const objectNode = ast.body as ObjectNode;
        for (const prop of objectNode.properties) {
          const line = prop.loc.start.line;
          expect(line).toBeGreaterThan(0);
          expect(line).toBeLessThanOrEqual(lines.length);

          // Extract line content and verify key is present
          const lineContent = lines[line - 1]; // lines are 1-indexed
          if (prop.key.type === 'String') {
            expect(lineContent).toContain(prop.key.value);
          }
        }
      }
    });

    it('YAML: line numbers match source', () => {
      const source = loadYAMLFixture('collections/block-mapping');
      const ast = parseYAML(source);

      const lines = source.split('\n');

      if (ast.body?.type === 'Object') {
        const objectNode = ast.body as ObjectNode;
        for (const prop of objectNode.properties) {
          const line = prop.loc.start.line;
          expect(line).toBeGreaterThan(0);
          expect(line).toBeLessThanOrEqual(lines.length);

          // Extract line content and verify key is present
          const lineContent = lines[line - 1];
          if (prop.key.type === 'String') {
            expect(lineContent).toContain(prop.key.value);
          }
        }
      }
    });

    it('JSON: offsets match byte positions', () => {
      const source = loadJSONFixture('primitives/string');
      const ast = parseJSON(source);

      if (ast.body) {
        const start = ast.body.loc.start.offset;
        const end = ast.body.loc.end.offset;

        // Extract substring using offsets
        const extracted = source.substring(start, end);

        // For a string primitive, offsets should give us the quoted string
        expect(extracted).toBe('"hello world"');
      }
    });

    it('YAML: offsets match byte positions', () => {
      const source = loadYAMLFixture('scalars/plain-string');
      const ast = parseYAML(source);

      if (ast.body) {
        const start = ast.body.loc.start.offset;
        const end = ast.body.loc.end.offset;

        // Extract substring using offsets
        const extracted = source.substring(start, end);

        // Should match the scalar value
        expect(extracted).toBe('hello world');
      }
    });

    it('columns are 0-indexed', () => {
      const jsonSource = '{"key": "value"}';
      const ast = parseJSON(jsonSource);

      if (ast.body?.type === 'Object') {
        const objectNode = ast.body as ObjectNode;
        const firstProp = objectNode.properties[0];

        if (firstProp) {
          // Column indexing starts at 0
          expect(firstProp.key.loc.start.column).toBeGreaterThanOrEqual(0);

          // First character '{' is at column 0
          expect(ast.body.loc.start.column).toBe(0);
        }
      }
    });

    it('handles deeply nested position tracking', () => {
      const source = loadJSONFixture('edge-cases/deeply-nested');
      const ast = parseJSON(source);

      // All positions should be valid even at depth
      assertAllPositionsValid(ast);

      // Walk to deepest node and verify its position
      let current = ast.body;
      while (current?.type === 'Object') {
        assertSourceLocationValid(current.loc);
        const objectNode = current as ObjectNode;
        if (objectNode.properties.length > 0) {
          current = objectNode.properties[0]!.value;
        } else {
          break;
        }
      }

      // Deepest string node should have valid position
      if (current?.type === 'String') {
        assertSourceLocationValid(current.loc);
        expect(current.value).toBe('deep');
      }
    });
  });

  describe('Position consistency', () => {
    it('JSON: parent ranges contain child ranges', () => {
      const source = loadJSONFixture('collections/nested-object');
      const ast = parseJSON(source);

      if (ast.body?.type === 'Object') {
        const objectNode = ast.body as ObjectNode;

        for (const prop of objectNode.properties) {
          // Property range should contain key and value ranges
          expect(prop.loc.start.offset).toBeLessThanOrEqual(
            prop.key.loc.start.offset
          );
          expect(prop.loc.end.offset).toBeGreaterThanOrEqual(
            prop.value.loc.end.offset
          );

          // If value is an object, its range should be within property range
          if (prop.value.type === 'Object') {
            expect(prop.loc.start.offset).toBeLessThanOrEqual(
              prop.value.loc.start.offset
            );
            expect(prop.loc.end.offset).toBeGreaterThanOrEqual(
              prop.value.loc.end.offset
            );
          }
        }
      }
    });

    it('YAML: parent ranges contain child ranges', () => {
      const source = loadYAMLFixture('collections/nested');
      const ast = parseYAML(source);

      if (ast.body?.type === 'Object') {
        const objectNode = ast.body as ObjectNode;

        for (const prop of objectNode.properties) {
          // Property range should contain key and value ranges
          expect(prop.loc.start.offset).toBeLessThanOrEqual(
            prop.key.loc.start.offset
          );
          expect(prop.loc.end.offset).toBeGreaterThanOrEqual(
            prop.value.loc.end.offset
          );
        }
      }
    });
  });
});
