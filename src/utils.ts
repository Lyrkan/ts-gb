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

/**
 * Check if a given bit is set on a number.
 *
 * @param bit Index of the bit to check
 * @param value Value to check
 */
export function checkBit(bit: number, value: number): boolean {
  const mask = 1 << bit;
  return (value & mask) === mask;
}

/**
 * Try to require an optional dependency or
 * throw an error explaining why that dependency
 * is required.
 *
 * @param dependency Dependency to require
 * @param requiredBy Module that requires the given
 */
export function requireOptional<T>(dependency: string, requiredBy: string): T {
  try {
    return require(dependency) as T;
  } catch (e) {
    throw new Error(`
    ${dependency} is required by ${requiredBy}
Please add it to your project using one of the following commands:

  $ npm add ${dependency}
  $ yarn add ${dependency}
  `);
  }
}
