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
    // TODO
    return 12;
  },

  // LD (BC) A
  0x02: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 8;
  },

  // INC BC
  0x03: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 8;
  },

  // INC B
  0x04: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 4;
  },

  // DEC B
  0x05: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 4;
  },

  // LD B,d8
  0x06: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 8;
  },

  // RLCA
  0x07: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 4;
  },

  // LD (a16),SP
  0x08: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 20;
  },

  // ADD HL,BC
  0x09: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 8;
  },

  // LD A,(BC)
  0x0A: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 8;
  },

  // DEC BC
  0x0B: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 8;
  },

  // INC C
  0x0C: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 4;
  },

  // DEC C
  0x0D: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 4;
  },

  // LD C,d8
  0x0E: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 8;
  },

  // RRCA
  0x0F: (registers: CpuRegisters, addressBus: AddressBus) => {
    // TODO
    return 4;
  },
};
