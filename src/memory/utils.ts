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
