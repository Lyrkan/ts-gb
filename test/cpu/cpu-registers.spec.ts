import 'mocha';
import { expect } from 'chai';
import { CPURegisters } from '../../src/cpu/cpu-registers';

describe('CpuRegisters', () => {
  let registers: CPURegisters;

  beforeEach(() => {
    registers = new CPURegisters();
  });

  describe('Byte registers', () => {
    it('should initialize all registers to 0x00', () => {
      expect(registers.A).to.equal(0x00);
      expect(registers.F).to.equal(0x00);
      expect(registers.B).to.equal(0x00);
      expect(registers.C).to.equal(0x00);
      expect(registers.D).to.equal(0x00);
      expect(registers.E).to.equal(0x00);
      expect(registers.H).to.equal(0x00);
      expect(registers.L).to.equal(0x00);
    });

    it('should be able to read/write into register A', () => {
      registers.A = 0x1234;
      expect(registers.A).to.equal(0x34);
      expect(registers.F).to.equal(0x00);
    });

    it('should be able to read/write into register F', () => {
      // The 4 least significant bits are always
      // equal to 0 for the flag register
      registers.F = 0x1234;
      expect(registers.A).to.equal(0x00);
      expect(registers.F).to.equal(0x30);
    });

    it('should be able to read/write into register B', () => {
      registers.B = 0x1234;
      expect(registers.B).to.equal(0x34);
      expect(registers.C).to.equal(0x00);
    });

    it('should be able to read/write into register C', () => {
      registers.C = 0x1234;
      expect(registers.B).to.equal(0x00);
      expect(registers.C).to.equal(0x34);
    });

    it('should be able to read/write into register D', () => {
      registers.D = 0x1234;
      expect(registers.D).to.equal(0x34);
      expect(registers.E).to.equal(0x00);
    });

    it('should be able to read/write into register E', () => {
      registers.E = 0x1234;
      expect(registers.D).to.equal(0x00);
      expect(registers.E).to.equal(0x34);
    });

    it('should be able to read/write into register H', () => {
      registers.H = 0x1234;
      expect(registers.H).to.equal(0x34);
      expect(registers.L).to.equal(0x00);
    });

    it('should be able to read/write into register L', () => {
      registers.L = 0x1234;
      expect(registers.H).to.equal(0x00);
      expect(registers.L).to.equal(0x34);
    });
  });

  describe('Word registers', () => {
    it('should initialize all registers to 0', () => {
      expect(registers.AF).to.equal(0x0000);
      expect(registers.BC).to.equal(0x0000);
      expect(registers.DE).to.equal(0x0000);
      expect(registers.HL).to.equal(0x0000);
      expect(registers.SP).to.equal(0x0000);
      expect(registers.PC).to.equal(0x0000);
    });

    it('should be able to read/write into register AF', () => {
      // The 4 least significant bits are always
      // equal to 0 for the flag register
      registers.AF = 0xABCD1234;
      expect(registers.AF).to.equal(0x1230);
      expect(registers.BC).to.equal(0x0000);
      expect(registers.DE).to.equal(0x0000);
      expect(registers.HL).to.equal(0x0000);
      expect(registers.SP).to.equal(0x0000);
      expect(registers.PC).to.equal(0x0000);
    });

    it('should be able to read/write into register BC', () => {
      registers.BC = 0xABCD1234;
      expect(registers.AF).to.equal(0x0000);
      expect(registers.BC).to.equal(0x1234);
      expect(registers.DE).to.equal(0x0000);
      expect(registers.HL).to.equal(0x0000);
      expect(registers.SP).to.equal(0x0000);
      expect(registers.PC).to.equal(0x0000);
    });

    it('should be able to read/write into register DE', () => {
      registers.DE = 0xABCD1234;
      expect(registers.AF).to.equal(0x0000);
      expect(registers.BC).to.equal(0x0000);
      expect(registers.DE).to.equal(0x1234);
      expect(registers.HL).to.equal(0x0000);
      expect(registers.SP).to.equal(0x0000);
      expect(registers.PC).to.equal(0x0000);
    });

    it('should be able to read/write into register HL', () => {
      registers.HL = 0xABCD1234;
      expect(registers.AF).to.equal(0x0000);
      expect(registers.BC).to.equal(0x0000);
      expect(registers.DE).to.equal(0x0000);
      expect(registers.HL).to.equal(0x1234);
      expect(registers.SP).to.equal(0x0000);
      expect(registers.PC).to.equal(0x0000);
    });

    it('should be able to read/write into register SP', () => {
      registers.SP = 0xABCD1234;
      expect(registers.AF).to.equal(0x0000);
      expect(registers.BC).to.equal(0x0000);
      expect(registers.DE).to.equal(0x0000);
      expect(registers.HL).to.equal(0x0000);
      expect(registers.SP).to.equal(0x1234);
      expect(registers.PC).to.equal(0x0000);
    });

    it('should be able to read/write into register PC', () => {
      registers.PC = 0xABCD1234;
      expect(registers.AF).to.equal(0x0000);
      expect(registers.BC).to.equal(0x0000);
      expect(registers.DE).to.equal(0x0000);
      expect(registers.HL).to.equal(0x0000);
      expect(registers.SP).to.equal(0x0000);
      expect(registers.PC).to.equal(0x1234);
    });
  });

  describe('Flags 1-bit registers', () => {
    it('should initialize all flags to 0', () => {
      expect(registers.flags.Z).to.equal(0);
      expect(registers.flags.N).to.equal(0);
      expect(registers.flags.H).to.equal(0);
      expect(registers.flags.C).to.equal(0);
    });

    it('should be able to read/write into flag Z', () => {
      registers.flags.Z = 0xF;
      expect(registers.flags.Z).to.equal(1);
      expect(registers.F).to.equal(1 << 7);
      expect(registers.AF).to.equal(1 << 7);

      registers.F = 0;
      expect(registers.flags.Z).to.equal(0);

      registers.AF = 0b1111 << 4;
      expect(registers.flags.Z).to.equal(1);

      registers.flags.Z = 0;
      expect(registers.flags.Z).to.equal(0);
      expect(registers.flags.N).to.equal(1);
      expect(registers.flags.H).to.equal(1);
      expect(registers.flags.C).to.equal(1);
    });

    it('should be able to read/write into flag N', () => {
      registers.flags.N = 0xF;
      expect(registers.flags.N).to.equal(1);
      expect(registers.F).to.equal(1 << 6);
      expect(registers.AF).to.equal(1 << 6);

      registers.F = 0;
      expect(registers.flags.N).to.equal(0);

      registers.AF = 0b1111 << 4;
      expect(registers.flags.N).to.equal(1);

      registers.flags.N = 0;
      expect(registers.flags.Z).to.equal(1);
      expect(registers.flags.N).to.equal(0);
      expect(registers.flags.H).to.equal(1);
      expect(registers.flags.C).to.equal(1);
    });

    it('should be able to read/write into flag H', () => {
      registers.flags.H = 0xF;
      expect(registers.flags.H).to.equal(1);
      expect(registers.F).to.equal(1 << 5);
      expect(registers.AF).to.equal(1 << 5);

      registers.F = 0;
      expect(registers.flags.H).to.equal(0);

      registers.AF = 0b1111 << 4;
      expect(registers.flags.H).to.equal(1);

      registers.flags.H = 0;
      expect(registers.flags.Z).to.equal(1);
      expect(registers.flags.N).to.equal(1);
      expect(registers.flags.H).to.equal(0);
      expect(registers.flags.C).to.equal(1);
    });

    it('should be able to read/write into flag C', () => {
      registers.flags.C = 0xF;
      expect(registers.flags.C).to.equal(1);
      expect(registers.F).to.equal(1 << 4);
      expect(registers.AF).to.equal(1 << 4);

      registers.F = 0;
      expect(registers.flags.C).to.equal(0);

      registers.AF = 0b1111 << 4;
      expect(registers.flags.C).to.equal(1);

      registers.flags.C = 0;
      expect(registers.flags.Z).to.equal(1);
      expect(registers.flags.N).to.equal(1);
      expect(registers.flags.H).to.equal(1);
      expect(registers.flags.C).to.equal(0);
    });
  });
});
