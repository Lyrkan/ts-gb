import { IOpcodesMap, IOpcodesNamesMap } from '../opcodes';
import { CPURegisters } from '../cpu-registers';
import { AddressBus } from '../../memory/address-bus';
import { ALU } from '../alu';

export const OPCODES_0XCB: IOpcodesMap = {
  // RLC B
  0x00: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RLC C
  0x01: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RLC D
  0x02: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RLC E
  0x03: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RLC H
  0x04: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RLC L
  0x05: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RLC (HL)
  0x06: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(
      addressBus.getByte(registers.HL)
    );

    addressBus.setByte(registers.HL, value);
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 4;
  },

  // RLC A
  0x07: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rlc(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RRC B
  0x08: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RRC C
  0x09: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RRC D
  0x0A: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RRC E
  0x0B: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RRC H
  0x0C: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RRC L
  0x0D: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RRC (HL)
  0x0E: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(
      addressBus.getByte(registers.HL)
    );

    addressBus.setByte(registers.HL, value);
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 4;
  },

  // RRC A
  0x0F: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rrc(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RL B
  0x10: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.B,
      registers.flags.C
    );

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RL C
  0x11: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.C,
      registers.flags.C
    );

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RL D
  0x12: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.D,
      registers.flags.C
    );

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RL E
  0x13: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.E,
      registers.flags.C
    );

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RL H
  0x14: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.H,
      registers.flags.C
    );

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RL L
  0x15: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.L,
      registers.flags.C
    );

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RL (HL)
  0x16: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      addressBus.getByte(registers.HL),
      registers.flags.C
    );

    addressBus.setByte(registers.HL, value);
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 4;
  },

  // RL A
  0x17: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rl(
      registers.A,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RR B
  0x18: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.B,
      registers.flags.C
    );

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RR C
  0x19: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.C,
      registers.flags.C
    );

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RR D
  0x1A: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.D,
      registers.flags.C
    );

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RR E
  0x1B: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.E,
      registers.flags.C
    );

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RR H
  0x1C: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.H,
      registers.flags.C
    );

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RR L
  0x1D: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.L,
      registers.flags.C
    );

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // RR (HL)
  0x1E: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      addressBus.getByte(registers.HL),
      registers.flags.C
    );

    addressBus.setByte(registers.HL, value);
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 4;
  },

  // RR A
  0x1F: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.rr(
      registers.A,
      registers.flags.C
    );

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SLA B
  0x20: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SLA C
  0x21: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SLA D
  0x22: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SLA E
  0x23: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SLA H
  0x24: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SLA L
  0x25: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SLA (HL)
  0x26: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(
      addressBus.getByte(registers.HL)
    );

    addressBus.setByte(registers.HL, value);
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 4;
  },

  // SLA A
  0x27: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sla(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRA B
  0x28: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRA C
  0x29: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRA D
  0x2A: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRA E
  0x2B: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRA H
  0x2C: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRA L
  0x2D: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRA (HL)
  0x2E: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(
      addressBus.getByte(registers.HL)
    );

    addressBus.setByte(registers.HL, value);
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 4;
  },

  // SRA A
  0x2F: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.sra(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SWAP B
  0x30: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = 0;
    return 2;
  },

  // SWAP C
  0x31: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = 0;
    return 2;
  },

  // SWAP D
  0x32: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = 0;
    return 2;
  },

  // SWAP E
  0x33: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = 0;
    return 2;
  },

  // SWAP H
  0x34: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = 0;
    return 2;
  },

  // SWAP L
  0x35: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = 0;
    return 2;
  },

  // SWAP (HL)
  0x36: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(
      addressBus.getByte(registers.HL)
    );

    addressBus.setByte(registers.HL, value);
    registers.flags.Z = Z;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = 0;
    return 4;
  },

  // SWAP A
  0x37: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z } = ALU.swap(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.N = 0;
    registers.flags.H = 0;
    registers.flags.C = 0;
    return 2;
  },

  // SRL B
  0x38: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.B);

    registers.B = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRL C
  0x39: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.C);

    registers.C = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRL D
  0x3A: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.D);

    registers.D = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRL E
  0x3B: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.E);

    registers.E = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRL H
  0x3C: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.H);

    registers.H = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRL L
  0x3D: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.L);

    registers.L = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // SRL (HL)
  0x3E: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(
      addressBus.getByte(registers.HL)
    );

    addressBus.setByte(registers.HL, value);
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 4;
  },

  // SRL A
  0x3F: (registers: CPURegisters, addressBus: AddressBus) => {
    const { value, Z, H, N, C } = ALU.srl(registers.A);

    registers.A = value;
    registers.flags.Z = Z;
    registers.flags.H = H;
    registers.flags.N = N;
    registers.flags.C = C;
    return 2;
  },

  // BIT 0,B
  0x40: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 0,C
  0x41: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 0,D
  0x42: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 0,E
  0x43: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 0,H
  0x44: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 0,L
  0x45: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 0,(HL)
  0x46: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, addressBus.getByte(registers.HL));

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 3;
  },

  // BIT 0,A
  0x47: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(0, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 1,B
  0x48: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 1,C
  0x49: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 1,D
  0x4A: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 1,E
  0x4B: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 1,H
  0x4C: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 1,L
  0x4D: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 1,(HL)
  0x4E: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, addressBus.getByte(registers.HL));

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 3;
  },

  // BIT 1,A
  0x4F: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(1, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 2,B
  0x50: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 2,C
  0x51: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 2,D
  0x52: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 2,E
  0x53: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 2,H
  0x54: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 2,L
  0x55: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 2,(HL)
  0x56: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, addressBus.getByte(registers.HL));

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 3;
  },

  // BIT 2,A
  0x57: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(2, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 3,B
  0x58: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 3,C
  0x59: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 3,D
  0x5A: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 3,E
  0x5B: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 3,H
  0x5C: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 3,L
  0x5D: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 3,(HL)
  0x5E: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, addressBus.getByte(registers.HL));

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 3;
  },

  // BIT 3,A
  0x5F: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(3, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 4,B
  0x60: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 4,C
  0x61: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 4,D
  0x62: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 4,E
  0x63: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 4,H
  0x64: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 4,L
  0x65: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 4,(HL)
  0x66: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, addressBus.getByte(registers.HL));

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 3;
  },

  // BIT 4,A
  0x67: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(4, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 5,B
  0x68: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 5,C
  0x69: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 5,D
  0x6A: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 5,E
  0x6B: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 5,H
  0x6C: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 5,L
  0x6D: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 5,(HL)
  0x6E: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, addressBus.getByte(registers.HL));

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 3;
  },

  // BIT 5,A
  0x6F: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(5, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 6,B
  0x70: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 6,C
  0x71: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 6,D
  0x72: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 6,E
  0x73: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 6,H
  0x74: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 6,L
  0x75: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 6,(HL)
  0x76: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, addressBus.getByte(registers.HL));

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 3;
  },

  // BIT 6,A
  0x77: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(6, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 7,B
  0x78: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.B);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 7,C
  0x79: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.C);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 7,D
  0x7A: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.D);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 7,E
  0x7B: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.E);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 7,H
  0x7C: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.H);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 7,L
  0x7D: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.L);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // BIT 7,(HL)
  0x7E: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, addressBus.getByte(registers.HL));

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 3;
  },

  // BIT 7,A
  0x7F: (registers: CPURegisters, addressBus: AddressBus) => {
    const { Z, N, H } = ALU.bit(7, registers.A);

    registers.flags.Z = Z;
    registers.flags.N = N;
    registers.flags.H = H;
    return 2;
  },

  // RES 0,B
  0x80: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(0, registers.B).value;
    return 2;
  },

  // RES 0,C
  0x81: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(0, registers.C).value;
    return 2;
  },

  // RES 0,D
  0x82: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(0, registers.D).value;
    return 2;
  },

  // RES 0,E
  0x83: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(0, registers.E).value;
    return 2;
  },

  // RES 0,H
  0x84: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(0, registers.H).value;
    return 2;
  },

  // RES 0,L
  0x85: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(0, registers.L).value;
    return 2;
  },

  // RES 0,(HL)
  0x86: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.res(0, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // RES 0,A
  0x87: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(0, registers.A).value;
    return 2;
  },

  // RES 1,B
  0x88: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(1, registers.B).value;
    return 2;
  },

  // RES 1,C
  0x89: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(1, registers.C).value;
    return 2;
  },

  // RES 1,D
  0x8A: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(1, registers.D).value;
    return 2;
  },

  // RES 1,E
  0x8B: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(1, registers.E).value;
    return 2;
  },

  // RES 1,H
  0x8C: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(1, registers.H).value;
    return 2;
  },

  // RES 1,L
  0x8D: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(1, registers.L).value;
    return 2;
  },

  // RES 1,(HL)
  0x8E: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.res(1, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // RES 1,A
  0x8F: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(1, registers.A).value;
    return 2;
  },

  // RES 2,B
  0x90: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(2, registers.B).value;
    return 2;
  },

  // RES 2,C
  0x91: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(2, registers.C).value;
    return 2;
  },

  // RES 2,D
  0x92: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(2, registers.D).value;
    return 2;
  },

  // RES 2,E
  0x93: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(2, registers.E).value;
    return 2;
  },

  // RES 2,H
  0x94: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(2, registers.H).value;
    return 2;
  },

  // RES 2,L
  0x95: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(2, registers.L).value;
    return 2;
  },

  // RES 2,(HL)
  0x96: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.res(2, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // RES 2,A
  0x97: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(2, registers.A).value;
    return 2;
  },

  // RES 3,B
  0x98: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(3, registers.B).value;
    return 2;
  },

  // RES 3,C
  0x99: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(3, registers.C).value;
    return 2;
  },

  // RES 3,D
  0x9A: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(3, registers.D).value;
    return 2;
  },

  // RES 3,E
  0x9B: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(3, registers.E).value;
    return 2;
  },

  // RES 3,H
  0x9C: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(3, registers.H).value;
    return 2;
  },

  // RES 3,L
  0x9D: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(3, registers.L).value;
    return 2;
  },

  // RES 3,(HL)
  0x9E: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.res(3, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // RES 3,A
  0x9F: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(3, registers.A).value;
    return 2;
  },

  // RES 4,B
  0xA0: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(4, registers.B).value;
    return 2;
  },

  // RES 4,C
  0xA1: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(4, registers.C).value;
    return 2;
  },

  // RES 4,D
  0xA2: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(4, registers.D).value;
    return 2;
  },

  // RES 4,E
  0xA3: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(4, registers.E).value;
    return 2;
  },

  // RES 4,H
  0xA4: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(4, registers.H).value;
    return 2;
  },

  // RES 4,L
  0xA5: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(4, registers.L).value;
    return 2;
  },

  // RES 4,(HL)
  0xA6: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.res(4, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // RES 4,A
  0xA7: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(4, registers.A).value;
    return 2;
  },

  // RES 5,B
  0xA8: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(5, registers.B).value;
    return 2;
  },

  // RES 5,C
  0xA9: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(5, registers.C).value;
    return 2;
  },

  // RES 5,D
  0xAA: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(5, registers.D).value;
    return 2;
  },

  // RES 5,E
  0xAB: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(5, registers.E).value;
    return 2;
  },

  // RES 5,H
  0xAC: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(5, registers.H).value;
    return 2;
  },

  // RES 5,L
  0xAD: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(5, registers.L).value;
    return 2;
  },

  // RES 5,(HL)
  0xAE: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.res(5, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // RES 5,A
  0xAF: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(5, registers.A).value;
    return 2;
  },

  // RES 6,B
  0xB0: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(6, registers.B).value;
    return 2;
  },

  // RES 6,C
  0xB1: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(6, registers.C).value;
    return 2;
  },

  // RES 6,D
  0xB2: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(6, registers.D).value;
    return 2;
  },

  // RES 6,E
  0xB3: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(6, registers.E).value;
    return 2;
  },

  // RES 6,H
  0xB4: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(6, registers.H).value;
    return 2;
  },

  // RES 6,L
  0xB5: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(6, registers.L).value;
    return 2;
  },

  // RES 6,(HL)
  0xB6: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.res(6, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // RES 6,A
  0xB7: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(6, registers.A).value;
    return 2;
  },

  // RES 7,B
  0xB8: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.res(7, registers.B).value;
    return 2;
  },

  // RES 7,C
  0xB9: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.res(7, registers.C).value;
    return 2;
  },

  // RES 7,D
  0xBA: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.res(7, registers.D).value;
    return 2;
  },

  // RES 7,E
  0xBB: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.res(7, registers.E).value;
    return 2;
  },

  // RES 7,H
  0xBC: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.res(7, registers.H).value;
    return 2;
  },

  // RES 7,L
  0xBD: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.res(7, registers.L).value;
    return 2;
  },

  // RES 7,(HL)
  0xBE: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.res(7, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // RES 7,A
  0xBF: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.res(7, registers.A).value;
    return 2;
  },

  // SET 0,B
  0xC0: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(0, registers.B).value;
    return 2;
  },

  // SET 0,C
  0xC1: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(0, registers.C).value;
    return 2;
  },

  // SET 0,D
  0xC2: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(0, registers.D).value;
    return 2;
  },

  // SET 0,E
  0xC3: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(0, registers.E).value;
    return 2;
  },

  // SET 0,H
  0xC4: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(0, registers.H).value;
    return 2;
  },

  // SET 0,L
  0xC5: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(0, registers.L).value;
    return 2;
  },

  // SET 0,(HL)
  0xC6: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.set(0, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // SET 0,A
  0xC7: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(0, registers.A).value;
    return 2;
  },

  // SET 1,B
  0xC8: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(1, registers.B).value;
    return 2;
  },

  // SET 1,C
  0xC9: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(1, registers.C).value;
    return 2;
  },

  // SET 1,D
  0xCA: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(1, registers.D).value;
    return 2;
  },

  // SET 1,E
  0xCB: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(1, registers.E).value;
    return 2;
  },

  // SET 1,H
  0xCC: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(1, registers.H).value;
    return 2;
  },

  // SET 1,L
  0xCD: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(1, registers.L).value;
    return 2;
  },

  // SET 1,(HL)
  0xCE: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.set(1, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // SET 1,A
  0xCF: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(1, registers.A).value;
    return 2;
  },

  // SET 2,B
  0xD0: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(2, registers.B).value;
    return 2;
  },

  // SET 2,C
  0xD1: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(2, registers.C).value;
    return 2;
  },

  // SET 2,D
  0xD2: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(2, registers.D).value;
    return 2;
  },

  // SET 2,E
  0xD3: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(2, registers.E).value;
    return 2;
  },

  // SET 2,H
  0xD4: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(2, registers.H).value;
    return 2;
  },

  // SET 2,L
  0xD5: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(2, registers.L).value;
    return 2;
  },

  // SET 2,(HL)
  0xD6: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.set(2, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // SET 2,A
  0xD7: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(2, registers.A).value;
    return 2;
  },

  // SET 3,B
  0xD8: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(3, registers.B).value;
    return 2;
  },

  // SET 3,C
  0xD9: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(3, registers.C).value;
    return 2;
  },

  // SET 3,D
  0xDA: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(3, registers.D).value;
    return 2;
  },

  // SET 3,E
  0xDB: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(3, registers.E).value;
    return 2;
  },

  // SET 3,H
  0xDC: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(3, registers.H).value;
    return 2;
  },

  // SET 3,L
  0xDD: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(3, registers.L).value;
    return 2;
  },

  // SET 3,(HL)
  0xDE: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.set(3, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // SET 3,A
  0xDF: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(3, registers.A).value;
    return 2;
  },

  // SET 4,B
  0xE0: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(4, registers.B).value;
    return 2;
  },

  // SET 4,C
  0xE1: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(4, registers.C).value;
    return 2;
  },

  // SET 4,D
  0xE2: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(4, registers.D).value;
    return 2;
  },

  // SET 4,E
  0xE3: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(4, registers.E).value;
    return 2;
  },

  // SET 4,H
  0xE4: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(4, registers.H).value;
    return 2;
  },

  // SET 4,L
  0xE5: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(4, registers.L).value;
    return 2;
  },

  // SET 4,(HL)
  0xE6: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.set(4, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // SET 4,A
  0xE7: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(4, registers.A).value;
    return 2;
  },

  // SET 5,B
  0xE8: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(5, registers.B).value;
    return 2;
  },

  // SET 5,C
  0xE9: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(5, registers.C).value;
    return 2;
  },

  // SET 5,D
  0xEA: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(5, registers.D).value;
    return 2;
  },

  // SET 5,E
  0xEB: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(5, registers.E).value;
    return 2;
  },

  // SET 5,H
  0xEC: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(5, registers.H).value;
    return 2;
  },

  // SET 5,L
  0xED: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(5, registers.L).value;
    return 2;
  },

  // SET 5,(HL)
  0xEE: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.set(5, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // SET 5,A
  0xEF: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(5, registers.A).value;
    return 2;
  },

  // SET 6,B
  0xF0: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(6, registers.B).value;
    return 2;
  },

  // SET 6,C
  0xF1: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(6, registers.C).value;
    return 2;
  },

  // SET 6,D
  0xF2: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(6, registers.D).value;
    return 2;
  },

  // SET 6,E
  0xF3: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(6, registers.E).value;
    return 2;
  },

  // SET 6,H
  0xF4: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(6, registers.H).value;
    return 2;
  },

  // SET 6,L
  0xF5: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(6, registers.L).value;
    return 2;
  },

  // SET 6,(HL)
  0xF6: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.set(6, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // SET 6,A
  0xF7: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(6, registers.A).value;
    return 2;
  },

  // SET 7,B
  0xF8: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.B = ALU.set(7, registers.B).value;
    return 2;
  },

  // SET 7,C
  0xF9: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.C = ALU.set(7, registers.C).value;
    return 2;
  },

  // SET 7,D
  0xFA: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.D = ALU.set(7, registers.D).value;
    return 2;
  },

  // SET 7,E
  0xFB: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.E = ALU.set(7, registers.E).value;
    return 2;
  },

  // SET 7,H
  0xFC: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.H = ALU.set(7, registers.H).value;
    return 2;
  },

  // SET 7,L
  0xFD: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.L = ALU.set(7, registers.L).value;
    return 2;
  },

  // SET 7,(HL)
  0xFE: (registers: CPURegisters, addressBus: AddressBus) => {
    addressBus.setByte(registers.HL, ALU.set(7, addressBus.getByte(registers.HL)).value);
    return 4;
  },

  // SET 7,A
  0xFF: (registers: CPURegisters, addressBus: AddressBus) => {
    registers.A = ALU.set(7, registers.A).value;
    return 2;
  },
};

