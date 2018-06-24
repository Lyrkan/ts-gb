import { IOpcodesMap, ICPUCallbacks } from '../opcodes';
import { CpuRegisters } from '../cpu-registers';
import { AddressBus } from '../../memory/address-bus';
import { ALU } from '../alu';
import { uint8ToInt8 } from '../../utils';

export const OPCODES_DEFAULT: IOpcodesMap = {
  // NOP
  0x00: (registers: CpuRegisters, addressBus: AddressBus) => {
    return 1;
  },

  // LD BC,d16
  0x01: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.BC = addressBus.getWord(registers.PC);
    registers.PC += 2;
    return 3;
  },

  // LD (BC),A
  0x02: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.BC, registers.A);
    return 2;
  },

  // INC BC
  0x03: (registers: CpuRegisters,  addressBus: AddressBus) => {
    registers.BC = ALU.incWord(registers.BC).value;
    return 2;
  },

  // INC B
  0x04: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.incByte(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // DEC B
  0x05: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.decByte(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // LD B,d8
  0x06: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = addressBus.getByte(registers.PC++);
    return 2;
  },

  // RLCA
  0x07: (registers: CpuRegisters, addressBus: AddressBus) => {
    const shifted = registers.A << 1;
    const carry = (shifted >> 8) & 1;

    registers.A = (shifted & 0xFF) | carry;
    registers.flags.Z = 0;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = carry;
    return 1;
  },

  // LD (a16),SP
  0x08: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setWord(addressBus.getWord(registers.PC), registers.SP);
    registers.PC += 2;
    return 5;
  },

  // ADD HL,BC
  0x09: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, N, H, C } = ALU.addWords(registers.HL, registers.BC);

    registers.HL = value;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // LD A,(BC)
  0x0A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = addressBus.getByte(registers.BC);
    return 2;
  },

  // DEC BC
  0x0B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.BC = ALU.decWord(registers.BC).value;
    return 2;
  },

  // INC C
  0x0C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.incByte(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // DEC C
  0x0D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.decByte(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // LD C,d8
  0x0E: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = addressBus.getByte(registers.PC++);
    return 2;
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
    return 1;
  },

  // STOP 0
  0x10: (registers: CpuRegisters, addressBus: AddressBus, cpuCallbacks: ICPUCallbacks) => {
    registers.PC++;
    cpuCallbacks.stop();
    return 1;
  },

  // LD DE,d16
  0x11: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.DE = addressBus.getWord(registers.PC);
    registers.PC += 2;
    return 3;
  },

  // LD (DE),A
  0x12: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.DE, registers.A);
    return 2;
  },

  // INC DE
  0x13: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.DE = ALU.incWord(registers.DE).value;
    return 2;
  },

  // INC D
  0x14: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.incByte(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // DEC D
  0x15: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.decByte(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // LD D,d8
  0x16: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = addressBus.getByte(registers.PC++);
    return 2;
  },

  // RLA
  0x17: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, C } = ALU.rl(
      registers.A,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = 0;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = C;
    return 1;
  },

  // JR r8
  0x18: (registers: CpuRegisters, addressBus: AddressBus) => {
    const offset = uint8ToInt8(addressBus.getByte(registers.PC++));

    registers.PC = registers.PC + offset;
    return 3;
  },

  // ADD HL,DE
  0x19: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, N, H, C } = ALU.addWords(registers.HL, registers.DE);

    registers.HL = value;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // LD A,(DE)
  0x1A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = addressBus.getByte(registers.DE);
    return 2;
  },

  // DEC DE
  0x1B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.DE = ALU.decWord(registers.DE).value;
    return 2;
  },

  // INC E
  0x1C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.incByte(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // DEC E
  0x1D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.decByte(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // LD E,d8
  0x1E: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = addressBus.getByte(registers.PC++);
    return 2;
  },

  // RRA
  0x1F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, C } = ALU.rr(
      registers.A,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = 0;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = C;
    return 1;
  },

  // JR NZ,r8
  0x20: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (registers.flags.Z) {
      registers.PC++;
      return 2;
    }

    const offset = uint8ToInt8(addressBus.getByte(registers.PC++));

    registers.PC = registers.PC + offset;
    return 3;
  },

  // LD HL,d16
  0x21: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.HL = addressBus.getWord(registers.PC);
    registers.PC += 2;
    return 3;
  },

  // LD (HL+),A
  0x22: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL++, registers.A);
    return 2;
  },

  // INC HL
  0x23: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.HL = ALU.incWord(registers.HL).value;
    return 2;
  },

  // INC H
  0x24: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.incByte(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // DEC H
  0x25: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.decByte(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // LD H,d8
  0x26: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = addressBus.getByte(registers.PC++);
    return 2;
  },

  // DAA
  0x27: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, C } = ALU.daa(
      registers.A,
      registers.flags.N,
      registers.flags.H,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // JR Z,r8
  0x28: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (!registers.flags.Z) {
      registers.PC++;
      return 2;
    }

    const offset = uint8ToInt8(addressBus.getByte(registers.PC++));

    registers.PC = registers.PC + offset;
    return 3;
  },

  // ADD HL,HL
  0x29: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, N, H, C } = ALU.addWords(registers.HL, registers.HL);

    registers.HL = value;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // LD A,(HL+)
  0x2A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = addressBus.getByte(registers.HL++);
    return 2;
  },

  // DEC HL
  0x2B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.HL = ALU.decWord(registers.HL).value;
    return 2;
  },

  // INC L
  0x2C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.incByte(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // DEC L
  0x2D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.decByte(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // LD L,d8
  0x2E: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = addressBus.getByte(registers.PC++);
    return 2;
  },

  // CPL
  0x2F: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = registers.A ^ 0xFF;
    registers.flags.N = 1;
    registers.flags.H = 1;
    return 1;
  },

  // JR NC,r8
  0x30: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (registers.flags.C) {
      registers.PC++;
      return 2;
    }

    const offset = uint8ToInt8(addressBus.getByte(registers.PC++));

    registers.PC = registers.PC + offset;
    return 3;
  },

  // LD SP,d16
  0x31: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP = addressBus.getWord(registers.PC);
    registers.PC += 2;
    return 3;
  },

  // LD (HL-),A
  0x32: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL--, registers.A);
    return 2;
  },

  // INC SP
  0x33: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP = ALU.incWord(registers.SP).value;
    return 2;
  },

  // INC (HL)
  0x34: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.incByte(addressBus.getByte(registers.HL));

    addressBus.setByte(registers.HL, value);
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;

    return 3;
  },

  // DEC (HL)
  0x35: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.decByte(addressBus.getByte(registers.HL));

    addressBus.setByte(registers.HL, value);
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;

    return 3;
  },

  // LD (HL),d8
  0x36: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, addressBus.getByte(registers.PC++));
    return 3;
  },

  // SCF
  0x37: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.flags.C = 1;
    registers.flags.H = 0;
    registers.flags.N = 0;
    return 1;
  },

  // JR C,r8
  0x38: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (!registers.flags.C) {
      registers.PC++;
      return 2;
    }

    const offset = uint8ToInt8(addressBus.getByte(registers.PC++));

    registers.PC = registers.PC + offset;
    return 3;
  },

  // ADD HL,SP
  0x39: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, N, H, C } = ALU.addWords(registers.HL, registers.SP);

    registers.HL = value;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // LD A,(HL-)
  0x3A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = addressBus.getByte(registers.HL--);
    return 2;
  },

  // DEC SP
  0x3B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP = ALU.decWord(registers.SP).value;
    return 2;
  },

  // INC A
  0x3C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.incByte(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // DEC A
  0x3D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H } = ALU.decByte(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 1;
  },

  // LD A,d8
  0x3E: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = addressBus.getByte(registers.PC++);
    return 2;
  },

  // CCF
  0x3F: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.flags.C = ~registers.flags.C;
    registers.flags.H = 0;
    registers.flags.N = 0;
    return 1;
  },

  // LD B,B
  0x40: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = registers.B;
    return 1;
  },

  // LD B,C
  0x41: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = registers.C;
    return 1;
  },

  // LD B,D
  0x42: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = registers.D;
    return 1;
  },

  // LD B,E
  0x43: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = registers.E;
    return 1;
  },

  // LD B,H
  0x44: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = registers.H;
    return 1;
  },

  // LD B,L
  0x45: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = registers.L;
    return 1;
  },

  // LD B,(HL)
  0x46: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = addressBus.getByte(registers.HL);
    return 2;
  },

  // LD B,A
  0x47: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = registers.A;
    return 1;
  },

  // LD C,B
  0x48: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = registers.B;
    return 1;
  },

  // LD C,C
  0x49: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = registers.C;
    return 1;
  },

  // LD C,D
  0x4A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = registers.D;
    return 1;
  },

  // LD C,E
  0x4B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = registers.E;
    return 1;
  },

  // LD C,H
  0x4C: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = registers.H;
    return 1;
  },

  // LD C,L
  0x4D: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = registers.L;
    return 1;
  },

  // LD C,(HL)
  0x4E: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = addressBus.getByte(registers.HL);
    return 2;
  },

  // LD C,A
  0x4F: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = registers.A;
    return 1;
  },

  // LD D,B
  0x50: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = registers.B;
    return 1;
  },

  // LD D,C
  0x51: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = registers.C;
    return 1;
  },

  // LD D,D
  0x52: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = registers.D;
    return 1;
  },

  // LD D,E
  0x53: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = registers.E;
    return 1;
  },

  // LD D,H
  0x54: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = registers.H;
    return 1;
  },

  // LD D,L
  0x55: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = registers.L;
    return 1;
  },

  // LD D,(HL)
  0x56: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = addressBus.getByte(registers.HL);
    return 2;
  },

  // LD D,A
  0x57: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = registers.A;
    return 1;
  },

  // LD E,B
  0x58: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = registers.B;
    return 1;
  },

  // LD E,C
  0x59: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = registers.C;
    return 1;
  },

  // LD E,D
  0x5A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = registers.D;
    return 1;
  },

  // LD E,E
  0x5B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = registers.E;
    return 1;
  },

  // LD E,H
  0x5C: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = registers.H;
    return 1;
  },

  // LD E,L
  0x5D: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = registers.L;
    return 1;
  },

  // LD E,(HL)
  0x5E: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = addressBus.getByte(registers.HL);
    return 2;
  },

  // LD E,A
  0x5F: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = registers.A;
    return 1;
  },

  // LD H,B
  0x60: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = registers.B;
    return 1;
  },

  // LD H,C
  0x61: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = registers.C;
    return 1;
  },

  // LD H,D
  0x62: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = registers.D;
    return 1;
  },

  // LD H,E
  0x63: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = registers.E;
    return 1;
  },

  // LD H,H
  0x64: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = registers.H;
    return 1;
  },

  // LD H,L
  0x65: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = registers.L;
    return 1;
  },

  // LD H,(HL)
  0x66: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = addressBus.getByte(registers.HL);
    return 2;
  },

  // LD H,A
  0x67: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = registers.A;
    return 1;
  },

  // LD L,B
  0x68: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = registers.B;
    return 1;
  },

  // LD L,C
  0x69: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = registers.C;
    return 1;
  },

  // LD L,D
  0x6A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = registers.D;
    return 1;
  },

  // LD L,E
  0x6B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = registers.E;
    return 1;
  },

  // LD L,H
  0x6C: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = registers.H;
    return 1;
  },

  // LD L,L
  0x6D: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = registers.L;
    return 1;
  },

  // LD L,(HL)
  0x6E: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = addressBus.getByte(registers.HL);
    return 2;
  },

  // LD L,A
  0x6F: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = registers.A;
    return 1;
  },

  // LD (HL),B
  0x70: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, registers.B);
    return 2;
  },

  // LD (HL),C
  0x71: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, registers.C);
    return 2;
  },

  // LD (HL),D
  0x72: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, registers.D);
    return 2;
  },

  // LD (HL),E
  0x73: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, registers.E);
    return 2;
  },

  // LD (HL),H
  0x74: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, registers.H);
    return 2;
  },

  // LD (HL),L
  0x75: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, registers.L);
    return 2;
  },

  // HALT
  0x76: (registers: CpuRegisters, addressBus: AddressBus, cpuCallbacks: ICPUCallbacks) => {
    cpuCallbacks.halt();
    return 1;
  },

  // LD (HL),A
  0x77: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, registers.A);
    return 2;
  },

  // LD A,B
  0x78: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = registers.B;
    return 1;
  },

  // LD A,C
  0x79: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = registers.C;
    return 1;
  },

  // LD A,D
  0x7A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = registers.D;
    return 1;
  },

  // LD A,E
  0x7B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = registers.E;
    return 1;
  },

  // LD A,H
  0x7C: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = registers.H;
    return 1;
  },

  // LD A,L
  0x7D: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = registers.L;
    return 1;
  },

  // LD A,(HL)
  0x7E: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = addressBus.getByte(registers.HL);
    return 2;
  },

  // LD A,A
  0x7F: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = registers.A;
    return 1;
  },

  // ADD A,B
  0x80: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.addBytes(registers.A, registers.B);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADD A,C
  0x81: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.addBytes(registers.A, registers.C);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADD A,D
  0x82: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.addBytes(registers.A, registers.D);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADD A,E
  0x83: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.addBytes(registers.A, registers.E);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADD A,H
  0x84: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.addBytes(registers.A, registers.H);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADD A,L
  0x85: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.addBytes(registers.A, registers.L);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADD A,(HL)
  0x86: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.addBytes(registers.A, addressBus.getByte(registers.HL));

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // ADD A,A
  0x87: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.addBytes(registers.A, registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADC A,B
  0x88: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.adc(
      registers.A,
      registers.B,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADC A,C
  0x89: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.adc(
      registers.A,
      registers.C,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADC A,D
  0x8A: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.adc(
      registers.A,
      registers.D,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADC A,E
  0x8B: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.adc(
      registers.A,
      registers.E,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADC A,H
  0x8C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.adc(
      registers.A,
      registers.H,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADC A,L
  0x8D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.adc(
      registers.A,
      registers.L,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // ADC A,(HL)
  0x8E: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.adc(
      registers.A,
      addressBus.getByte(registers.HL),
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // ADC A,A
  0x8F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.adc(
      registers.A,
      registers.A,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SUB B
  0x90: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sub(registers.A, registers.B);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SUB C
  0x91: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sub(registers.A, registers.C);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SUB D
  0x92: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sub(registers.A, registers.D);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SUB E
  0x93: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sub(registers.A, registers.E);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SUB H
  0x94: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sub(registers.A, registers.H);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SUB L
  0x95: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sub(registers.A, registers.L);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SUB (HL)
  0x96: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sub(
      registers.A,
      addressBus.getByte(registers.HL)
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // SUB A
  0x97: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sub(registers.A, registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SBC A,B
  0x98: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sbc(
      registers.A,
      registers.B,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SBC A,C
  0x99: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sbc(
      registers.A,
      registers.C,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SBC A,D
  0x9A: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sbc(
      registers.A,
      registers.D,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SBC A,E
  0x9B: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sbc(
      registers.A,
      registers.E,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SBC A,H
  0x9C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sbc(
      registers.A,
      registers.H,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SBC A,L
  0x9D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sbc(
      registers.A,
      registers.L,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // SBC A,(HL)
  0x9E: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sbc(
      registers.A,
      addressBus.getByte(registers.HL),
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // SBC A,A
  0x9F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sbc(
      registers.A,
      registers.A,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // AND B
  0xA0: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.and(registers.A, registers.B);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // AND C
  0xA1: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.and(registers.A, registers.C);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // AND D
  0xA2: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.and(registers.A, registers.D);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // AND E
  0xA3: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.and(registers.A, registers.E);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // AND H
  0xA4: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.and(registers.A, registers.H);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // AND L
  0xA5: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.and(registers.A, registers.L);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // AND (HL)
  0xA6: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.and(
      registers.A,
      addressBus.getByte(registers.HL)
    );

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // AND A
  0xA7: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.and(registers.A, registers.A);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // XOR B
  0xA8: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.xor(registers.A, registers.B);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // XOR C
  0xA9: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.xor(registers.A, registers.C);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // XOR D
  0xAA: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.xor(registers.A, registers.D);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // XOR E
  0xAB: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.xor(registers.A, registers.E);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // XOR H
  0xAC: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.xor(registers.A, registers.H);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // XOR L
  0xAD: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.xor(registers.A, registers.L);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // XOR (HL)
  0xAE: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.xor(
      registers.A,
      addressBus.getByte(registers.HL)
    );

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // XOR A
  0xAF: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.xor(registers.A, registers.A);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // OR B
  0xB0: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.or(registers.A, registers.B);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // OR C
  0xB1: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.or(registers.A, registers.C);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // OR D
  0xB2: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.or(registers.A, registers.D);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // OR E
  0xB3: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.or(registers.A, registers.E);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // OR H
  0xB4: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.or(registers.A, registers.H);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // OR L
  0xB5: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.or(registers.A, registers.L);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // OR (HL)
  0xB6: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.or(
      registers.A,
      addressBus.getByte(registers.HL)
    );

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // OR A
  0xB7: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.or(registers.A, registers.A);

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 1;
  },

  // CP B
  0xB8: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H, C } = ALU.sub(registers.A, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // CP C
  0xB9: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H, C } = ALU.sub(registers.A, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // CP D
  0xBA: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H, C } = ALU.sub(registers.A, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // CP E
  0xBB: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H, C } = ALU.sub(registers.A, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // CP H
  0xBC: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H, C } = ALU.sub(registers.A, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // CP L
  0xBD: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H, C } = ALU.sub(registers.A, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // CP (HL)
  0xBE: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H, C } = ALU.sub(
      registers.A,
      addressBus.getByte(registers.HL)
    );

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // CP A
  0xBF: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H, C } = ALU.sub(registers.A, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 1;
  },

  // RET NZ
  0xC0: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (registers.flags.Z) {
      return 2;
    }

    registers.PC = addressBus.getWord(registers.SP);
    registers.SP += 2;
    return 5;
  },

  // POP BC
  0xC1: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.BC = addressBus.getWord(registers.SP);
    registers.SP += 2;
    return 3;
  },

  // JP NZ,a16
  0xC2: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (registers.flags.Z) {
      registers.PC += 2;
      return 3;
    }

    registers.PC = addressBus.getWord(registers.PC);
    return 4;
  },

  // JP a16
  0xC3: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.PC = addressBus.getWord(registers.PC);
    return 4;
  },

  // CALL NZ,a16
  0xC4: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (registers.flags.Z) {
      registers.PC += 2;
      return 3;
    }

    // Push return address to the stack
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC + 2);

    // Set PC to the given address
    registers.PC = addressBus.getWord(registers.PC);
    return 6;
  },

  // PUSH BC
  0xC5: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.BC);
    return 4;
  },

  // ADD A,d8
  0xC6: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.addBytes(registers.A, addressBus.getByte(registers.PC++));

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // RST 00H
  0xC7: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC);
    registers.PC = 0x0000;
    return 4;
  },

  // RET Z
  0xC8: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (!registers.flags.Z) {
      return 2;
    }

    registers.PC = addressBus.getWord(registers.SP);
    registers.SP += 2;
    return 5;
  },

  // RET
  0xC9: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.PC = addressBus.getWord(registers.SP);
    registers.SP += 2;
    return 4;
  },

  // JP Z,a16
  0xCA: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (!registers.flags.Z) {
      registers.PC += 2;
      return 3;
    }

    registers.PC = addressBus.getWord(registers.PC);
    return 4;
  },

  // CALL Z,a16
  0xCC: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (!registers.flags.Z) {
      registers.PC += 2;
      return 3;
    }

    // Push return address to the stack
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC + 2);

    // Set PC to the given address
    registers.PC = addressBus.getWord(registers.PC);
    return 6;
  },

  // CALL a16
  0xCD: (registers: CpuRegisters, addressBus: AddressBus) => {
    // Push return address to the stack
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC + 2);

    // Set PC to the given address
    registers.PC = addressBus.getWord(registers.PC);
    return 6;
  },

  // ADC A,d8
  0xCE: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.adc(
      registers.A,
      addressBus.getByte(registers.PC++),
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // RST 08H
  0xCF: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC);
    registers.PC = 0x0008;
    return 4;
  },

  // RET NC
  0xD0: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (registers.flags.C) {
      return 2;
    }

    registers.PC = addressBus.getWord(registers.SP);
    registers.SP += 2;
    return 5;
  },

  // POP DE
  0xD1: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.DE = addressBus.getWord(registers.SP);
    registers.SP += 2;
    return 3;
  },

  // JP NC,a16
  0xD2: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (registers.flags.C) {
      registers.PC += 2;
      return 3;
    }

    registers.PC = addressBus.getWord(registers.PC);
    return 4;
  },

  // CALL NC,a16
  0xD4: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (registers.flags.C) {
      registers.PC += 2;
      return 3;
    }

    // Push return address to the stack
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC + 2);

    // Set PC to the given address
    registers.PC = addressBus.getWord(registers.PC);
    return 6;
  },

  // PUSH DE
  0xD5: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.DE);
    return 4;
  },

  // SUB d8
  0xD6: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sub(
      registers.A,
      addressBus.getByte(registers.PC++)
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // RST 10H
  0xD7: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC);
    registers.PC = 0x0010;
    return 4;
  },

  // RET C
  0xD8: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (!registers.flags.C) {
      return 2;
    }

    registers.PC = addressBus.getWord(registers.SP);
    registers.SP += 2;
    return 5;
  },

  // RETI
  0xD9: (registers: CpuRegisters, addressBus: AddressBus, cpuCallbacks: ICPUCallbacks) => {
    registers.PC = addressBus.getWord(registers.SP);
    registers.SP += 2;
    cpuCallbacks.enableInterrupts();
    return 4;
  },

  // JP C,a16
  0xDA: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (!registers.flags.C) {
      registers.PC += 2;
      return 3;
    }

    registers.PC = addressBus.getWord(registers.PC);
    return 4;
  },

  // CALL C,a16
  0xDC: (registers: CpuRegisters, addressBus: AddressBus) => {
    if (!registers.flags.C) {
      registers.PC += 2;
      return 3;
    }

    // Push return address to the stack
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC + 2);

    // Set PC to the given address
    registers.PC = addressBus.getWord(registers.PC);
    return 6;
  },

  // SBC A,d8
  0xDE: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, N, H, C } = ALU.sbc(
      registers.A,
      addressBus.getByte(registers.PC++),
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // RST 18H
  0xDF: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC);
    registers.PC = 0x0018;
    return 4;
  },

  // LDH (a8),A
  0xE0: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(0xFF00 + addressBus.getByte(registers.PC++), registers.A);
    return 3;
  },

  // POP HL
  0xE1: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.HL = addressBus.getWord(registers.SP);
    registers.SP += 2;
    return 3;
  },

  // LD (C),A
  0xE2: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(0xFF00 + registers.C, registers.A);
    return 2;
  },

  // PUSH HL
  0xE5: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.HL);
    return 4;
  },

  // AND d8
  0xE6: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.and(
      registers.A,
      addressBus.getByte(registers.PC++)
    );

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RST 20H
  0xE7: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC);
    registers.PC = 0x0020;
    return 4;
  },

  // ADD SP,r8
  0xE8: (registers: CpuRegisters, addressBus: AddressBus) => {
    const signedOperand = uint8ToInt8(addressBus.getByte(registers.PC++));
    const value = (registers.SP + signedOperand) & 0xFFFF;
    const H = ((registers.SP & 0xF) + (signedOperand & 0xF)) >> 4;
    const C = ((registers.SP & 0xFF) + (signedOperand & 0xFF)) >> 8;

    registers.SP = value;
    registers.flags.H = H;
    registers.flags.Z = 0;
    registers.flags.N = 0;
    registers.flags.C = C;
    return 4;
  },

  // JP HL
  0xE9: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.PC = registers.HL;
    return 1;
  },

  // LD (a16),A
  0xEA: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus.setByte(addressBus.getWord(registers.PC), registers.A);
    registers.PC += 2;
    return 4;
  },

  // XOR d8
  0xEE: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.xor(
      registers.A,
      addressBus.getByte(registers.PC++)
    );

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RST 28H
  0xEF: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC);
    registers.PC = 0x0028;
    return 4;
  },

  // LDH A,(a8)
  0xF0: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = addressBus.getByte(0xFF00 + addressBus.getByte(registers.PC++));
    return 3;
  },

  // POP AF
  0xF1: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.AF = addressBus.getWord(registers.SP);
    registers.SP += 2;
    return 3;
  },

  // LD A,(C)
  0xF2: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = addressBus.getByte(0xFF00 + registers.C);
    return 2;
  },

  // DI
  0xF3: (registers: CpuRegisters, addressBus: AddressBus, cpuCallbacks: ICPUCallbacks) => {
    cpuCallbacks.disableInterrupts();
    return 1;
  },

  // PUSH AF
  0xF5: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.AF);
    return 4;
  },

  // OR d8
  0xF6: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, H, Z, N, C } = ALU.or(
      registers.A,
      addressBus.getByte(registers.PC++)
    );

    registers.A = value;
    registers.flags.H = H;
    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RST 30H
  0xF7: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC);
    registers.PC = 0x0030;
    return 4;
  },

  // LD HL,SP+r8
  0xF8: (registers: CpuRegisters, addressBus: AddressBus) => {
    const signedOperand = uint8ToInt8(addressBus.getByte(registers.PC++));
    const value = (registers.SP + signedOperand) & 0xFFFF;
    const H = ((registers.SP & 0xF) + (signedOperand & 0xF)) >> 4;
    const C = ((registers.SP & 0xFF) + (signedOperand & 0xFF)) >> 8;

    registers.HL = value;
    registers.flags.H = H;
    registers.flags.Z = 0;
    registers.flags.N = 0;
    registers.flags.C = C;
    return 3;
  },

  // LD SP,HL
  0xF9: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP = registers.HL;
    return 2;
  },

  // LD A,(a16)
  0xFA: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = addressBus.getByte(addressBus.getWord(registers.PC));
    registers.PC += 2;
    return 4;
  },

  // EI
  0xFB: (registers: CpuRegisters, addressBus: AddressBus, cpuCallbacks: ICPUCallbacks) => {
    cpuCallbacks.enableInterrupts();
    return 1;
  },

  // CP d8
  0xFE: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H, C } = ALU.sub(
      registers.A,
      addressBus.getByte(registers.PC++)
    );

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    registers.flags.C = C;
    return 2;
  },

  // RST 38H
  0xFF: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.SP -= 2;
    addressBus.setWord(registers.SP, registers.PC);
    registers.PC = 0x0038;
    return 4;
  },
};

