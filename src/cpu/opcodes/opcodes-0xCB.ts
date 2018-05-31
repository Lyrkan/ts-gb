import { IOpcodesMap } from '../opcodes';
import { CpuRegisters } from '../cpu-registers';
import { AddressBus } from '../../memory/address-bus';
import { ALU } from '../alu';

export const OPCODES_0XCB: IOpcodesMap = {
  // RLC B
  0x00: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RLC C
  0x01: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RLC D
  0x02: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RLC E
  0x03: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RLC H
  0x04: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RLC L
  0x05: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RLC (HL)
  0x06: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(
      addressBus[registers.HL].byte
    );

    addressBus[registers.HL].byte = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 16;
  },

  // RLC A
  0x07: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RRC B
  0x08: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RRC C
  0x09: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RRC D
  0x0A: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RRC E
  0x0B: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RRC H
  0x0C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RRC L
  0x0D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RRC (HL)
  0x0E: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(
      addressBus[registers.HL].byte
    );

    addressBus[registers.HL].byte = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 16;
  },

  // RRC A
  0x0F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RL B
  0x10: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.B,
      registers.flags.C
    );

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RL C
  0x11: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.C,
      registers.flags.C
    );

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RL D
  0x12: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.D,
      registers.flags.C
    );

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RL E
  0x13: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.E,
      registers.flags.C
    );

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RL H
  0x14: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.H,
      registers.flags.C
    );

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RL L
  0x15: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.L,
      registers.flags.C
    );

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RL (HL)
  0x16: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      addressBus[registers.HL].byte,
      registers.flags.C
    );

    addressBus[registers.HL].byte = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 16;
  },

  // RL A
  0x17: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.A,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RR B
  0x18: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.B,
      registers.flags.C
    );

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RR C
  0x19: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.C,
      registers.flags.C
    );

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RR D
  0x1A: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.D,
      registers.flags.C
    );

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RR E
  0x1B: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.E,
      registers.flags.C
    );

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RR H
  0x1C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.H,
      registers.flags.C
    );

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RR L
  0x1D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.L,
      registers.flags.C
    );

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // RR (HL)
  0x1E: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      addressBus[registers.HL].byte,
      registers.flags.C
    );

    addressBus[registers.HL].byte = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 16;
  },

  // RR A
  0x1F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.A,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SLA B
  0x20: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SLA C
  0x21: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SLA D
  0x22: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SLA E
  0x23: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SLA H
  0x24: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SLA L
  0x25: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SLA (HL)
  0x26: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(
      addressBus[registers.HL].byte
    );

    addressBus[registers.HL].byte = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 16;
  },

  // SLA A
  0x27: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRA B
  0x28: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRA C
  0x29: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRA D
  0x2A: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRA E
  0x2B: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRA H
  0x2C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRA L
  0x2D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRA (HL)
  0x2E: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(
      addressBus[registers.HL].byte
    );

    addressBus[registers.HL].byte = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 16;
  },

  // SRA A
  0x2F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SWAP B
  0x30: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    return 8;
  },

  // SWAP C
  0x31: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    return 8;
  },

  // SWAP D
  0x32: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    return 8;
  },

  // SWAP E
  0x33: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    return 8;
  },

  // SWAP H
  0x34: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    return 8;
  },

  // SWAP L
  0x35: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    return 8;
  },

  // SWAP (HL)
  0x36: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(
      addressBus[registers.HL].byte
    );

    addressBus[registers.HL].byte = value;
    registers.flags.Z = Z;
    return 16;
  },

  // SWAP A
  0x37: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    return 8;
  },

  // SRL B
  0x38: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRL C
  0x39: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRL D
  0x3A: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRL E
  0x3B: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRL H
  0x3C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRL L
  0x3D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // SRL (HL)
  0x3E: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(
      addressBus[registers.HL].byte
    );

    addressBus[registers.HL].byte = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 16;
  },

  // SRL A
  0x3F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 8;
  },

  // BIT 0,B
  0x40: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 0,C
  0x41: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 0,D
  0x42: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 0,E
  0x43: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 0,H
  0x44: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 0,L
  0x45: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 0,(HL)
  0x46: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, addressBus[registers.HL].byte);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 16;
  },

  // BIT 0,A
  0x47: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 1,B
  0x48: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 1,C
  0x49: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 1,D
  0x4A: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 1,E
  0x4B: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 1,H
  0x4C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 1,L
  0x4D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 1,(HL)
  0x4E: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, addressBus[registers.HL].byte);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 16;
  },

  // BIT 1,A
  0x4F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 2,B
  0x50: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 2,C
  0x51: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 2,D
  0x52: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 2,E
  0x53: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 2,H
  0x54: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 2,L
  0x55: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 2,(HL)
  0x56: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, addressBus[registers.HL].byte);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 16;
  },

  // BIT 2,A
  0x57: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 3,B
  0x58: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 3,C
  0x59: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 3,D
  0x5A: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 3,E
  0x5B: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 3,H
  0x5C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 3,L
  0x5D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 3,(HL)
  0x5E: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, addressBus[registers.HL].byte);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 16;
  },

  // BIT 3,A
  0x5F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 4,B
  0x60: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 4,C
  0x61: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 4,D
  0x62: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 4,E
  0x63: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 4,H
  0x64: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 4,L
  0x65: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 4,(HL)
  0x66: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, addressBus[registers.HL].byte);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 16;
  },

  // BIT 4,A
  0x67: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 5,B
  0x68: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 5,C
  0x69: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 5,D
  0x6A: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 5,E
  0x6B: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 5,H
  0x6C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 5,L
  0x6D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 5,(HL)
  0x6E: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, addressBus[registers.HL].byte);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 16;
  },

  // BIT 5,A
  0x6F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 6,B
  0x70: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 6,C
  0x71: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 6,D
  0x72: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 6,E
  0x73: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 6,H
  0x74: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 6,L
  0x75: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 6,(HL)
  0x76: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, addressBus[registers.HL].byte);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 16;
  },

  // BIT 6,A
  0x77: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 7,B
  0x78: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 7,C
  0x79: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 7,D
  0x7A: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 7,E
  0x7B: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 7,H
  0x7C: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 7,L
  0x7D: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // BIT 7,(HL)
  0x7E: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, addressBus[registers.HL].byte);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 16;
  },

  // BIT 7,A
  0x7F: (registers: CpuRegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 8;
  },

  // RES 0,B
  0x80: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(0, registers.B).value;
    return 8;
  },

  // RES 0,C
  0x81: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(0, registers.C).value;
    return 8;
  },

  // RES 0,D
  0x82: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(0, registers.D).value;
    return 8;
  },

  // RES 0,E
  0x83: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(0, registers.E).value;
    return 8;
  },

  // RES 0,H
  0x84: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(0, registers.H).value;
    return 8;
  },

  // RES 0,L
  0x85: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(0, registers.L).value;
    return 8;
  },

  // RES 0,(HL)
  0x86: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.res(0, addressBus[registers.HL].byte).value;
    return 16;
  },

  // RES 0,A
  0x87: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(0, registers.A).value;
    return 8;
  },

  // RES 1,B
  0x88: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(1, registers.B).value;
    return 8;
  },

  // RES 1,C
  0x89: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(1, registers.C).value;
    return 8;
  },

  // RES 1,D
  0x8A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(1, registers.D).value;
    return 8;
  },

  // RES 1,E
  0x8B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(1, registers.E).value;
    return 8;
  },

  // RES 1,H
  0x8C: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(1, registers.H).value;
    return 8;
  },

  // RES 1,L
  0x8D: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(1, registers.L).value;
    return 8;
  },

  // RES 1,(HL)
  0x8E: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.res(1, addressBus[registers.HL].byte).value;
    return 16;
  },

  // RES 1,A
  0x8F: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(1, registers.A).value;
    return 8;
  },

  // RES 2,B
  0x90: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(2, registers.B).value;
    return 8;
  },

  // RES 2,C
  0x91: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(2, registers.C).value;
    return 8;
  },

  // RES 2,D
  0x92: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(2, registers.B).value;
    return 8;
  },

  // RES 2,E
  0x93: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(2, registers.E).value;
    return 8;
  },

  // RES 2,H
  0x94: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(2, registers.H).value;
    return 8;
  },

  // RES 2,L
  0x95: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(2, registers.L).value;
    return 8;
  },

  // RES 2,(HL)
  0x96: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.res(2, addressBus[registers.HL].byte).value;
    return 16;
  },

  // RES 2,A
  0x97: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(2, registers.A).value;
    return 8;
  },

  // RES 3,B
  0x98: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(3, registers.B).value;
    return 8;
  },

  // RES 3,C
  0x99: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(3, registers.C).value;
    return 8;
  },

  // RES 3,D
  0x9A: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(3, registers.D).value;
    return 8;
  },

  // RES 3,E
  0x9B: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(3, registers.E).value;
    return 8;
  },

  // RES 3,H
  0x9C: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(3, registers.H).value;
    return 8;
  },

  // RES 3,L
  0x9D: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(3, registers.L).value;
    return 8;
  },

  // RES 3,(HL)
  0x9E: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.res(3, addressBus[registers.HL].byte).value;
    return 16;
  },

  // RES 3,A
  0x9F: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(3, registers.A).value;
    return 8;
  },

  // RES 4,B
  0xA0: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(4, registers.B).value;
    return 8;
  },

  // RES 4,C
  0xA1: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(4, registers.C).value;
    return 8;
  },

  // RES 4,D
  0xA2: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(4, registers.D).value;
    return 8;
  },

  // RES 4,E
  0xA3: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(4, registers.E).value;
    return 8;
  },

  // RES 4,H
  0xA4: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(4, registers.H).value;
    return 8;
  },

  // RES 4,L
  0xA5: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(4, registers.L).value;
    return 8;
  },

  // RES 4,(HL)
  0xA6: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.res(4, addressBus[registers.HL].byte).value;
    return 16;
  },

  // RES 4,A
  0xA7: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(4, registers.A).value;
    return 8;
  },

  // RES 5,B
  0xA8: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(5, registers.B).value;
    return 8;
  },

  // RES 5,C
  0xA9: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(5, registers.C).value;
    return 8;
  },

  // RES 5,D
  0xAA: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(5, registers.D).value;
    return 8;
  },

  // RES 5,E
  0xAB: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(5, registers.E).value;
    return 8;
  },

  // RES 5,H
  0xAC: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(5, registers.H).value;
    return 8;
  },

  // RES 5,L
  0xAD: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(5, registers.L).value;
    return 8;
  },

  // RES 5,(HL)
  0xAE: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.res(5, addressBus[registers.HL].byte).value;
    return 16;
  },

  // RES 5,A
  0xAF: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(5, registers.A).value;
    return 8;
  },

  // RES 6,B
  0xB0: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(6, registers.B).value;
    return 8;
  },

  // RES 6,C
  0xB1: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(6, registers.C).value;
    return 8;
  },

  // RES 6,D
  0xB2: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(6, registers.D).value;
    return 8;
  },

  // RES 6,E
  0xB3: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(6, registers.E).value;
    return 8;
  },

  // RES 6,H
  0xB4: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(6, registers.H).value;
    return 8;
  },

  // RES 6,L
  0xB5: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(6, registers.L).value;
    return 8;
  },

  // RES 6,(HL)
  0xB6: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.res(6, addressBus[registers.HL].byte).value;
    return 16;
  },

  // RES 6,A
  0xB7: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(6, registers.A).value;
    return 8;
  },

  // RES 7,B
  0xB8: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(7, registers.B).value;
    return 8;
  },

  // RES 7,C
  0xB9: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(7, registers.C).value;
    return 8;
  },

  // RES 7,D
  0xBA: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(7, registers.D).value;
    return 8;
  },

  // RES 7,E
  0xBB: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(7, registers.E).value;
    return 8;
  },

  // RES 7,H
  0xBC: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(7, registers.H).value;
    return 8;
  },

  // RES 7,L
  0xBD: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(7, registers.L).value;
    return 8;
  },

  // RES 7,(HL)
  0xBE: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.res(7, addressBus[registers.HL].byte).value;
    return 16;
  },

  // RES 7,A
  0xBF: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(7, registers.A).value;
    return 8;
  },

  // SET 0,B
  0xC0: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(0, registers.B).value;
    return 8;
  },

  // SET 0,C
  0xC1: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(0, registers.C).value;
    return 8;
  },

  // SET 0,D
  0xC2: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(0, registers.D).value;
    return 8;
  },

  // SET 0,E
  0xC3: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(0, registers.E).value;
    return 8;
  },

  // SET 0,H
  0xC4: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(0, registers.H).value;
    return 8;
  },

  // SET 0,L
  0xC5: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(0, registers.L).value;
    return 8;
  },

  // SET 0,(HL)
  0xC6: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.set(0, addressBus[registers.HL].byte).value;
    return 16;
  },

  // SET 0,A
  0xC7: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(0, registers.A).value;
    return 8;
  },

  // SET 1,B
  0xC8: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(1, registers.B).value;
    return 8;
  },

  // SET 1,C
  0xC9: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(1, registers.C).value;
    return 8;
  },

  // SET 1,D
  0xCA: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(1, registers.D).value;
    return 8;
  },

  // SET 1,E
  0xCB: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(1, registers.E).value;
    return 8;
  },

  // SET 1,H
  0xCC: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(1, registers.H).value;
    return 8;
  },

  // SET 1,L
  0xCD: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(1, registers.L).value;
    return 8;
  },

  // SET 1,(HL)
  0xCE: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.set(1, addressBus[registers.HL].byte).value;
    return 16;
  },

  // SET 1,A
  0xCF: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(1, registers.A).value;
    return 8;
  },

  // SET 2,B
  0xD0: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(2, registers.B).value;
    return 8;
  },

  // SET 2,C
  0xD1: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(2, registers.C).value;
    return 8;
  },

  // SET 2,D
  0xD2: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(2, registers.D).value;
    return 8;
  },

  // SET 2,E
  0xD3: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(2, registers.E).value;
    return 8;
  },

  // SET 2,H
  0xD4: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(2, registers.H).value;
    return 8;
  },

  // SET 2,L
  0xD5: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(2, registers.L).value;
    return 8;
  },

  // SET 2,(HL)
  0xD6: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.set(2, addressBus[registers.HL].byte).value;
    return 16;
  },

  // SET 2,A
  0xD7: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(2, registers.A).value;
    return 8;
  },

  // SET 3,B
  0xD8: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(3, registers.B).value;
    return 8;
  },

  // SET 3,C
  0xD9: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(3, registers.C).value;
    return 8;
  },

  // SET 3,D
  0xDA: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(3, registers.D).value;
    return 8;
  },

  // SET 3,E
  0xDB: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(3, registers.E).value;
    return 8;
  },

  // SET 3,H
  0xDC: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(3, registers.H).value;
    return 8;
  },

  // SET 3,L
  0xDD: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(3, registers.L).value;
    return 8;
  },

  // SET 3,(HL)
  0xDE: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.set(3, addressBus[registers.HL].byte).value;
    return 16;
  },

  // SET 3,A
  0xDF: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(3, registers.A).value;
    return 8;
  },

  // SET 4,B
  0xE0: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(4, registers.B).value;
    return 8;
  },

  // SET 4,C
  0xE1: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(4, registers.C).value;
    return 8;
  },

  // SET 4,D
  0xE2: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(4, registers.D).value;
    return 8;
  },

  // SET 4,E
  0xE3: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(4, registers.E).value;
    return 8;
  },

  // SET 4,H
  0xE4: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(4, registers.H).value;
    return 8;
  },

  // SET 4,L
  0xE5: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(4, registers.L).value;
    return 8;
  },

  // SET 4,(HL)
  0xE6: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.set(4, addressBus[registers.HL].byte).value;
    return 16;
  },

  // SET 4,A
  0xE7: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(4, registers.A).value;
    return 8;
  },

  // SET 5,B
  0xE8: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(5, registers.B).value;
    return 8;
  },

  // SET 5,C
  0xE9: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(5, registers.C).value;
    return 8;
  },

  // SET 5,D
  0xEA: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(5, registers.D).value;
    return 8;
  },

  // SET 5,E
  0xEB: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(5, registers.E).value;
    return 8;
  },

  // SET 5,H
  0xEC: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(5, registers.H).value;
    return 8;
  },

  // SET 5,L
  0xED: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(5, registers.L).value;
    return 8;
  },

  // SET 5,(HL)
  0xEE: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.set(5, addressBus[registers.HL].byte).value;
    return 16;
  },

  // SET 5,A
  0xEF: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(5, registers.A).value;
    return 8;
  },

  // SET 6,B
  0xF0: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(6, registers.B).value;
    return 8;
  },

  // SET 6,C
  0xF1: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(6, registers.C).value;
    return 8;
  },

  // SET 6,D
  0xF2: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(6, registers.D).value;
    return 8;
  },

  // SET 6,E
  0xF3: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(6, registers.E).value;
    return 8;
  },

  // SET 6,H
  0xF4: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(6, registers.H).value;
    return 8;
  },

  // SET 6,L
  0xF5: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(6, registers.L).value;
    return 8;
  },

  // SET 6,(HL)
  0xF6: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.set(6, addressBus[registers.HL].byte).value;
    return 16;
  },

  // SET 6,A
  0xF7: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(6, registers.A).value;
    return 8;
  },

  // SET 7,B
  0xF8: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(7, registers.B).value;
    return 8;
  },

  // SET 7,C
  0xF9: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(7, registers.C).value;
    return 8;
  },

  // SET 7,D
  0xFA: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(7, registers.D).value;
    return 8;
  },

  // SET 7,E
  0xFB: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(7, registers.E).value;
    return 8;
  },

  // SET 7,H
  0xFC: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(7, registers.H).value;
    return 8;
  },

  // SET 7,L
  0xFD: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(7, registers.L).value;
    return 8;
  },

  // SET 7,(HL)
  0xFE: (registers: CpuRegisters, addressBus: AddressBus) => {
    addressBus[registers.HL].byte = ALU.set(7, addressBus[registers.HL].byte).value;
    return 16;
  },

  // SET 7,A
  0xFF: (registers: CpuRegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(7, registers.A).value;
    return 8;
  },
};
