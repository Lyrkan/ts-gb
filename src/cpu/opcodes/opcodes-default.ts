import { IOpcodesMap } from '../opcodes';
import { CpuRegisters } from '../cpu-registers';
import { AddressBus } from '../../memory/address-bus';

export const OPCODES_DEFAULT: IOpcodesMap = {
  // NOP
  0x00: (registers: CpuRegisters, addressBus: AddressBus) => {
    return 2;
  },

  // LD BC,d16
  0x01: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.BC = addressBus[registers.PC].word;
    registers.PC += 2;
    return 12;
  },

  // LD (BC) A
  0x02: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.BC].byte = registers.A;
    return 8;
  },

  // INC BC
  0x03: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.BC++;
    return 8;
  },

  // INC B
  0x04: (registers: CpuRegisters, addressBus: AddressBus) => {
    const newValue = registers.B + 1;
    const maskedValue = newValue & 0xFF;

    registers.B = maskedValue;
    registers.flags.Z = (maskedValue === 0) ? 1 : 0;
    registers.flags.N = 0;
    registers.flags.H = ((newValue  & 0x10) === 0x10) ? 1 : 0;
    return 4;
  },

  // DEC B
  0x05: (registers: CpuRegisters, addressBus: AddressBus) => {
    const newValue = registers.B - 1;
    const maskedValue = newValue & 0xFF;

    registers.B = maskedValue;
    registers.flags.Z = (maskedValue === 0) ? 1 : 0;
    registers.flags.N = 1;
    registers.flags.H = ((newValue  & 0x10) === 0x10) ? 1 : 0;
    return 4;
  },

  // LD B,d8
  0x06: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = addressBus[registers.PC++].byte;
    return 8;
  },

  // RLCA
  0x07: (registers: CpuRegisters, addressBus: AddressBus) => {
    const shifted = registers.A << 1;
    const carry = (shifted & (1 << 8)) >> 8;

    registers.A = (shifted & 0xFF) | carry;
    registers.flags.Z = 0;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = carry;
    return 4;
  },

  // LD (a16),SP
  0x08: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[addressBus[registers.PC].word].word = registers.SP;
    registers.PC += 2;
    return 20;
  },

  // ADD HL,BC
  0x09: (registers: CpuRegisters, addressBus: AddressBus) => {
    const sum = registers.HL + registers.BC;

    registers.HL = sum;
    registers.flags.N = 0;
    registers.flags.H = ((sum  & 0x1000) === 0x1000) ? 1 : 0;
    registers.flags.C = (sum & (1 << 16)) >> 16;
    return 8;
  },

  // LD A,(BC)
  0x0A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = addressBus[registers.BC].byte;
    return 8;
  },

  // DEC BC
  0x0B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.BC--;
    return 8;
  },

  // INC C
  0x0C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const newValue = registers.C + 1;
    const maskedValue = newValue & 0xFF;

    registers.C = maskedValue;
    registers.flags.Z = (maskedValue === 0) ? 1 : 0;
    registers.flags.N = 0;
    registers.flags.H = ((newValue  & 0x10) === 0x10) ? 1 : 0;
    return 4;
  },

  // DEC C
  0x0D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const newValue = registers.C - 1;
    const maskedValue = newValue & 0xFF;

    registers.C = maskedValue;
    registers.flags.Z = (maskedValue === 0) ? 1 : 0;
    registers.flags.N = 1;
    registers.flags.H = ((newValue  & 0x10) === 0x10) ? 1 : 0;
    return 4;
  },

  // LD C,d8
  0x0E: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = addressBus[registers.PC++].byte;
    return 8;
  },

  // RRCA
  0x0F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const carry = registers.A & 1;
    const shifted = registers.A >> 1;

    registers.A = (shifted & 0xFF) | (carry << 7);
    registers.flags.Z = 0;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = carry;
    return 4;
  },
};
