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
  getByPointer,
  hasPointer,
  parsePointer,
  compilePointer,
  parentPointer,
} from '../src/index.js';

const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1));

describe('getByPointer', () => {
  it('returns root with empty pointer', () => {
    const body = stringNode('hello', loc);
    const doc = documentNode(body, loc);

    const result = getByPointer(doc, '');
    expect(result).toBe(body);
  });

  it('gets property from object', () => {
    const nameValue = stringNode('Alice', loc);
    const obj = objectNode(
      [propertyNode(stringNode('name', loc), nameValue, loc)],
      loc
    );
    const doc = documentNode(obj, loc);

    const result = getByPointer(doc, '/name');
    expect(result).toBe(nameValue);
  });

  it('gets nested property', () => {
    const nameValue = stringNode('Alice', loc);
    const userObj = objectNode(
      [propertyNode(stringNode('name', loc), nameValue, loc)],
      loc
    );
    const root = objectNode(
      [propertyNode(stringNode('user', loc), userObj, loc)],
      loc
    );
    const doc = documentNode(root, loc);

    const result = getByPointer(doc, '/user/name');
    expect(result).toBe(nameValue);
  });

  it('gets array element by index', () => {
    const elem = numberNode(42, loc);
    const arr = arrayNode([numberNode(10, loc), elem, numberNode(30, loc)], loc);
    const doc = documentNode(arr, loc);

    const result = getByPointer(doc, '/1');
    expect(result).toBe(elem);
  });

  it('gets nested array element', () => {
    const target = stringNode('found', loc);
    const innerArr = arrayNode([stringNode('a', loc), target], loc);
    const outerArr = arrayNode([stringNode('x', loc), innerArr], loc);
    const doc = documentNode(outerArr, loc);

    const result = getByPointer(doc, '/1/1');
    expect(result).toBe(target);
  });

  it('returns undefined for non-existent property', () => {
    const obj = objectNode(
      [propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)],
      loc
    );
    const doc = documentNode(obj, loc);

    const result = getByPointer(doc, '/age');
    expect(result).toBeUndefined();
  });

  it('returns undefined for out of bounds array index', () => {
    const arr = arrayNode([numberNode(1, loc), numberNode(2, loc)], loc);
    const doc = documentNode(arr, loc);

    expect(getByPointer(doc, '/5')).toBeUndefined();
    expect(getByPointer(doc, '/-1')).toBeUndefined();
  });

  it('returns undefined for non-existent nested path', () => {
    const obj = objectNode(
      [propertyNode(stringNode('user', loc), stringNode('Alice', loc), loc)],
      loc
    );
    const doc = documentNode(obj, loc);

    // /user is a string, not an object
    const result = getByPointer(doc, '/user/name');
    expect(result).toBeUndefined();
  });

  it('handles escaped characters in keys', () => {
    const value = stringNode('test', loc);
    const obj = objectNode(
      [propertyNode(stringNode('a/b', loc), value, loc)],
      loc
    );
    const doc = documentNode(obj, loc);

    const result = getByPointer(doc, '/a~1b');
    expect(result).toBe(value);
  });

  it('handles tilde escaping', () => {
    const value = stringNode('test', loc);
    const obj = objectNode(
      [propertyNode(stringNode('a~b', loc), value, loc)],
      loc
    );
    const doc = documentNode(obj, loc);

    const result = getByPointer(doc, '/a~0b');
    expect(result).toBe(value);
  });

  it('handles complex nested structure', () => {
    // { "users": [{ "name": "Alice", "age": 30 }] }
    const ageValue = numberNode(30, loc);
    const user = objectNode(
      [
        propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc),
        propertyNode(stringNode('age', loc), ageValue, loc),
      ],
      loc
    );
    const users = arrayNode([user], loc);
    const root = objectNode(
      [propertyNode(stringNode('users', loc), users, loc)],
      loc
    );
    const doc = documentNode(root, loc);

    const result = getByPointer(doc, '/users/0/age');
    expect(result).toBe(ageValue);
  });

  it('returns undefined for invalid path through value node', () => {
    const doc = documentNode(stringNode('hello', loc), loc);

    const result = getByPointer(doc, '/invalid');
    expect(result).toBeUndefined();
  });
});

describe('hasPointer', () => {
  it('returns true for existing paths', () => {
    const obj = objectNode(
      [propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)],
      loc
    );
    const doc = documentNode(obj, loc);

    expect(hasPointer(doc, '')).toBe(true);
    expect(hasPointer(doc, '/name')).toBe(true);
  });

  it('returns false for non-existent paths', () => {
    const obj = objectNode(
      [propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)],
      loc
    );
    const doc = documentNode(obj, loc);

    expect(hasPointer(doc, '/age')).toBe(false);
    expect(hasPointer(doc, '/invalid/path')).toBe(false);
  });

  it('returns true for array indices', () => {
    const arr = arrayNode([numberNode(1, loc), numberNode(2, loc)], loc);
    const doc = documentNode(arr, loc);

    expect(hasPointer(doc, '/0')).toBe(true);
    expect(hasPointer(doc, '/1')).toBe(true);
  });

  it('returns false for out of bounds indices', () => {
    const arr = arrayNode([numberNode(1, loc)], loc);
    const doc = documentNode(arr, loc);

    expect(hasPointer(doc, '/5')).toBe(false);
  });
});