export const OPCODES_0XCB_NAMES: IOpcodesNamesMap  = {
  0x00: 'RLC B',
  0x01: 'RLC C',
  0x02: 'RLC D',
  0x03: 'RLC E',
  0x04: 'RLC H',
  0x05: 'RLC L',
  0x06: 'RLC (HL)',
  0x07: 'RLC A',
  0x08: 'RRC B',
  0x09: 'RRC C',
  0x0A: 'RRC D',
  0x0B: 'RRC E',
  0x0C: 'RRC H',
  0x0D: 'RRC L',
  0x0E: 'RRC (HL)',
  0x0F: 'RRC A',
  0x10: 'RL B',
  0x11: 'RL C',
  0x12: 'RL D',
  0x13: 'RL E',
  0x14: 'RL H',
  0x15: 'RL L',
  0x16: 'RL (HL)',
  0x17: 'RL A',
  0x18: 'RR B',
  0x19: 'RR C',
  0x1A: 'RR D',
  0x1B: 'RR E',
  0x1C: 'RR H',
  0x1D: 'RR L',
  0x1E: 'RR (HL)',
  0x1F: 'RR A',
  0x20: 'SLA B',
  0x21: 'SLA C',
  0x22: 'SLA D',
  0x23: 'SLA E',
  0x24: 'SLA H',
  0x25: 'SLA L',
  0x26: 'SLA (HL)',
  0x27: 'SLA A',
  0x28: 'SRA B',
  0x29: 'SRA C',
  0x2A: 'SRA D',
  0x2B: 'SRA E',
  0x2C: 'SRA H',
  0x2D: 'SRA L',
  0x2E: 'SRA (HL)',
  0x2F: 'SRA A',
  0x30: 'SWAP B',
  0x31: 'SWAP C',
  0x32: 'SWAP D',
  0x33: 'SWAP E',
  0x34: 'SWAP H',
  0x35: 'SWAP L',
  0x36: 'SWAP (HL)',
  0x37: 'SWAP A',
  0x38: 'SRL B',
  0x39: 'SRL C',
  0x3A: 'SRL D',
  0x3B: 'SRL E',
  0x3C: 'SRL H',
  0x3D: 'SRL L',
  0x3E: 'SRL (HL)',
  0x3F: 'SRL A',
  0x40: 'BIT 0,B',
  0x41: 'BIT 0,C',
  0x42: 'BIT 0,D',
  0x43: 'BIT 0,E',
  0x44: 'BIT 0,H',
  0x45: 'BIT 0,L',
  0x46: 'BIT 0,(HL)',
  0x47: 'BIT 0,A',
  0x48: 'BIT 1,B',
  0x49: 'BIT 1,C',
  0x4A: 'BIT 1,D',
  0x4B: 'BIT 1,E',
  0x4C: 'BIT 1,H',
  0x4D: 'BIT 1,L',
  0x4E: 'BIT 1,(HL)',
  0x4F: 'BIT 1,A',
  0x50: 'BIT 2,B',
  0x51: 'BIT 2,C',
  0x52: 'BIT 2,D',
  0x53: 'BIT 2,E',
  0x54: 'BIT 2,H',
  0x55: 'BIT 2,L',
  0x56: 'BIT 2,(HL)',
  0x57: 'BIT 2,A',
  0x58: 'BIT 3,B',
  0x59: 'BIT 3,C',
  0x5A: 'BIT 3,D',
  0x5B: 'BIT 3,E',
  0x5C: 'BIT 3,H',
  0x5D: 'BIT 3,L',
  0x5E: 'BIT 3,(HL)',
  0x5F: 'BIT 3,A',
  0x60: 'BIT 4,B',
  0x61: 'BIT 4,C',
  0x62: 'BIT 4,D',
  0x63: 'BIT 4,E',
  0x64: 'BIT 4,H',
  0x65: 'BIT 4,L',
  0x66: 'BIT 4,(HL)',
  0x67: 'BIT 4,A',
  0x68: 'BIT 5,B',
  0x69: 'BIT 5,C',
  0x6A: 'BIT 5,D',
  0x6B: 'BIT 5,E',
  0x6C: 'BIT 5,H',
  0x6D: 'BIT 5,L',
  0x6E: 'BIT 5,(HL)',
  0x6F: 'BIT 5,A',
  0x70: 'BIT 6,B',
  0x71: 'BIT 6,C',
  0x72: 'BIT 6,D',
  0x73: 'BIT 6,E',
  0x74: 'BIT 6,H',
  0x75: 'BIT 6,L',
  0x76: 'BIT 6,(HL)',
  0x77: 'BIT 6,A',
  0x78: 'BIT 7,B',
  0x79: 'BIT 7,C',
  0x7A: 'BIT 7,D',
  0x7B: 'BIT 7,E',
  0x7C: 'BIT 7,H',
  0x7D: 'BIT 7,L',
  0x7E: 'BIT 7,(HL)',
  0x7F: 'BIT 7,A',
  0x80: 'RES 0,B',
  0x81: 'RES 0,C',
  0x82: 'RES 0,D',
  0x83: 'RES 0,E',
  0x84: 'RES 0,H',
  0x85: 'RES 0,L',
  0x86: 'RES 0,(HL)',
  0x87: 'RES 0,A',
  0x88: 'RES 1,B',
  0x89: 'RES 1,C',
  0x8A: 'RES 1,D',
  0x8B: 'RES 1,E',
  0x8C: 'RES 1,H',
  0x8D: 'RES 1,L',
  0x8E: 'RES 1,(HL)',
  0x8F: 'RES 1,A',
  0x90: 'RES 2,B',
  0x91: 'RES 2,C',
  0x92: 'RES 2,D',
  0x93: 'RES 2,E',
  0x94: 'RES 2,H',
  0x95: 'RES 2,L',
  0x96: 'RES 2,(HL)',
  0x97: 'RES 2,A',
  0x98: 'RES 3,B',
  0x99: 'RES 3,C',
  0x9A: 'RES 3,D',
  0x9B: 'RES 3,E',
  0x9C: 'RES 3,H',
  0x9D: 'RES 3,L',
  0x9E: 'RES 3,(HL)',
  0x9F: 'RES 3,A',
  0xA0: 'RES 4,B',
  0xA1: 'RES 4,C',
  0xA2: 'RES 4,D',
  0xA3: 'RES 4,E',
  0xA4: 'RES 4,H',
  0xA5: 'RES 4,L',
  0xA6: 'RES 4,(HL)',
  0xA7: 'RES 4,A',
  0xA8: 'RES 5,B',
  0xA9: 'RES 5,C',
  0xAA: 'RES 5,D',
  0xAB: 'RES 5,E',
  0xAC: 'RES 5,H',
  0xAD: 'RES 5,L',
  0xAE: 'RES 5,(HL)',
  0xAF: 'RES 5,A',
  0xB0: 'RES 6,B',
  0xB1: 'RES 6,C',
  0xB2: 'RES 6,D',
  0xB3: 'RES 6,E',
  0xB4: 'RES 6,H',
  0xB5: 'RES 6,L',
  0xB6: 'RES 6,(HL)',
  0xB7: 'RES 6,A',
  0xB8: 'RES 7,B',
  0xB9: 'RES 7,C',
  0xBA: 'RES 7,D',
  0xBB: 'RES 7,E',
  0xBC: 'RES 7,H',
  0xBD: 'RES 7,L',
  0xBE: 'RES 7,(HL)',
  0xBF: 'RES 7,A',
  0xC0: 'SET 0,B',
  0xC1: 'SET 0,C',
  0xC2: 'SET 0,D',
  0xC3: 'SET 0,E',
  0xC4: 'SET 0,H',
  0xC5: 'SET 0,L',
  0xC6: 'SET 0,(HL)',
  0xC7: 'SET 0,A',
  0xC8: 'SET 1,B',
  0xC9: 'SET 1,C',
  0xCA: 'SET 1,D',
  0xCB: 'SET 1,E',
  0xCC: 'SET 1,H',
  0xCD: 'SET 1,L',
  0xCE: 'SET 1,(HL)',
  0xCF: 'SET 1,A',
  0xD0: 'SET 2,B',
  0xD1: 'SET 2,C',
  0xD2: 'SET 2,D',
  0xD3: 'SET 2,E',
  0xD4: 'SET 2,H',
  0xD5: 'SET 2,L',
  0xD6: 'SET 2,(HL)',
  0xD7: 'SET 2,A',
  0xD8: 'SET 3,B',
  0xD9: 'SET 3,C',
  0xDA: 'SET 3,D',
  0xDB: 'SET 3,E',
  0xDC: 'SET 3,H',
  0xDD: 'SET 3,L',
  0xDE: 'SET 3,(HL)',
  0xDF: 'SET 3,A',
  0xE0: 'SET 4,B',
  0xE1: 'SET 4,C',
  0xE2: 'SET 4,D',
  0xE3: 'SET 4,E',
  0xE4: 'SET 4,H',
  0xE5: 'SET 4,L',
  0xE6: 'SET 4,(HL)',
  0xE7: 'SET 4,A',
  0xE8: 'SET 5,B',
  0xE9: 'SET 5,C',
  0xEA: 'SET 5,D',
  0xEB: 'SET 5,E',
  0xEC: 'SET 5,H',
  0xED: 'SET 5,L',
  0xEE: 'SET 5,(HL)',
  0xEF: 'SET 5,A',
  0xF0: 'SET 6,B',
  0xF1: 'SET 6,C',
  0xF2: 'SET 6,D',
  0xF3: 'SET 6,E',
  0xF4: 'SET 6,H',
  0xF5: 'SET 6,L',
  0xF6: 'SET 6,(HL)',
  0xF7: 'SET 6,A',
  0xF8: 'SET 7,B',
  0xF9: 'SET 7,C',
  0xFA: 'SET 7,D',
  0xFB: 'SET 7,E',
  0xFC: 'SET 7,H',
  0xFD: 'SET 7,L',
  0xFE: 'SET 7,(HL)',
  0xFF: 'SET 7,A',
};
