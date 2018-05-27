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

/**
 * Convert an unsigned 8 bits integer to a
 * signed one.
 *
 * @param value Unsigned 8 bits integer
 */
export function uint8ToInt8(value: number): number {
  const sign = (value >> 7) & 1;
  return sign ? -(~value & 127) - 1 : (value & 127);
}
