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
  hashNode,
  computeIdentities,
  createIdentity,
} from '../src/index.js';

const loc = sourceLocation(position(1, 0, 0), position(1, 1, 1));
const loc2 = sourceLocation(position(2, 0, 10), position(2, 5, 15));

describe('hashNode', () => {
  it('generates deterministic hash for string nodes', () => {
    const node1 = stringNode('hello', loc);
    const node2 = stringNode('hello', loc2);

    const hash1 = hashNode(node1);
    const hash2 = hashNode(node2);

    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('string');
    expect(hash1.length).toBeGreaterThan(0);
  });

  it('generates different hashes for different values', () => {
    const node1 = stringNode('hello', loc);
    const node2 = stringNode('world', loc);

    expect(hashNode(node1)).not.toBe(hashNode(node2));
  });

  it('generates same hash regardless of position', () => {
    const node1 = stringNode('test', loc);
    const node2 = stringNode('test', loc2);

    expect(hashNode(node1)).toBe(hashNode(node2));
  });

  it('hashes number nodes', () => {
    const node1 = numberNode(42, loc);
    const node2 = numberNode(42, loc2);

    expect(hashNode(node1)).toBe(hashNode(node2));
  });

  it('distinguishes between different numbers', () => {
    const node1 = numberNode(42, loc);
    const node2 = numberNode(43, loc);

    expect(hashNode(node1)).not.toBe(hashNode(node2));
  });

  it('hashes boolean nodes', () => {
    const trueNode1 = booleanNode(true, loc);
    const trueNode2 = booleanNode(true, loc2);
    const falseNode = booleanNode(false, loc);

    expect(hashNode(trueNode1)).toBe(hashNode(trueNode2));
    expect(hashNode(trueNode1)).not.toBe(hashNode(falseNode));
  });

  it('hashes null nodes', () => {
    const node1 = nullNode(loc);
    const node2 = nullNode(loc2);

    expect(hashNode(node1)).toBe(hashNode(node2));
  });

  it('hashes empty objects consistently', () => {
    const obj1 = objectNode([], loc);
    const obj2 = objectNode([], loc2);

    expect(hashNode(obj1)).toBe(hashNode(obj2));
  });

  it('hashes objects with properties', () => {
    const obj1 = objectNode(
      [propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)],
      loc
    );
    const obj2 = objectNode(
      [propertyNode(stringNode('name', loc2), stringNode('Alice', loc2), loc2)],
      loc2
    );

    expect(hashNode(obj1)).toBe(hashNode(obj2));
  });

  it('distinguishes objects with different property values', () => {
    const obj1 = objectNode(
      [propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)],
      loc
    );
    const obj2 = objectNode(
      [propertyNode(stringNode('name', loc), stringNode('Bob', loc), loc)],
      loc
    );

    expect(hashNode(obj1)).not.toBe(hashNode(obj2));
  });

  it('distinguishes objects with different property keys', () => {
    const obj1 = objectNode(
      [propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)],
      loc
    );
    const obj2 = objectNode(
      [propertyNode(stringNode('username', loc), stringNode('Alice', loc), loc)],
      loc
    );

    expect(hashNode(obj1)).not.toBe(hashNode(obj2));
  });

  it('hashes empty arrays consistently', () => {
    const arr1 = arrayNode([], loc);
    const arr2 = arrayNode([], loc2);

    expect(hashNode(arr1)).toBe(hashNode(arr2));
  });

  it('hashes arrays with elements', () => {
    const arr1 = arrayNode([numberNode(1, loc), numberNode(2, loc)], loc);
    const arr2 = arrayNode([numberNode(1, loc2), numberNode(2, loc2)], loc2);

    expect(hashNode(arr1)).toBe(hashNode(arr2));
  });

  it('distinguishes arrays with different elements', () => {
    const arr1 = arrayNode([numberNode(1, loc), numberNode(2, loc)], loc);
    const arr2 = arrayNode([numberNode(1, loc), numberNode(3, loc)], loc);

    expect(hashNode(arr1)).not.toBe(hashNode(arr2));
  });

  it('distinguishes arrays with different order', () => {
    const arr1 = arrayNode([numberNode(1, loc), numberNode(2, loc)], loc);
    const arr2 = arrayNode([numberNode(2, loc), numberNode(1, loc)], loc);

    expect(hashNode(arr1)).not.toBe(hashNode(arr2));
  });

  it('hashes nested structures', () => {
    const nested1 = objectNode(
      [
        propertyNode(
          stringNode('user', loc),
          objectNode(
            [propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)],
            loc
          ),
          loc
        ),
      ],
      loc
    );
    const nested2 = objectNode(
      [
        propertyNode(
          stringNode('user', loc2),
          objectNode(
            [propertyNode(stringNode('name', loc2), stringNode('Alice', loc2), loc2)],
            loc2
          ),
          loc2
        ),
      ],
      loc2
    );

    expect(hashNode(nested1)).toBe(hashNode(nested2));
  });
});

describe('createIdentity', () => {
  it('creates identity for string node', () => {
    const node = stringNode('hello', loc);
    const identity = createIdentity(node, '/message');

    expect(identity.pointer).toBe('/message');
    expect(identity.contentHash).toBe(hashNode(node));
    expect(identity.id).toBe(`/message@${hashNode(node)}`);
  });

  it('creates identity for root node with empty pointer', () => {
    const node = objectNode([], loc);
    const identity = createIdentity(node, '');

    expect(identity.pointer).toBe('');
    expect(identity.contentHash).toBe(hashNode(node));
    expect(identity.id).toBe(`@${hashNode(node)}`);
  });

  it('creates identity for nested path', () => {
    const node = numberNode(42, loc);
    const identity = createIdentity(node, '/user/age');

    expect(identity.pointer).toBe('/user/age');
    expect(identity.contentHash).toBe(hashNode(node));
    expect(identity.id).toMatch(/^\/user\/age@[a-f0-9]+$/);
  });
});

