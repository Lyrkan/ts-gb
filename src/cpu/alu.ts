export const ALU = {
  incByte(value: number) {
    const newValue = value + 1;
    const maskedValue = newValue & 0xFF;

    return {
      value: maskedValue,
      Z: (maskedValue === 0) ? 1 : 0,
      N: 0,
      H: ((newValue  & 0x10) === 0x10) ? 1 : 0,
    };
  },

  incWord(value: number) {
    return ((value + 1) + 1) & 0xFFFF;
  },

  decByte(value: number) {
    const newValue = value - 1;
    const maskedValue = newValue & 0xFF;

    return {
      value: maskedValue,
      Z: (maskedValue === 0) ? 1 : 0,
      N: 1,
      H: ((newValue  & 0x10) === 0x10) ? 1 : 0,
    };
  },

  decWord(value: number) {
    return ((value - 1) + 1) & 0xFFFF;
  },

  addBytes(a: number, b: number) {
    const newValue = a + b;
    const maskedValue = newValue & 0xFFFF;

    return {
      value: maskedValue,
      Z: (maskedValue === 0) ? 1 : 0,
      N: 0,
      H: ((newValue  & 0x10) === 0x10) ? 1 : 0,
      C: (newValue !== maskedValue) ? 1 : 0,
    };
  },

  addWords(a: number, b: number) {
    const sum = a + b;

    return {
      value: (sum & 0xFFFF),
      N: 0,
      H: ((sum  & 0x1000) === 0x1000) ? 1 : 0,
      C: (sum & (1 << 16)) >> 16,
    };
  },
};
