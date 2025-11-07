import { describe, it, expect, vi } from 'vitest';
import {
  position,
  sourceLocation,
  stringNode,
  numberNode,
  propertyNode,
  objectNode,
  arrayNode,
  documentNode,
  visit,
  traverse,
  findAll,
  findFirst,
  getChildren,
  type Visitor,
} from '../src/index.js';

const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1));

describe('visit', () => {
  it('calls visitor with the node', () => {
    const node = stringNode('test', loc);
    const mockVisit = vi.fn();
    const visitor: Visitor = { visit: mockVisit };

    visit(node, visitor);

    expect(mockVisit).toHaveBeenCalledWith(node);
    expect(mockVisit).toHaveBeenCalledTimes(1);
  });

  it('returns the visitor result', () => {
    const node = stringNode('test', loc);
    const visitor: Visitor<string> = {
      visit: (n) => `visited ${n.type}`,
    };

    const result = visit(node, visitor);

    expect(result).toBe('visited String');
  });
});

describe('traverse', () => {
  it('visits a single value node', () => {
    const node = stringNode('test', loc);
    const mockVisit = vi.fn();

    traverse(node, { visit: mockVisit });

    expect(mockVisit).toHaveBeenCalledWith(node);
    expect(mockVisit).toHaveBeenCalledTimes(1);
  });

  it('visits document and its body', () => {
    const body = stringNode('test', loc);
    const doc = documentNode(body, loc);
    const mockVisit = vi.fn();

    traverse(doc, { visit: mockVisit });

    expect(mockVisit).toHaveBeenCalledTimes(2);
    expect(mockVisit).toHaveBeenNthCalledWith(1, doc);
    expect(mockVisit).toHaveBeenNthCalledWith(2, body);
  });

  it('visits array and its elements', () => {
    const elem1 = numberNode(1, loc);
    const elem2 = numberNode(2, loc);
    const arr = arrayNode([elem1, elem2], loc);
    const mockVisit = vi.fn();

    traverse(arr, { visit: mockVisit });

    expect(mockVisit).toHaveBeenCalledTimes(3);
    expect(mockVisit).toHaveBeenNthCalledWith(1, arr);
    expect(mockVisit).toHaveBeenNthCalledWith(2, elem1);
    expect(mockVisit).toHaveBeenNthCalledWith(3, elem2);
  });

  it('visits object and its properties', () => {
    const key = stringNode('name', loc);
    const value = stringNode('Alice', loc);
    const prop = propertyNode(key, value, loc);
    const obj = objectNode([prop], loc);
    const mockVisit = vi.fn();

    traverse(obj, { visit: mockVisit });

    expect(mockVisit).toHaveBeenCalledTimes(4);
    expect(mockVisit).toHaveBeenNthCalledWith(1, obj);
    expect(mockVisit).toHaveBeenNthCalledWith(2, prop);
    expect(mockVisit).toHaveBeenNthCalledWith(3, key);
    expect(mockVisit).toHaveBeenNthCalledWith(4, value);
  });

  it('visits nested structures', () => {
    // { items: [1, 2] }
    const key = stringNode('items', loc);
    const elem1 = numberNode(1, loc);
    const elem2 = numberNode(2, loc);
    const arr = arrayNode([elem1, elem2], loc);
    const prop = propertyNode(key, arr, loc);
    const obj = objectNode([prop], loc);
    const mockVisit = vi.fn();

    traverse(obj, { visit: mockVisit });

    expect(mockVisit).toHaveBeenCalledTimes(6);
    expect(mockVisit).toHaveBeenNthCalledWith(1, obj);
    expect(mockVisit).toHaveBeenNthCalledWith(2, prop);
    expect(mockVisit).toHaveBeenNthCalledWith(3, key);
    expect(mockVisit).toHaveBeenNthCalledWith(4, arr);
    expect(mockVisit).toHaveBeenNthCalledWith(5, elem1);
    expect(mockVisit).toHaveBeenNthCalledWith(6, elem2);
  });
});

describe('getChildren', () => {
  it('returns empty array for value nodes', () => {
    expect(getChildren(stringNode('test', loc))).toEqual([]);
    expect(getChildren(numberNode(42, loc))).toEqual([]);
  });

  it('returns body for document node', () => {
    const body = stringNode('test', loc);
    const doc = documentNode(body, loc);

    expect(getChildren(doc)).toEqual([body]);
  });

  it('returns elements for array node', () => {
    const elem1 = numberNode(1, loc);
    const elem2 = numberNode(2, loc);
    const arr = arrayNode([elem1, elem2], loc);

    expect(getChildren(arr)).toEqual([elem1, elem2]);
  });

  it('returns properties for object node', () => {
    const key = stringNode('name', loc);
    const value = stringNode('Alice', loc);
    const prop = propertyNode(key, value, loc);
    const obj = objectNode([prop], loc);

    expect(getChildren(obj)).toEqual([prop]);
  });

  it('returns key and value for property node', () => {
    const key = stringNode('name', loc);
    const value = stringNode('Alice', loc);
    const prop = propertyNode(key, value, loc);

    expect(getChildren(prop)).toEqual([key, value]);
  });
});

describe('findAll', () => {
  it('finds all nodes matching predicate', () => {
    // { name: "Alice", age: 30 }
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

    const strings = findAll(obj, (n) => n.type === 'String');

    expect(strings).toHaveLength(3); // "name", "Alice", "age"
    expect(strings.every((n) => n.type === 'String')).toBe(true);
  });

  it('finds all number nodes', () => {
    // [1, 2, 3]
    const arr = arrayNode(
      [numberNode(1, loc), numberNode(2, loc), numberNode(3, loc)],
      loc
    );

    const numbers = findAll(arr, (n) => n.type === 'Number');

    expect(numbers).toHaveLength(3);
  });

  it('returns empty array when no matches', () => {
    const node = stringNode('test', loc);
    const result = findAll(node, (n) => n.type === 'Number');

    expect(result).toEqual([]);
  });
});

describe('findFirst', () => {
  it('finds first matching node', () => {
    // [1, "hello", 2]
    const arr = arrayNode(
      [numberNode(1, loc), stringNode('hello', loc), numberNode(2, loc)],
      loc
    );

    const firstString = findFirst(arr, (n) => n.type === 'String');

    expect(firstString?.type).toBe('String');
    expect((firstString as any).value).toBe('hello');
  });

  it('returns the node itself if it matches', () => {
    const node = stringNode('test', loc);
    const result = findFirst(node, (n) => n.type === 'String');

    expect(result).toBe(node);
  });

  it('returns undefined when no match', () => {
    const node = stringNode('test', loc);
    const result = findFirst(node, (n) => n.type === 'Number');

    expect(result).toBeUndefined();
  });

  it('stops at first match (does not search exhaustively)', () => {
    // [1, "first", "second"]
    const arr = arrayNode(
      [numberNode(1, loc), stringNode('first', loc), stringNode('second', loc)],
      loc
    );

    const firstString = findFirst(arr, (n) => n.type === 'String');

    expect((firstString as any).value).toBe('first');
  });
});
