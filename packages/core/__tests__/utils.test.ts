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
  toNative,
} from '../src/index.js';

const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1));

describe('toNative', () => {
  it('converts string node to string', () => {
    const node = stringNode('hello', loc);
    expect(toNative(node)).toBe('hello');
  });

  it('converts number node to number', () => {
    const node = numberNode(42, loc);
    expect(toNative(node)).toBe(42);
  });

  it('converts boolean node to boolean', () => {
    const trueNode = booleanNode(true, loc);
    const falseNode = booleanNode(false, loc);

    expect(toNative(trueNode)).toBe(true);
    expect(toNative(falseNode)).toBe(false);
  });

  it('converts null node to null', () => {
    const node = nullNode(loc);
    expect(toNative(node)).toBe(null);
  });

  it('converts empty object to {}', () => {
    const node = objectNode([], loc);
    expect(toNative(node)).toEqual({});
  });

  it('converts object with properties', () => {
    const nameProp = propertyNode(
      stringNode('name', loc),
      stringNode('Alice', loc),
      loc
    );
    const ageProp = propertyNode(
      stringNode('age', loc),
      numberNode(30, loc),
      loc
    );
    const obj = objectNode([nameProp, ageProp], loc);

    expect(toNative(obj)).toEqual({
      name: 'Alice',
      age: 30,
    });
  });

  it('converts empty array to []', () => {
    const node = arrayNode([], loc);
    expect(toNative(node)).toEqual([]);
  });

  it('converts array with elements', () => {
    const arr = arrayNode(
      [numberNode(1, loc), numberNode(2, loc), numberNode(3, loc)],
      loc
    );

    expect(toNative(arr)).toEqual([1, 2, 3]);
  });

  it('converts nested structures', () => {
    // { user: { name: "Alice", age: 30 }, scores: [95, 87] }
    const userObj = objectNode(
      [
        propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
        propertyNode(stringNode('age', loc), numberNode(30, loc), loc),
      ],
      loc
    );

    const scoresArr = arrayNode([numberNode(95, loc), numberNode(87, loc)], loc);

    const root = objectNode(
      [
        propertyNode(stringNode('user', loc), userObj, loc),
        propertyNode(stringNode('scores', loc), scoresArr, loc),
      ],
      loc
    );

    expect(toNative(root)).toEqual({
      user: {
        name: 'Alice',
        age: 30,
      },
      scores: [95, 87],
    });
  });

  it('converts mixed type array', () => {
    const arr = arrayNode(
      [
        stringNode('hello', loc),
        numberNode(42, loc),
        booleanNode(true, loc),
        nullNode(loc),
      ],
      loc
    );

    expect(toNative(arr)).toEqual(['hello', 42, true, null]);
  });

  it('loses position information', () => {
    const node = stringNode('test', loc);
    const native = toNative(node);

    // Should just be a string, no loc property
    expect(native).toBe('test');
    expect(typeof native).toBe('string');
  });
});
