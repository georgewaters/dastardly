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
  isValueNode,
  isContainerNode,
  isObjectNode,
  isArrayNode,
  isStringNode,
  isNumberNode,
  isBooleanNode,
  isNullNode,
  isDocumentNode,
  isPropertyNode,
} from '../src/index.js';

const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1));

describe('isValueNode', () => {
  it('returns true for string nodes', () => {
    const node = stringNode('test', loc);
    expect(isValueNode(node)).toBe(true);
  });

  it('returns true for number nodes', () => {
    const node = numberNode(42, loc);
    expect(isValueNode(node)).toBe(true);
  });

  it('returns true for boolean nodes', () => {
    const node = booleanNode(true, loc);
    expect(isValueNode(node)).toBe(true);
  });

  it('returns true for null nodes', () => {
    const node = nullNode(loc);
    expect(isValueNode(node)).toBe(true);
  });

  it('returns false for object nodes', () => {
    const node = objectNode([], loc);
    expect(isValueNode(node)).toBe(false);
  });

  it('returns false for array nodes', () => {
    const node = arrayNode([], loc);
    expect(isValueNode(node)).toBe(false);
  });
});

describe('isContainerNode', () => {
  it('returns true for object nodes', () => {
    const node = objectNode([], loc);
    expect(isContainerNode(node)).toBe(true);
  });

  it('returns true for array nodes', () => {
    const node = arrayNode([], loc);
    expect(isContainerNode(node)).toBe(true);
  });

  it('returns false for value nodes', () => {
    const node = stringNode('test', loc);
    expect(isContainerNode(node)).toBe(false);
  });
});

describe('isObjectNode', () => {
  it('returns true for object nodes', () => {
    const node = objectNode([], loc);
    expect(isObjectNode(node)).toBe(true);
  });

  it('returns false for other node types', () => {
    expect(isObjectNode(arrayNode([], loc))).toBe(false);
    expect(isObjectNode(stringNode('test', loc))).toBe(false);
  });
});

describe('isArrayNode', () => {
  it('returns true for array nodes', () => {
    const node = arrayNode([], loc);
    expect(isArrayNode(node)).toBe(true);
  });

  it('returns false for other node types', () => {
    expect(isArrayNode(objectNode([], loc))).toBe(false);
    expect(isArrayNode(stringNode('test', loc))).toBe(false);
  });
});

describe('isStringNode', () => {
  it('returns true for string nodes', () => {
    const node = stringNode('test', loc);
    expect(isStringNode(node)).toBe(true);
  });

  it('returns false for other node types', () => {
    expect(isStringNode(numberNode(42, loc))).toBe(false);
    expect(isStringNode(objectNode([], loc))).toBe(false);
  });
});

describe('isNumberNode', () => {
  it('returns true for number nodes', () => {
    const node = numberNode(42, loc);
    expect(isNumberNode(node)).toBe(true);
  });

  it('returns false for other node types', () => {
    expect(isNumberNode(stringNode('test', loc))).toBe(false);
    expect(isNumberNode(objectNode([], loc))).toBe(false);
  });
});

describe('isBooleanNode', () => {
  it('returns true for boolean nodes', () => {
    const node = booleanNode(true, loc);
    expect(isBooleanNode(node)).toBe(true);
  });

  it('returns false for other node types', () => {
    expect(isBooleanNode(stringNode('test', loc))).toBe(false);
    expect(isBooleanNode(objectNode([], loc))).toBe(false);
  });
});

describe('isNullNode', () => {
  it('returns true for null nodes', () => {
    const node = nullNode(loc);
    expect(isNullNode(node)).toBe(true);
  });

  it('returns false for other node types', () => {
    expect(isNullNode(stringNode('test', loc))).toBe(false);
    expect(isNullNode(objectNode([], loc))).toBe(false);
  });
});

describe('isDocumentNode', () => {
  it('returns true for document nodes', () => {
    const body = stringNode('test', loc);
    const node = documentNode(body, loc);
    expect(isDocumentNode(node)).toBe(true);
  });

  it('returns false for other node types', () => {
    expect(isDocumentNode(stringNode('test', loc))).toBe(false);
    expect(isDocumentNode(objectNode([], loc))).toBe(false);
  });
});

describe('isPropertyNode', () => {
  it('returns true for property nodes', () => {
    const key = stringNode('key', loc);
    const value = stringNode('value', loc);
    const node = propertyNode(key, value, loc);
    expect(isPropertyNode(node)).toBe(true);
  });

  it('returns false for other node types', () => {
    expect(isPropertyNode(stringNode('test', loc))).toBe(false);
    expect(isPropertyNode(objectNode([], loc))).toBe(false);
  });
});
