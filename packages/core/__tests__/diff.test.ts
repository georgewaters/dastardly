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
  diffASTs,
  areIdentical,
} from '../src/index.js';

const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1));

describe('diffASTs', () => {
  it('returns null for identical documents', () => {
    const doc1 = documentNode(stringNode('hello', loc), loc);
    const doc2 = documentNode(stringNode('hello', loc), loc);

    const diff = diffASTs(doc1, doc2);
    expect(diff).toBe(null);
  });

  it('detects modified value nodes', () => {
    const doc1 = documentNode(stringNode('hello', loc), loc);
    const doc2 = documentNode(stringNode('world', loc), loc);

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.modified.has('')).toBe(true);
    expect(diff?.added.size).toBe(0);
    expect(diff?.removed.size).toBe(0);
  });

  it('detects modified object property value', () => {
    const doc1 = documentNode(
      objectNode(
        [
          propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
          propertyNode(stringNode('age', loc), numberNode(30, loc), loc),
        ],
        loc
      ),
      loc
    );
    const doc2 = documentNode(
      objectNode(
        [
          propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
          propertyNode(stringNode('age', loc), numberNode(31, loc), loc),
        ],
        loc
      ),
      loc
    );

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.modified.has('/age')).toBe(true);
    expect(diff?.unchanged.has('/name')).toBe(true);
    expect(diff?.added.size).toBe(0);
    expect(diff?.removed.size).toBe(0);
  });

  it('detects added property', () => {
    const doc1 = documentNode(
      objectNode(
        [propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)],
        loc
      ),
      loc
    );
    const doc2 = documentNode(
      objectNode(
        [
          propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
          propertyNode(stringNode('age', loc), numberNode(30, loc), loc),
        ],
        loc
      ),
      loc
    );

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.added.has('/age')).toBe(true);
    expect(diff?.unchanged.has('/name')).toBe(true);
    expect(diff?.modified.has('')).toBe(true); // Root object changed
    expect(diff?.removed.size).toBe(0);
  });

  it('detects removed property', () => {
    const doc1 = documentNode(
      objectNode(
        [
          propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
          propertyNode(stringNode('age', loc), numberNode(30, loc), loc),
        ],
        loc
      ),
      loc
    );
    const doc2 = documentNode(
      objectNode(
        [propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)],
        loc
      ),
      loc
    );

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.removed.has('/age')).toBe(true);
    expect(diff?.unchanged.has('/name')).toBe(true);
    expect(diff?.added.size).toBe(0);
    expect(diff?.modified.has('')).toBe(true); // Root object changed
  });

  it('detects added array element', () => {
    const doc1 = documentNode(
      arrayNode([numberNode(1, loc), numberNode(2, loc)], loc),
      loc
    );
    const doc2 = documentNode(
      arrayNode([numberNode(1, loc), numberNode(2, loc), numberNode(3, loc)], loc),
      loc
    );

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.added.has('/2')).toBe(true);
    expect(diff?.unchanged.has('/0')).toBe(true);
    expect(diff?.unchanged.has('/1')).toBe(true);
  });

  it('detects removed array element', () => {
    const doc1 = documentNode(
      arrayNode([numberNode(1, loc), numberNode(2, loc), numberNode(3, loc)], loc),
      loc
    );
    const doc2 = documentNode(
      arrayNode([numberNode(1, loc), numberNode(2, loc)], loc),
      loc
    );

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.removed.has('/2')).toBe(true);
    expect(diff?.unchanged.has('/0')).toBe(true);
    expect(diff?.unchanged.has('/1')).toBe(true);
  });

  it('detects modified array element', () => {
    const doc1 = documentNode(
      arrayNode([numberNode(1, loc), numberNode(2, loc), numberNode(3, loc)], loc),
      loc
    );
    const doc2 = documentNode(
      arrayNode([numberNode(1, loc), numberNode(99, loc), numberNode(3, loc)], loc),
      loc
    );

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.modified.has('/1')).toBe(true);
    expect(diff?.unchanged.has('/0')).toBe(true);
    expect(diff?.unchanged.has('/2')).toBe(true);
  });

  it('detects nested changes', () => {
    // { user: { name: "Alice", age: 30 } }
    const doc1 = documentNode(
      objectNode(
        [
          propertyNode(
            stringNode('user', loc),
            objectNode(
              [
                propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
                propertyNode(stringNode('age', loc), numberNode(30, loc), loc),
              ],
              loc
            ),
            loc
          ),
        ],
        loc
      ),
      loc
    );

    // { user: { name: "Alice", age: 31 } }
    const doc2 = documentNode(
      objectNode(
        [
          propertyNode(
            stringNode('user', loc),
            objectNode(
              [
                propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
                propertyNode(stringNode('age', loc), numberNode(31, loc), loc),
              ],
              loc
            ),
            loc
          ),
        ],
        loc
      ),
      loc
    );

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.modified.has('/user/age')).toBe(true);
    expect(diff?.unchanged.has('/user/name')).toBe(true);
  });

  it('handles multiple simultaneous changes', () => {
    const doc1 = documentNode(
      objectNode(
        [
          propertyNode(stringNode('a', loc), numberNode(1, loc), loc),
          propertyNode(stringNode('b', loc), numberNode(2, loc), loc),
          propertyNode(stringNode('c', loc), numberNode(3, loc), loc),
        ],
        loc
      ),
      loc
    );

    const doc2 = documentNode(
      objectNode(
        [
          propertyNode(stringNode('a', loc), numberNode(1, loc), loc),
          propertyNode(stringNode('b', loc), numberNode(99, loc), loc),
          propertyNode(stringNode('d', loc), numberNode(4, loc), loc),
        ],
        loc
      ),
      loc
    );

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.unchanged.has('/a')).toBe(true);
    expect(diff?.modified.has('/b')).toBe(true);
    expect(diff?.removed.has('/c')).toBe(true);
    expect(diff?.added.has('/d')).toBe(true);
  });

  it('ignores position changes', () => {
    const loc1 = sourceLocation(position(1, 0, 0), position(1, 5, 5));
    const loc2 = sourceLocation(position(10, 20, 100), position(10, 25, 105));

    const doc1 = documentNode(stringNode('hello', loc1), loc1);
    const doc2 = documentNode(stringNode('hello', loc2), loc2);

    const diff = diffASTs(doc1, doc2);
    expect(diff).toBe(null); // No changes, position doesn't matter
  });

  it('handles empty objects', () => {
    const doc1 = documentNode(objectNode([], loc), loc);
    const doc2 = documentNode(objectNode([], loc), loc);

    const diff = diffASTs(doc1, doc2);
    expect(diff).toBe(null);
  });

  it('handles empty arrays', () => {
    const doc1 = documentNode(arrayNode([], loc), loc);
    const doc2 = documentNode(arrayNode([], loc), loc);

    const diff = diffASTs(doc1, doc2);
    expect(diff).toBe(null);
  });

  it('detects type changes', () => {
    const doc1 = documentNode(stringNode('42', loc), loc);
    const doc2 = documentNode(numberNode(42, loc), loc);

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.modified.has('')).toBe(true);
  });

  it('detects object to array conversion', () => {
    const doc1 = documentNode(objectNode([], loc), loc);
    const doc2 = documentNode(arrayNode([], loc), loc);

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.modified.has('')).toBe(true);
  });

  it('handles complex nested structure changes', () => {
    // {
    //   "users": [
    //     { "name": "Alice", "age": 30 },
    //     { "name": "Bob", "age": 25 }
    //   ]
    // }
    const doc1 = documentNode(
      objectNode(
        [
          propertyNode(
            stringNode('users', loc),
            arrayNode(
              [
                objectNode(
                  [
                    propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
                    propertyNode(stringNode('age', loc), numberNode(30, loc), loc),
                  ],
                  loc
                ),
                objectNode(
                  [
                    propertyNode(stringNode('name', loc), stringNode('Bob', loc), loc),
                    propertyNode(stringNode('age', loc), numberNode(25, loc), loc),
                  ],
                  loc
                ),
              ],
              loc
            ),
            loc
          ),
        ],
        loc
      ),
      loc
    );

    // {
    //   "users": [
    //     { "name": "Alice", "age": 31 },
    //     { "name": "Bob", "age": 25 }
    //   ]
    // }
    const doc2 = documentNode(
      objectNode(
        [
          propertyNode(
            stringNode('users', loc),
            arrayNode(
              [
                objectNode(
                  [
                    propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
                    propertyNode(stringNode('age', loc), numberNode(31, loc), loc),
                  ],
                  loc
                ),
                objectNode(
                  [
                    propertyNode(stringNode('name', loc), stringNode('Bob', loc), loc),
                    propertyNode(stringNode('age', loc), numberNode(25, loc), loc),
                  ],
                  loc
                ),
              ],
              loc
            ),
            loc
          ),
        ],
        loc
      ),
      loc
    );

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);
    expect(diff?.modified.has('/users/0/age')).toBe(true);
    expect(diff?.unchanged.has('/users/0/name')).toBe(true);
    expect(diff?.unchanged.has('/users/1/name')).toBe(true);
    expect(diff?.unchanged.has('/users/1/age')).toBe(true);
  });

  it('returns all paths in the correct sets', () => {
    const doc1 = documentNode(
      objectNode(
        [
          propertyNode(stringNode('a', loc), numberNode(1, loc), loc),
          propertyNode(stringNode('b', loc), numberNode(2, loc), loc),
        ],
        loc
      ),
      loc
    );

    const doc2 = documentNode(
      objectNode(
        [
          propertyNode(stringNode('a', loc), numberNode(1, loc), loc),
          propertyNode(stringNode('c', loc), numberNode(3, loc), loc),
        ],
        loc
      ),
      loc
    );

    const diff = diffASTs(doc1, doc2);
    expect(diff).not.toBe(null);

    // Check that sets don't overlap
    const allPaths = [
      ...Array.from(diff!.added),
      ...Array.from(diff!.removed),
      ...Array.from(diff!.modified),
      ...Array.from(diff!.unchanged),
    ];

    // Each path appears exactly once
    const uniquePaths = new Set(allPaths);
    expect(allPaths.length).toBe(uniquePaths.size);
  });

  it('fast path: compares root hashes first', () => {
    // This is a behavioral test - identical documents should return null immediately
    const largeArray = arrayNode(
      Array.from({ length: 1000 }, (_, i) => numberNode(i, loc)),
      loc
    );
    const doc1 = documentNode(largeArray, loc);
    const doc2 = documentNode(largeArray, loc);

    const diff = diffASTs(doc1, doc2);
    expect(diff).toBe(null);
  });
});

