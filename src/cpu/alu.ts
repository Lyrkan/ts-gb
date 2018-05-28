export const ALU = {
  incByte(value: number) {
    const maskedValue = (value + 1) & 0xFF;
    const halfCarry = ((value & 0xF) + 1) >> 4;

    return {
      value: maskedValue,
      Z: (maskedValue === 0) ? 1 : 0,
      N: 0,
      H: halfCarry,
    };
  },

  incWord(value: number) {
    return (value + 1) & 0xFFFF;
  },

  decByte(value: number) {
    const maskedValue = (value - 1) & 0xFF;
    const halfCarry = (((value & 0xF) - 1) >> 4) & 1;

    return {
      value: maskedValue,
      Z: (maskedValue === 0) ? 1 : 0,
      N: 1,
      H: halfCarry,
    };
  },

  decWord(value: number) {
    return (value - 1) & 0xFFFF;
  },

  addBytes(a: number, b: number) {
    const newValue = a + b;
    const maskedValue = newValue & 0xFFFF;
    const halfCarry = ((a & 0xF) + (b & 0xF)) >> 4;

    return {
      value: maskedValue,
      Z: (maskedValue === 0) ? 1 : 0,
      N: 0,
      H: halfCarry,
      C: (newValue !== maskedValue) ? 1 : 0,
    };
  },

  addWords(a: number, b: number) {
    const sum = a + b;
    const halfCarry = ((a & 0xFF) + (b & 0xFF)) >> 8;

    return {
      value: (sum & 0xFFFF),
      N: 0,
      H: halfCarry,
      C: (sum >> 16) & 1,
    };
  },

  sub(a: number, n: number) {
    const sub = a - n;
    const halfCarry = (((a & 0xF) - (n & 0xF)) >> 4) & 1;

    return {
      value: (sub & 0xFF),
      Z: (sub === 0) ? 1 : 0,
      N: 1,
      H: halfCarry,
      C: (sub >> 8) & 1,
    };
  },

  xor(a: number, n: number) {
    const res = a ^ n;

    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
      N: 0,
      H: 0,
      C: 0,
    };
  },

  or(a: number, n: number) {
    const res = a | n;

    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
      N: 0,
      H: 0,
      C: 0,
    };
  },

  and(a: number, n: number) {
    const res = a & n;

    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
      N: 0,
      H: 1,
      C: 0,
    };
  },
};