describe('computeIdentities', () => {
  it('computes identity for document with string body', () => {
    const body = stringNode('hello', loc);
    const doc = documentNode(body, loc);

    const identities = computeIdentities(doc);

    const bodyIdentity = identities.get(body);
    expect(bodyIdentity).toBeDefined();
    expect(bodyIdentity?.pointer).toBe('');
    expect(bodyIdentity?.contentHash).toBe(hashNode(body));
  });

  it('computes identities for object properties', () => {
    const nameValue = stringNode('Alice', loc);
    const ageValue = numberNode(30, loc);
    const obj = objectNode(
      [
        propertyNode(stringNode('name', loc), nameValue, loc),
        propertyNode(stringNode('age', loc), ageValue, loc),
      ],
      loc
    );
    const doc = documentNode(obj, loc);

    const identities = computeIdentities(doc);

    const objIdentity = identities.get(obj);
    expect(objIdentity?.pointer).toBe('');

    const nameIdentity = identities.get(nameValue);
    expect(nameIdentity?.pointer).toBe('/name');

    const ageIdentity = identities.get(ageValue);
    expect(ageIdentity?.pointer).toBe('/age');
  });

  it('computes identities for array elements', () => {
    const elem0 = numberNode(10, loc);
    const elem1 = numberNode(20, loc);
    const elem2 = numberNode(30, loc);
    const arr = arrayNode([elem0, elem1, elem2], loc);
    const doc = documentNode(arr, loc);

    const identities = computeIdentities(doc);

    const arrIdentity = identities.get(arr);
    expect(arrIdentity?.pointer).toBe('');

    const id0 = identities.get(elem0);
    expect(id0?.pointer).toBe('/0');

    const id1 = identities.get(elem1);
    expect(id1?.pointer).toBe('/1');

    const id2 = identities.get(elem2);
    expect(id2?.pointer).toBe('/2');
  });

  it('computes identities for nested structures', () => {
    const nameValue = stringNode('Alice', loc);
    const userObj = objectNode(
      [propertyNode(stringNode('name', loc), nameValue, loc)],
      loc
    );
    const score0 = numberNode(95, loc);
    const score1 = numberNode(87, loc);
    const scoresArr = arrayNode([score0, score1], loc);

    const root = objectNode(
      [
        propertyNode(stringNode('user', loc), userObj, loc),
        propertyNode(stringNode('scores', loc), scoresArr, loc),
      ],
      loc
    );
    const doc = documentNode(root, loc);

    const identities = computeIdentities(doc);

    expect(identities.get(root)?.pointer).toBe('');
    expect(identities.get(userObj)?.pointer).toBe('/user');
    expect(identities.get(nameValue)?.pointer).toBe('/user/name');
    expect(identities.get(scoresArr)?.pointer).toBe('/scores');
    expect(identities.get(score0)?.pointer).toBe('/scores/0');
    expect(identities.get(score1)?.pointer).toBe('/scores/1');
  });

  it('escapes special characters in object keys', () => {
    // RFC 6901: ~ becomes ~0, / becomes ~1
    const value = stringNode('test', loc);
    const obj = objectNode(
      [propertyNode(stringNode('a/b', loc), value, loc)],
      loc
    );
    const doc = documentNode(obj, loc);

    const identities = computeIdentities(doc);

    const valueIdentity = identities.get(value);
    expect(valueIdentity?.pointer).toBe('/a~1b');
  });

  it('handles tilde escaping', () => {
    const value = stringNode('test', loc);
    const obj = objectNode(
      [propertyNode(stringNode('a~b', loc), value, loc)],
      loc
    );
    const doc = documentNode(obj, loc);

    const identities = computeIdentities(doc);

    const valueIdentity = identities.get(value);
    expect(valueIdentity?.pointer).toBe('/a~0b');
  });

  it('generates stable hashes across re-computation', () => {
    const obj = objectNode(
      [propertyNode(stringNode('name', loc), stringNode('Alice', loc), loc)],
      loc
    );
    const doc = documentNode(obj, loc);

    const identities1 = computeIdentities(doc);
    const identities2 = computeIdentities(doc);

    const hash1 = identities1.get(obj)?.contentHash;
    const hash2 = identities2.get(obj)?.contentHash;

    expect(hash1).toBe(hash2);
  });

  it('uses WeakMap for O(1) lookup', () => {
    const value = stringNode('test', loc);
    const doc = documentNode(value, loc);

    const identities = computeIdentities(doc);

    // WeakMap allows fast lookup by node reference
    expect(identities.get(value)).toBeDefined();
    expect(identities.get(value)?.pointer).toBe('');
  });

  it('handles complex nested structures', () => {
    // {
    //   "users": [
    //     { "name": "Alice", "active": true },
    //     { "name": "Bob", "active": false }
    //   ]
    // }
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
    const users = arrayNode([alice, bob], loc);
    const root = objectNode(
      [propertyNode(stringNode('users', loc), users, loc)],
      loc
    );
    const doc = documentNode(root, loc);

    const identities = computeIdentities(doc);

    expect(identities.get(alice)?.pointer).toBe('/users/0');
    expect(identities.get(bob)?.pointer).toBe('/users/1');
  });
});