export const OPCODES_DEFAULT_NAMES: { [index: number]: string } = {
  0x00: 'NOP',
  0x01: 'LD BC,d16',
  0x02: 'LD (BC),A',
  0x03: 'INC BC',
  0x04: 'INC B',
  0x05: 'DEC B',
  0x06: 'LD B,d8',
  0x07: 'RLCA',
  0x08: 'LD (a16),SP',
  0x09: 'ADD HL,BC',
  0x0A: 'LD A,(BC)',
  0x0B: 'DEC BC',
  0x0C: 'INC C',
  0x0D: 'DEC C',
  0x0E: 'LD C,d8',
  0x0F: 'RRCA',
  0x10: 'STOP 0',
  0x11: 'LD DE,d16',
  0x12: 'LD (DE),A',
  0x13: 'INC DE',
  0x14: 'INC D',
  0x15: 'DEC D',
  0x16: 'LD D,d8',
  0x17: 'RLA',
  0x18: 'JR r8',
  0x19: 'ADD HL,DE',
  0x1A: 'LD A,(DE)',
  0x1B: 'DEC DE',
  0x1C: 'INC E',
  0x1D: 'DEC E',
  0x1E: 'LD E,d8',
  0x1F: 'RRA',
  0x20: 'JR NZ,r8',
  0x21: 'LD HL,d16',
  0x22: 'LD (HL+),A',
  0x23: 'INC HL',
  0x24: 'INC H',
  0x25: 'DEC H',
  0x26: 'LD H,d8',
  0x27: 'DAA',
  0x28: 'JR Z,r8',
  0x29: 'ADD HL,HL',
  0x2A: 'LD A,(HL+)',
  0x2B: 'DEC HL',
  0x2C: 'INC L',
  0x2D: 'DEC L',
  0x2E: 'LD L,d8',
  0x2F: 'CPL',
  0x30: 'JR NC,r8',
  0x31: 'LD SP,d16',
  0x32: 'LD (HL-),A',
  0x33: 'INC SP',
  0x34: 'INC (HL)',
  0x35: 'DEC (HL)',
  0x36: 'LD (HL),d8',
  0x37: 'SCF',
  0x38: 'JR C,r8',
  0x39: 'ADD HL,SP',
  0x3A: 'LD A,(HL-)',
  0x3B: 'DEC SP',
  0x3C: 'INC A',
  0x3D: 'DEC A',
  0x3E: 'LD A,d8',
  0x3F: 'CCF',
  0x40: 'LD B,B',
  0x41: 'LD B,C',
  0x42: 'LD B,D',
  0x43: 'LD B,E',
  0x44: 'LD B,H',
  0x45: 'LD B,L',
  0x46: 'LD B,(HL)',
  0x47: 'LD B,A',
  0x48: 'LD C,B',
  0x49: 'LD C,C',
  0x4A: 'LD C,D',
  0x4B: 'LD C,E',
  0x4C: 'LD C,H',
  0x4D: 'LD C,L',
  0x4E: 'LD C,(HL)',
  0x4F: 'LD C,A',
  0x50: 'LD D,B',
  0x51: 'LD D,C',
  0x52: 'LD D,D',
  0x53: 'LD D,E',
  0x54: 'LD D,H',
  0x55: 'LD D,L',
  0x56: 'LD D,(HL)',
  0x57: 'LD D,A',
  0x58: 'LD E,B',
  0x59: 'LD E,C',
  0x5A: 'LD E,D',
  0x5B: 'LD E,E',
  0x5C: 'LD E,H',
  0x5D: 'LD E,L',
  0x5E: 'LD E,(HL)',
  0x5F: 'LD E,A',
  0x60: 'LD H,B',
  0x61: 'LD H,C',
  0x62: 'LD H,D',
  0x63: 'LD H,E',
  0x64: 'LD H,H',
  0x65: 'LD H,L',
  0x66: 'LD H,(HL)',
  0x67: 'LD H,A',
  0x68: 'LD L,B',
  0x69: 'LD L,C',
  0x6A: 'LD L,D',
  0x6B: 'LD L,E',
  0x6C: 'LD L,H',
  0x6D: 'LD L,L',
  0x6E: 'LD L,(HL)',
  0x6F: 'LD L,A',
  0x70: 'LD (HL),B',
  0x71: 'LD (HL),C',
  0x72: 'LD (HL),D',
  0x73: 'LD (HL),E',
  0x74: 'LD (HL),H',
  0x75: 'LD (HL),L',
  0x76: 'HALT',
  0x77: 'LD (HL),A',
  0x78: 'LD A,B',
  0x79: 'LD A,C',
  0x7A: 'LD A,D',
  0x7B: 'LD A,E',
  0x7C: 'LD A,H',
  0x7D: 'LD A,L',
  0x7E: 'LD A,(HL)',
  0x7F: 'LD A,A',
  0x80: 'ADD A,B',
  0x81: 'ADD A,C',
  0x82: 'ADD A,D',
  0x83: 'ADD A,E',
  0x84: 'ADD A,H',
  0x85: 'ADD A,L',
  0x86: 'ADD A,(HL)',
  0x87: 'ADD A,A',
  0x88: 'ADC A,B',
  0x89: 'ADC A,C',
  0x8A: 'ADC A,D',
  0x8B: 'ADC A,E',
  0x8C: 'ADC A,H',
  0x8D: 'ADC A,L',
  0x8E: 'ADC A,(HL)',
  0x8F: 'ADC A,A',
  0x90: 'SUB B',
  0x91: 'SUB C',
  0x92: 'SUB D',
  0x93: 'SUB E',
  0x94: 'SUB H',
  0x95: 'SUB L',
  0x96: 'SUB (HL)',
  0x97: 'SUB A',
  0x98: 'SBC A,B',
  0x99: 'SBC A,C',
  0x9A: 'SBC A,D',
  0x9B: 'SBC A,E',
  0x9C: 'SBC A,H',
  0x9D: 'SBC A,L',
  0x9E: 'SBC A,(HL)',
  0x9F: 'SBC A,A',
  0xA0: 'AND B',
  0xA1: 'AND C',
  0xA2: 'AND D',
  0xA3: 'AND E',
  0xA4: 'AND H',
  0xA5: 'AND L',
  0xA6: 'AND (HL)',
  0xA7: 'AND A',
  0xA8: 'XOR B',
  0xA9: 'XOR C',
  0xAA: 'XOR D',
  0xAB: 'XOR E',
  0xAC: 'XOR H',
  0xAD: 'XOR L',
  0xAE: 'XOR (HL)',
  0xAF: 'XOR A',
  0xB0: 'OR B',
  0xB1: 'OR C',
  0xB2: 'OR D',
  0xB3: 'OR E',
  0xB4: 'OR H',
  0xB5: 'OR L',
  0xB6: 'OR (HL)',
  0xB7: 'OR A',
  0xB8: 'CP B',
  0xB9: 'CP C',
  0xBA: 'CP D',
  0xBB: 'CP E',
  0xBC: 'CP H',
  0xBD: 'CP L',
  0xBE: 'CP (HL)',
  0xBF: 'CP A',
  0xC0: 'RET NZ',
  0xC1: 'POP BC',
  0xC2: 'JP NZ,a16',
  0xC3: 'JP a16',
  0xC4: 'CALL NZ,a16',
  0xC5: 'PUSH BC',
  0xC6: 'ADD A,d8',
  0xC7: 'RST 00H',
  0xC8: 'RET Z',
  0xC9: 'RET',
  0xCA: 'JP Z,a16',
  0xCC: 'CALL Z,a16',
  0xCD: 'CALL a16',
  0xCE: 'ADC A,d8',
  0xCF: 'RST 08H',
  0xD0: 'RET NC',
  0xD1: 'POP DE',
  0xD2: 'JP NC,a16',
  0xD4: 'CALL NC,a16',
  0xD5: 'PUSH DE',
  0xD6: 'SUB d8',
  0xD7: 'RST 10H',
  0xD8: 'RET C',
  0xD9: 'RETI',
  0xDA: 'JP C,a16',
  0xDC: 'CALL C,a16',
  0xDE: 'SBC A,d8',
  0xDF: 'RST 18H',
  0xE0: 'LDH (a8),A',
  0xE1: 'POP HL',
  0xE2: 'LD (C),A',
  0xE5: 'PUSH HL',
  0xE6: 'AND d8',
  0xE7: 'RST 20H',
  0xE8: 'ADD SP,r8',
  0xE9: 'JP HL',
  0xEA: 'LD (a16),A',
  0xEE: 'XOR d8',
  0xEF: 'RST 28H',
  0xF0: 'LDH A,(a8)',
  0xF1: 'POP AF',
  0xF2: 'LD A,(C)',
  0xF3: 'DI',
  0xF5: 'PUSH AF',
  0xF6: 'OR d8',
  0xF7: 'RST 30H',
  0xF8: 'LD HL,SP+r8',
  0xF9: 'LD SP,HL',
  0xFA: 'LD A,(a16)',
  0xFB: 'EI',
  0xFE: 'CP d8',
  0xFF: 'RST 38H',
};
