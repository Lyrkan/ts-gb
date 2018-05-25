/**
 * Check if the given property key is an integer or
 * a string that contains an integer.
 *
 * @param prop Property key
 */
export function isIntegerPropertyKey(prop: PropertyKey): boolean {
  if (typeof prop === 'number') {
    return Number.isInteger(prop);
  }

  if (typeof prop === 'string') {
    return /^-?\d+$/.test(prop);
  }

  return false;
}
