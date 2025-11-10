/**
 * Deep equality comparison for JSON values
 *
 * Compares two values recursively, handling objects, arrays, and primitives
 *
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  // Same reference or both NaN
  if (Object.is(a, b)) {
    return true;
  }

  // Type check
  if (typeof a !== typeof b) {
    return false;
  }

  // Null check
  if (a === null || b === null) {
    return a === b;
  }

  // Array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((val, index) => deepEqual(val, b[index]));
  }

  // Object comparison
  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    return aKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(b, key) &&
        deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    );
  }

  // Primitive comparison (already handled by Object.is above, but just in case)
  return a === b;
}
