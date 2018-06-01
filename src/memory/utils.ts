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
    for (let i = 0; i < prop.length; i++) {
      const charCode = prop.charCodeAt(i);
      // Allow negative integers
      if ((charCode === 45) && (i === 0)) {
        continue;
      }

      if ((charCode > 47) && (charCode < 58)) {
        continue;
      }

      return false;
    }

    return true;
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
  const maskedValue = (value & 0xFF);
  const sign = (maskedValue >> 7) & 1;
  return sign ? -(~maskedValue & 127) - 1 : (maskedValue & 127);
}