describe('areIdentical', () => {
  it('returns true for identical documents', () => {
    const doc1 = documentNode(stringNode('hello', loc), loc);
    const doc2 = documentNode(stringNode('hello', loc), loc);

    expect(areIdentical(doc1, doc2)).toBe(true);
  });

  it('returns false for different documents', () => {
    const doc1 = documentNode(stringNode('hello', loc), loc);
    const doc2 = documentNode(stringNode('world', loc), loc);

    expect(areIdentical(doc1, doc2)).toBe(false);
  });

  it('returns true for complex identical structures', () => {
    const doc1 = documentNode(
      objectNode(
        [
          propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
          propertyNode(stringNode('age', loc), numberNode(30, loc), loc),
        ],
        loc
      ),
      loc
    );

    const doc2 = documentNode(
      objectNode(
        [
          propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
          propertyNode(stringNode('age', loc), numberNode(30, loc), loc),
        ],
        loc
      ),
      loc
    );

    expect(areIdentical(doc1, doc2)).toBe(true);
  });

  it('returns false for structures with different values', () => {
    const doc1 = documentNode(
      objectNode(
        [propertyNode(stringNode('age', loc), numberNode(30, loc), loc)],
        loc
      ),
      loc
    );

    const doc2 = documentNode(
      objectNode(
        [propertyNode(stringNode('age', loc), numberNode(31, loc), loc)],
        loc
      ),
      loc
    );

    expect(areIdentical(doc1, doc2)).toBe(false);
  });

  it('ignores position differences', () => {
    const loc1 = sourceLocation(position(1, 0, 0), position(1, 5, 5));
    const loc2 = sourceLocation(position(10, 20, 100), position(10, 25, 105));

    const doc1 = documentNode(stringNode('test', loc1), loc1);
    const doc2 = documentNode(stringNode('test', loc2), loc2);

    expect(areIdentical(doc1, doc2)).toBe(true);
  });

  it('returns true for empty objects', () => {
    const doc1 = documentNode(objectNode([], loc), loc);
    const doc2 = documentNode(objectNode([], loc), loc);

    expect(areIdentical(doc1, doc2)).toBe(true);
  });

  it('returns true for empty arrays', () => {
    const doc1 = documentNode(arrayNode([], loc), loc);
    const doc2 = documentNode(arrayNode([], loc), loc);

    expect(areIdentical(doc1, doc2)).toBe(true);
  });

  it('returns false for different types', () => {
    const doc1 = documentNode(stringNode('true', loc), loc);
    const doc2 = documentNode(booleanNode(true, loc), loc);

    expect(areIdentical(doc1, doc2)).toBe(false);
  });

  it('returns false for null vs other values', () => {
    const doc1 = documentNode(nullNode(loc), loc);
    const doc2 = documentNode(numberNode(0, loc), loc);

    expect(areIdentical(doc1, doc2)).toBe(false);
  });
});
