import { describe, it, expect } from 'vitest';
import {
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
  traverse,
  findAll,
  toNative,
  type ASTNode,
  type SourceLocation,
} from '../src/index.js';

describe('Integration: Complex AST operations', () => {
  it('builds and traverses a realistic JSON-like structure', () => {
    // Simulate: { "users": [{ "name": "Alice", "active": true }, { "name": "Bob", "active": false }] }
    const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1), 'json');

    const alice = objectNode(
      [
        propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
        propertyNode(stringNode('active', loc), booleanNode(true, loc), loc),
      ],
      loc
    );

    const bob = objectNode(
      [
        propertyNode(stringNode('name', loc), stringNode('Bob', loc), loc),
        propertyNode(stringNode('active', loc), booleanNode(false, loc), loc),
      ],
      loc
    );

    const usersArray = arrayNode([alice, bob], loc);

    const root = objectNode(
      [propertyNode(stringNode('users', loc), usersArray, loc)],
      loc
    );

    const doc = documentNode(root, loc);

    // Test: Count all nodes
    let nodeCount = 0;
    traverse(doc, {
      visit: () => {
        nodeCount++;
      },
    });

    // Count: doc(1) + root(1) + users prop(1) + users key(1) + array(1)
    // + alice obj(1) + 2 props in alice(2) + 2 keys + 2 values in alice(4)
    // + bob obj(1) + 2 props in bob(2) + 2 keys + 2 values in bob(4) = 19
    expect(nodeCount).toBe(19);

    // Test: Find all string values
    const strings = findAll(doc, (n) => n.type === 'String');
    expect(strings).toHaveLength(7); // "users" key + 2x "name" keys + 2x name values + 2x "active" keys

    // Test: Convert to native
    expect(toNative(root)).toEqual({
      users: [
        { name: 'Alice', active: true },
        { name: 'Bob', active: false },
      ],
    });
  });

  it('preserves source locations throughout traversal', () => {
    const start = position(2, 5, 10);
    const end = position(2, 10, 15);
    const loc = sourceLocation(start, end, 'yaml');

    const node = stringNode('test', loc);
    const doc = documentNode(node, loc);

    const locations: SourceLocation[] = [];
    traverse(doc, {
      visit: (n) => {
        locations.push(n.loc);
      },
    });

    // All nodes should have the same location
    expect(locations).toHaveLength(2);
    expect(locations[0]!.start).toEqual(start);
    expect(locations[0]!.end).toEqual(end);
    expect(locations[0]!.source).toBe('yaml');
  });

  it('handles deeply nested structures', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1));

    // Create: { a: { b: { c: { d: "deep" } } } }
    const deepValue = stringNode('deep', loc);
    const levelD = objectNode(
      [propertyNode(stringNode('d', loc), deepValue, loc)],
      loc
    );
    const levelC = objectNode(
      [propertyNode(stringNode('c', loc), levelD, loc)],
      loc
    );
    const levelB = objectNode(
      [propertyNode(stringNode('b', loc), levelC, loc)],
      loc
    );
    const levelA = objectNode(
      [propertyNode(stringNode('a', loc), levelB, loc)],
      loc
    );

    // Test: Find the deepest string
    const deepString = findAll(levelA, (n) => n.type === 'String' && n.value === 'deep');
    expect(deepString).toHaveLength(1);

    // Test: Convert preserves nesting
    expect(toNative(levelA)).toEqual({
      a: { b: { c: { d: 'deep' } } },
    });
  });

  it('handles mixed arrays with different types', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1));

    // Create: [1, "two", true, null, { nested: "object" }]
    const nestedObj = objectNode(
      [propertyNode(stringNode('nested', loc), stringNode('object', loc), loc)],
      loc
    );

    const arr = arrayNode(
      [
        numberNode(1, loc),
        stringNode('two', loc),
        booleanNode(true, loc),
        nullNode(loc),
        nestedObj,
      ],
      loc
    );

    // Test: Each type is present
    expect(findAll(arr, (n) => n.type === 'Number')).toHaveLength(1);
    expect(findAll(arr, (n) => n.type === 'String')).toHaveLength(3); // "two" + "nested" key + "object" value
    expect(findAll(arr, (n) => n.type === 'Boolean')).toHaveLength(1);
    expect(findAll(arr, (n) => n.type === 'Null')).toHaveLength(1);
    expect(findAll(arr, (n) => n.type === 'Object')).toHaveLength(1);

    // Test: Native conversion
    expect(toNative(arr)).toEqual([1, 'two', true, null, { nested: 'object' }]);
  });

  it('supports custom visitor logic with type narrowing', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1));

    const obj = objectNode(
      [
        propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
        propertyNode(stringNode('age', loc), numberNode(30, loc), loc),
        propertyNode(stringNode('active', loc), booleanNode(true, loc), loc),
      ],
      loc
    );

    // Collect all string values (not keys)
    const stringValues: string[] = [];
    traverse(obj, {
      visit: (node) => {
        // Type narrowing works!
        if (node.type === 'Property') {
          if (node.value.type === 'String') {
            stringValues.push(node.value.value);
          }
        }
      },
    });

    expect(stringValues).toEqual(['Alice']);
  });

  it('handles empty structures', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1));

    const emptyObj = objectNode([], loc);
    const emptyArr = arrayNode([], loc);

    expect(toNative(emptyObj)).toEqual({});
    expect(toNative(emptyArr)).toEqual([]);

    // Empty structures have no children
    let objChildCount = 0;
    traverse(emptyObj, { visit: () => objChildCount++ });
    expect(objChildCount).toBe(1); // Just the object itself

    let arrChildCount = 0;
    traverse(emptyArr, { visit: () => arrChildCount++ });
    expect(arrChildCount).toBe(1); // Just the array itself
  });
});
