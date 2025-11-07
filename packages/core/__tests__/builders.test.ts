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
} from '../src/index.js';

describe('position', () => {
  it('creates a position with line, column, and offset', () => {
    const pos = position(1, 0, 0);
    expect(pos).toEqual({ line: 1, column: 0, offset: 0 });
  });
});

describe('sourceLocation', () => {
  it('creates a source location with start and end', () => {
    const start = position(1, 0, 0);
    const end = position(1, 5, 5);
    const loc = sourceLocation(start, end);

    expect(loc).toEqual({ start, end });
    expect(loc.source).toBeUndefined();
  });

  it('creates a source location with source format', () => {
    const start = position(1, 0, 0);
    const end = position(1, 5, 5);
    const loc = sourceLocation(start, end, 'json');

    expect(loc).toEqual({ start, end, source: 'json' });
  });
});

describe('stringNode', () => {
  it('creates a string node', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 7, 7), 'json');
    const node = stringNode('hello', loc);

    expect(node.type).toBe('String');
    expect(node.value).toBe('hello');
    expect(node.loc).toEqual(loc);
    expect(node.raw).toBeUndefined();
  });

  it('creates a string node with raw representation', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 7, 7), 'json');
    const node = stringNode('hello', loc, '"hello"');

    expect(node.type).toBe('String');
    expect(node.value).toBe('hello');
    expect(node.raw).toBe('"hello"');
  });
});

describe('numberNode', () => {
  it('creates a number node', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 3, 3), 'json');
    const node = numberNode(42, loc);

    expect(node.type).toBe('Number');
    expect(node.value).toBe(42);
    expect(node.loc).toEqual(loc);
    expect(node.raw).toBeUndefined();
  });

  it('creates a number node with raw representation', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 3, 3), 'json');
    const node = numberNode(1.5, loc, '1.50');

    expect(node.type).toBe('Number');
    expect(node.value).toBe(1.5);
    expect(node.raw).toBe('1.50');
  });
});

describe('booleanNode', () => {
  it('creates a boolean node with true', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 4, 4), 'json');
    const node = booleanNode(true, loc);

    expect(node.type).toBe('Boolean');
    expect(node.value).toBe(true);
    expect(node.loc).toEqual(loc);
  });

  it('creates a boolean node with false', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 5, 5), 'json');
    const node = booleanNode(false, loc);

    expect(node.type).toBe('Boolean');
    expect(node.value).toBe(false);
  });
});

describe('nullNode', () => {
  it('creates a null node', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 4, 4), 'json');
    const node = nullNode(loc);

    expect(node.type).toBe('Null');
    expect(node.value).toBe(null);
    expect(node.loc).toEqual(loc);
  });
});

describe('propertyNode', () => {
  it('creates a property node', () => {
    const keyLoc = sourceLocation(position(1, 1, 1), position(1, 6, 6), 'json');
    const valueLoc = sourceLocation(position(1, 9, 9), position(1, 14, 14), 'json');
    const propLoc = sourceLocation(position(1, 1, 1), position(1, 14, 14), 'json');

    const key = stringNode('name', keyLoc);
    const value = stringNode('Alice', valueLoc);
    const prop = propertyNode(key, value, propLoc);

    expect(prop.type).toBe('Property');
    expect(prop.key).toEqual(key);
    expect(prop.value).toEqual(value);
    expect(prop.loc).toEqual(propLoc);
  });
});

describe('objectNode', () => {
  it('creates an empty object node', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 2, 2), 'json');
    const node = objectNode([], loc);

    expect(node.type).toBe('Object');
    expect(node.properties).toEqual([]);
    expect(node.loc).toEqual(loc);
  });

  it('creates an object node with properties', () => {
    const keyLoc = sourceLocation(position(1, 1, 1), position(1, 6, 6), 'json');
    const valueLoc = sourceLocation(position(1, 9, 9), position(1, 14, 14), 'json');
    const propLoc = sourceLocation(position(1, 1, 1), position(1, 14, 14), 'json');
    const objLoc = sourceLocation(position(1, 0, 0), position(1, 15, 15), 'json');

    const key = stringNode('name', keyLoc);
    const value = stringNode('Alice', valueLoc);
    const prop = propertyNode(key, value, propLoc);
    const node = objectNode([prop], objLoc);

    expect(node.type).toBe('Object');
    expect(node.properties).toHaveLength(1);
    expect(node.properties[0]).toEqual(prop);
  });
});

describe('arrayNode', () => {
  it('creates an empty array node', () => {
    const loc = sourceLocation(position(1, 0, 0), position(1, 2, 2), 'json');
    const node = arrayNode([], loc);

    expect(node.type).toBe('Array');
    expect(node.elements).toEqual([]);
    expect(node.loc).toEqual(loc);
  });

  it('creates an array node with elements', () => {
    const elemLoc1 = sourceLocation(position(1, 1, 1), position(1, 2, 2), 'json');
    const elemLoc2 = sourceLocation(position(1, 4, 4), position(1, 5, 5), 'json');
    const arrLoc = sourceLocation(position(1, 0, 0), position(1, 6, 6), 'json');

    const elem1 = numberNode(1, elemLoc1);
    const elem2 = numberNode(2, elemLoc2);
    const node = arrayNode([elem1, elem2], arrLoc);

    expect(node.type).toBe('Array');
    expect(node.elements).toHaveLength(2);
    expect(node.elements[0]).toEqual(elem1);
    expect(node.elements[1]).toEqual(elem2);
  });
});

describe('documentNode', () => {
  it('creates a document node with string body', () => {
    const strLoc = sourceLocation(position(1, 0, 0), position(1, 7, 7), 'json');
    const docLoc = sourceLocation(position(1, 0, 0), position(1, 7, 7), 'json');

    const body = stringNode('hello', strLoc);
    const doc = documentNode(body, docLoc);

    expect(doc.type).toBe('Document');
    expect(doc.body).toEqual(body);
    expect(doc.loc).toEqual(docLoc);
  });

  it('creates a document node with object body', () => {
    const objLoc = sourceLocation(position(1, 0, 0), position(1, 2, 2), 'json');
    const docLoc = sourceLocation(position(1, 0, 0), position(1, 2, 2), 'json');

    const body = objectNode([], objLoc);
    const doc = documentNode(body, docLoc);

    expect(doc.type).toBe('Document');
    expect(doc.body).toEqual(body);
  });
});
