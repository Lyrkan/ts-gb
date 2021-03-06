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
    return {
      value: (value + 1) & 0xFFFF
    };
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
    return {
      value: (value - 1) & 0xFFFF
    };
  },

  addBytes(a: number, b: number) {
    const newValue = a + b;
    const maskedValue = newValue & 0xFF;
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
    const halfCarry = ((a & 0xFFF) + (b & 0xFFF)) >> 12;

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

  adc(a: number, b: number, carry: number) {
    const sum = a + b + carry;
    const maskedValue = sum & 0xFF;
    const halfCarry = ((a & 0xF) + (b & 0xF) + carry) >> 4;

    return {
      value: maskedValue,
      Z: (maskedValue === 0) ? 1 : 0,
      N: 0,
      H: halfCarry,
      C: (sum !== maskedValue) ? 1 : 0,
    };
  },

  sbc(a: number, b: number, carry: number) {
    const sub = a - b - carry;
    const maskedSub = sub & 0xFF;
    const halfCarry = (((a & 0xF) - (b & 0xF) - carry) >> 4) & 1;

    return {
      value: maskedSub,
      Z: (maskedSub === 0) ? 1 : 0,
      N: 1,
      H: halfCarry,
      C: (sub >> 8) & 1,
    };
  },

  daa(a: number, n: number, h: number, c: number) {
    let res = a;
    let correction = 0;

    if (h === 1) {
      correction |= 0x06;
    }

    if (c === 1) {
      correction |= 0x60;
    }

    if (n === 0) {
      if ((res & 0x0F) > 0x09) {
        correction |= 0x06;
      }

      if (res > 0x99) {
        correction |= 0x60;
      }

      res = res + correction;
    } else {
      res = res - correction;
    }

    return {
      value: res & 0xFF,
      Z: ((res & 0xFF) === 0) ? 1 : 0,
      H: 0,
      C: ((correction & 0x60) !== 0) ? 1 : 0,
    };
  },

  rlc(a: number) {
    const carry = a >> 7;
    const res = ((a << 1) | carry) & 0xFF;
    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
      N: 0,
      H: 0,
      C: carry,
    };
  },

  rrc(a: number) {
    const carry = a & 1;
    const res = (a >> 1) | (carry << 7);
    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
      N: 0,
      H: 0,
      C: carry,
    };
  },

  rl(a: number, c: number) {
    const res = ((a << 1) | (c & 1)) & 0xFF;
    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
      N: 0,
      H: 0,
      C: a >> 7,
    };
  },

  rr(a: number, c: number) {
    const res = ((a >> 1) | ((c & 1) << 7)) & 0xFF;
    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
      N: 0,
      H: 0,
      C: a & 1,
    };
  },

  sla(a: number) {
    const res = (a << 1) & 0xFF;
    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
      N: 0,
      H: 0,
      C: a >> 7,
    };
  },

  srl(a: number) {
    const res = (a >> 1) & 0xFF;
    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
      N: 0,
      H: 0,
      C: a & 1,
    };
  },

  sra(a: number) {
    const res = ((a >> 1) | (a & 0x80)) & 0xFF;
    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
      N: 0,
      H: 0,
      C: a & 1,
    };
  },

  swap(a: number) {
    const res = ((a & 0xF) << 4) | (a >> 4);
    return {
      value: res,
      Z: (res === 0) ? 1 : 0,
    };
  },

  bit(bit: number, a: number) {
    return {
      Z: (~a >> bit) & 1,
      N: 0,
      H: 1,
    };
  },

  res(bit: number, a: number) {
    return {
      value: a & ~(1 << bit)
    };
  },

  set(bit: number, a: number) {
    return {
      value: a | (1 << bit)
    };
  },
};
