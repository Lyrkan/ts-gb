/**
 * Usage:
 *
 *   const registers = new CpuRegisters();
 *
 *   // Accessing registers
 *   registers.A = 0xFF;
 *   registers.F = 0xF0;
 *   registers.BC = 0x1234;
 *
 *   // Accessing flags (stored into register F)
 *   registers.flags.Z = 1;
 *   registers.flags.N = 1;
 *   registers.flags.H = 0;
 *   registers.flags.C = 0;
 */
export class CPURegisters {
  private registers: {
    A: number; F: number;
    B: number; C: number;
    D: number; E: number;
    H: number; L: number;
    SP: number; PC: number;
  };

  private flagsAccessor: {
    Z: number;
    N: number;
    H: number;
    C: number;
  };

  public constructor() {
    const registers = {
      A: 0, F: 0,
      B: 0, C: 0,
      D: 0, E: 0,
      H: 0, L: 0,
      SP: 0, PC: 0,
    };

    this.registers = registers;

    this.flagsAccessor = {
      get Z() {
        return (registers.F >> 7) & 1;
      },

      set Z(value: number) {
        registers.F = (registers.F & 0x7F) | ((value & 1) << 7);
      },

      get N() {
        return (registers.F >> 6) & 1;
      },

      set N(value: number) {
        registers.F = (registers.F & 0xBF) | ((value & 1) << 6);
      },

      get H() {
        return (registers.F >> 5) & 1;
      },

      set H(value: number) {
        registers.F = (registers.F & 0xDF) | ((value & 1) << 5);
      },

      get C() {
        return (registers.F >> 4) & 1;
      },

      set C(value: number) {
        registers.F = (registers.F & 0xEF) | ((value & 1) << 4);
      }
    };
  }

  public get A(): number {
    return this.registers.A;
  }

  public set A(value: number) {
    this.registers.A = value & 0xFF;
  }

  public get F(): number {
    return this.registers.F;
  }

  public set F(value: number) {
    // The 4 least significant bits are always
    // equal to 0 for the flag register
    this.registers.F = value & 0xF0;
  }

  public get AF(): number {
    return (this.registers.A << 8) | this.registers.F;
  }

  public set AF(value: number) {
    // The 4 least significant bits are always
    // equal to 0 for the flag register
    this.registers.A = (value >> 8) & 0xFF;
    this.registers.F = value & 0xF0;
  }

  public get B(): number {
    return this.registers.B;
  }

  public set B(value: number) {
    this.registers.B = value & 0xFF;
  }

  public get C(): number {
    return this.registers.C;
  }

  public set C(value: number) {
    this.registers.C = value & 0xFF;
  }

  public get BC(): number {
    return (this.registers.B << 8) | this.registers.C;
  }

  public set BC(value: number) {
    this.registers.B = (value >> 8) & 0xFF;
    this.registers.C = value & 0xFF;
  }

  public get D(): number {
    return this.registers.D;
  }

  public set D(value: number) {
    this.registers.D = value & 0xFF;
  }

  public get E(): number {
    return this.registers.E;
  }

  public set E(value: number) {
    this.registers.E = value & 0xFF;
  }

  public get DE(): number {
    return (this.registers.D << 8) | this.registers.E;
  }

  public set DE(value: number) {
    this.registers.D = (value >> 8) & 0xFF;
    this.registers.E = value & 0xFF;
  }

  public get H(): number {
    return this.registers.H;
  }

  public set H(value: number) {
    this.registers.H = value & 0xFF;
  }

  public get L(): number {
    return this.registers.L;
  }

  public set L(value: number) {
    this.registers.L = value & 0xFF;
  }

  public get HL(): number {
    return (this.registers.H << 8) | this.registers.L;
  }

  public set HL(value: number) {
    this.registers.H = (value >> 8) & 0xFF;
    this.registers.L = value & 0xFF;
  }

  public get SP(): number {
    return this.registers.SP;
  }

  public set SP(value: number) {
    this.registers.SP = value & 0xFFFF;
  }

  public get PC(): number {
    return this.registers.PC;
  }

  public set PC(value: number) {
    this.registers.PC = value & 0xFFFF;
  }

  public get flags() {
    return this.flagsAccessor;
  }
}