describe('parsePointer', () => {
  it('parses root pointer', () => {
    expect(parsePointer('')).toEqual([]);
  });

  it('parses single segment', () => {
    expect(parsePointer('/users')).toEqual(['users']);
  });

  it('parses multiple segments', () => {
    expect(parsePointer('/users/0/name')).toEqual(['users', '0', 'name']);
  });

  it('unescapes ~ characters', () => {
    expect(parsePointer('/a~0b')).toEqual(['a~b']);
  });

  it('unescapes / characters', () => {
    expect(parsePointer('/a~1b')).toEqual(['a/b']);
  });

  it('handles mixed escaping', () => {
    expect(parsePointer('/a~0b/c~1d')).toEqual(['a~b', 'c/d']);
  });

  it('returns array with string segments', () => {
    const result = parsePointer('/foo/bar');
    expect(result).toEqual(['foo', 'bar']);
    expect(typeof result[0]).toBe('string');
  });
});

describe('compilePointer', () => {
  it('compiles empty array to root pointer', () => {
    expect(compilePointer([])).toBe('');
  });

  it('compiles single segment', () => {
    expect(compilePointer(['users'])).toBe('/users');
  });

  it('compiles multiple segments', () => {
    expect(compilePointer(['users', '0', 'name'])).toBe('/users/0/name');
  });

  it('escapes ~ characters', () => {
    expect(compilePointer(['a~b'])).toBe('/a~0b');
  });

  it('escapes / characters', () => {
    expect(compilePointer(['a/b'])).toBe('/a~1b');
  });

  it('handles mixed escaping', () => {
    expect(compilePointer(['a~b', 'c/d'])).toBe('/a~0b/c~1d');
  });

  it('handles numeric segments', () => {
    expect(compilePointer(['users', 0, 'name'])).toBe('/users/0/name');
  });

  it('round-trips with parsePointer', () => {
    const original = '/users/0/name';
    const parsed = parsePointer(original);
    const compiled = compilePointer(parsed);
    expect(compiled).toBe(original);
  });

  it('round-trips with escaped characters', () => {
    const original = '/a~0b/c~1d';
    const parsed = parsePointer(original);
    const compiled = compilePointer(parsed);
    expect(compiled).toBe(original);
  });
});

describe('parentPointer', () => {
  it('returns null for root pointer', () => {
    expect(parentPointer('')).toBe(null);
  });

  it('returns root for single-level pointer', () => {
    expect(parentPointer('/users')).toBe('');
  });

  it('returns parent for multi-level pointer', () => {
    expect(parentPointer('/users/0/name')).toBe('/users/0');
  });

  it('handles array indices', () => {
    expect(parentPointer('/items/5')).toBe('/items');
  });

  it('works through multiple levels', () => {
    let ptr = '/a/b/c/d';
    expect(parentPointer(ptr)).toBe('/a/b/c');

    ptr = '/a/b/c';
    expect(parentPointer(ptr)).toBe('/a/b');

    ptr = '/a/b';
    expect(parentPointer(ptr)).toBe('/a');

    ptr = '/a';
    expect(parentPointer(ptr)).toBe('');

    ptr = '';
    expect(parentPointer(ptr)).toBe(null);
  });

  it('handles escaped characters', () => {
    expect(parentPointer('/a~0b/c~1d')).toBe('/a~0b');
  });
});

describe('JSON Pointer RFC 6901 compliance', () => {
  it('example from RFC 6901', () => {
    // RFC 6901 example document
    const doc = documentNode(
      objectNode(
        [
          propertyNode(stringNode('foo', loc), arrayNode([stringNode('bar', loc), stringNode('baz', loc)], loc), loc),
          propertyNode(stringNode('', loc), numberNode(0, loc), loc),
          propertyNode(stringNode('a/b', loc), numberNode(1, loc), loc),
          propertyNode(stringNode('c%d', loc), numberNode(2, loc), loc),
          propertyNode(stringNode('e^f', loc), numberNode(3, loc), loc),
          propertyNode(stringNode('g|h', loc), numberNode(4, loc), loc),
          propertyNode(stringNode('i\\j', loc), numberNode(5, loc), loc),
          propertyNode(stringNode('k"l', loc), numberNode(6, loc), loc),
          propertyNode(stringNode(' ', loc), numberNode(7, loc), loc),
          propertyNode(stringNode('m~n', loc), numberNode(8, loc), loc),
        ],
        loc
      ),
      loc
    );

    // "" - the whole document
    expect(getByPointer(doc, '')).toBe(doc.body);

    // "/foo" - ["bar", "baz"]
    const foo = getByPointer(doc, '/foo');
    expect(foo?.type).toBe('Array');

    // "/foo/0" - "bar"
    const bar = getByPointer(doc, '/foo/0');
    expect(bar?.type).toBe('String');
    if (bar?.type === 'String') {
      expect(bar.value).toBe('bar');
    }

    // "/" - 0 (empty string key)
    const emptyKey = getByPointer(doc, '/');
    expect(emptyKey?.type).toBe('Number');
    if (emptyKey?.type === 'Number') {
      expect(emptyKey.value).toBe(0);
    }

    // "/a~1b" - 1 (escaping /)
    const slashKey = getByPointer(doc, '/a~1b');
    expect(slashKey?.type).toBe('Number');
    if (slashKey?.type === 'Number') {
      expect(slashKey.value).toBe(1);
    }

    // "/m~0n" - 8 (escaping ~)
    const tildeKey = getByPointer(doc, '/m~0n');
    expect(tildeKey?.type).toBe('Number');
    if (tildeKey?.type === 'Number') {
      expect(tildeKey.value).toBe(8);
    }
  });
});
