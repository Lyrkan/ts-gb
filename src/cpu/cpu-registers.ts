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
export class CpuRegisters {
  private buffer: ArrayBuffer;
  private view: DataView;
  private flagsAccessor: {
    Z: number;
    N: number;
    H: number;
    C: number;
  };

  public constructor() {
    this.buffer = new ArrayBuffer(96);
    this.view = new DataView(this.buffer);

    const registers = this;
    this.flagsAccessor = {
      get Z() {
        return (registers.F & (1 << 7)) >> 7;
      },

      set Z(value: number) {
        registers.F = (registers.F & ~(0b1000 << 4)) | ((value & 1) << 7);
      },

      get N() {
        return (registers.F & (1 << 6)) >> 6;
      },

      set N(value: number) {
        registers.F = (registers.F & ~(0b0100 << 4)) | ((value & 1) << 6);
      },

      get H() {
        return (registers.F & (1 << 5)) >> 5;
      },

      set H(value: number) {
        registers.F = (registers.F & ~(0b0010 << 4)) | ((value & 1) << 5);
      },

      get C() {
        return (registers.F & (1 << 4)) >> 4;
      },

      set C(value: number) {
        registers.F = (registers.F & ~(0b0001 << 4)) | ((value & 1) << 4);
      }
    };
  }

  public get A(): number {
    return this.view.getUint8(0);
  }

  public set A(value: number) {
    this.view.setUint8(0, value);
  }

  public get F(): number {
    // The 4 least significant bits are always
    // equal to 0 for the flag register
    return this.view.getUint8(1) & ~0b1111;
  }

  public set F(value: number) {
    // The 4 least significant bits are always
    // equal to 0 for the flag register
    this.view.setUint8(1, value & ~0b1111);
  }

  public get AF(): number {
    // The 4 least significant bits are always
    // equal to 0 for the flag register
    return this.view.getUint16(0) & ~0b1111;
  }

  public set AF(value: number) {
    // The 4 least significant bits are always
    // equal to 0 for the flag register
    this.view.setUint16(0, value & ~0b1111);
  }

  public get B(): number {
    return this.view.getUint8(2);
  }

  public set B(value: number) {
    this.view.setUint8(2, value);
  }

  public get C(): number {
    return this.view.getUint8(3);
  }

  public set C(value: number) {
    this.view.setUint8(3, value);
  }

  public get BC(): number {
    return this.view.getUint16(2);
  }

  public set BC(value: number) {
    this.view.setUint16(2, value);
  }

  public get D(): number {
    return this.view.getUint8(4);
  }

  public set D(value: number) {
    this.view.setUint8(4, value);
  }

  public get E(): number {
    return this.view.getUint8(5);
  }

  public set E(value: number) {
    this.view.setUint8(5, value);
  }

  public get DE(): number {
    return this.view.getUint16(4);
  }

  public set DE(value: number) {
    this.view.setUint16(4, value);
  }

  public get H(): number {
    return this.view.getUint8(6);
  }

  public set H(value: number) {
    this.view.setUint8(6, value);
  }

  public get L(): number {
    return this.view.getUint8(7);
  }

  public set L(value: number) {
    this.view.setUint8(7, value);
  }

  public get HL(): number {
    return this.view.getUint16(6);
  }

  public set HL(value: number) {
    this.view.setUint16(6, value);
  }

  public get SP(): number {
    return this.view.getUint16(8);
  }

  public set SP(value: number) {
    this.view.setUint16(8, value);
  }

  public get PC(): number {
    return this.view.getUint16(10);
  }

  public set PC(value: number) {
    this.view.setUint16(10, value);
  }

  public get flags() {
    return this.flagsAccessor;
  }
}
