import 'mocha';
import { expect } from 'chai';
import { OPCODES_0XCB } from '../../../src/cpu/opcodes/opcodes-0xCB';
import { CpuRegisters } from '../../../src/cpu/cpu-registers';
import { AddressBus } from '../../../src/memory/address-bus';
import { GameCartridge } from '../../../src/cartridge/game-cartridge';

describe('Opcodes - 0xCB table', () => {
  let cpuRegisters: CpuRegisters;
  let addressBus: AddressBus;

  const executeNextOpcode = (expectedCycles: number) => {
    expect(addressBus.get(cpuRegisters.PC++).byte).to.equal(0xCB, '0xCB prefix not found');
    const cycles = OPCODES_0XCB[addressBus.get(cpuRegisters.PC++).byte](cpuRegisters, addressBus);
    expect(cycles).to.equal(expectedCycles, 'Unexpected cycles count');
  };

  const checkFlags = ({ Z, N, H, C }: { Z: number, N: number, H: number, C: number }) => {
    expect(cpuRegisters.flags.Z).to.equal(Z, 'Unexpected value for flag Z');
    expect(cpuRegisters.flags.N).to.equal(N, 'Unexpected value for flag N');
    expect(cpuRegisters.flags.H).to.equal(H, 'Unexpected value for flag H');
    expect(cpuRegisters.flags.C).to.equal(C, 'Unexpected value for flag C');
  };

  const checkRegisters = (checks: { [registerName: string]: number }) => {
    for (const registerName in checks) {
      if (checks.hasOwnProperty(registerName)) {
        expect((cpuRegisters as any)[registerName]).to.equal(
          checks[registerName],
          `Unexpected value for register ${registerName}`
        );
      }
    }
  };

  beforeEach(() => {
    cpuRegisters = new CpuRegisters();
    cpuRegisters.PC = 0x0000;
    cpuRegisters.SP = 0xFFFE;

    addressBus = new AddressBus();
    addressBus.loadCartridge(new GameCartridge(new ArrayBuffer(32 * 1024)));
  });

  it('0x00 - RLC B', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x00;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x00;

    cpuRegisters.B = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ B: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.B = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ B: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x01 - RLC C', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x01;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x01;

    cpuRegisters.C = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ C: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.C = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ C: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x02 - RLC D', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x02;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x02;

    cpuRegisters.D = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ D: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.D = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ D: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x03 - RLC E', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x03;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x03;

    cpuRegisters.E = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ E: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.E = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ E: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x04 - RLC H', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x04;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x04;

    cpuRegisters.H = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ H: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.H = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ H: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x05 - RLC L', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x05;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x05;

    cpuRegisters.L = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ L: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.L = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ L: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x06 - RLC (HL)', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x06;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x06;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0b10101010;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0b01010101);

    addressBus.get(0xC000).byte = 0b10000000;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0b00000001);
  });

  it('0x07 - RLC A', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x07;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x07;

    cpuRegisters.A = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ A: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ A: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x08 - RRC B', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x08;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x08;

    cpuRegisters.B = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ B: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.B = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ B: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x09 - RRC C', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x09;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x09;

    cpuRegisters.C = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ C: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.C = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ C: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x0A - RRC D', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x0A;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x0A;

    cpuRegisters.D = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ D: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.D = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ D: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x0B - RRC E', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x0B;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x0B;

    cpuRegisters.E = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ E: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.E = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ E: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x0C - RRC H', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x0C;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x0C;

    cpuRegisters.H = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ H: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.H = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ H: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x0D - RRC L', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x0D;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x0D;

    cpuRegisters.L = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ L: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.L = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ L: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x0E - RRC (HL)', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x0E;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x0E;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0b10101010;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.get(0xC000).byte).to.equal(0b01010101);

    addressBus.get(0xC000).byte = 0b10000000;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.get(0xC000).byte).to.equal(0b01000000);
  });

  it('0x0F - RRC A', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x0F;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x0F;

    cpuRegisters.A = 0b10101010;
    executeNextOpcode(8);
    checkRegisters({ A: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0b10000000;
    executeNextOpcode(8);
    checkRegisters({ A: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x10 - RL B', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x10;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x10;

    cpuRegisters.B = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ B: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.B = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ B: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x11 - RL C', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x11;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x11;

    cpuRegisters.C = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ C: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.C = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ C: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x12 - RL D', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x12;

    cpuRegisters.D = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ D: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.D = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ D: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x13 - RL E', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x13;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x13;

    cpuRegisters.E = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ E: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.E = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ E: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x14 - RL H', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x14;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x14;

    cpuRegisters.H = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ H: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.H = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ H: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x15 - RL L', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x15;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x15;

    cpuRegisters.L = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ L: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.L = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ L: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x16 - RL (HL)', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x16;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x16;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0b01010100);

    addressBus.get(0xC000).byte = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0b01010101);
  });

  it('0x17 - RL A', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x17;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x17;

    cpuRegisters.A = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ A: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ A: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x18 - RR B', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x18;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x18;

    cpuRegisters.B = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ B: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.B = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ B: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x19 - RR C', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x19;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x19;

    cpuRegisters.C = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ C: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.C = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ C: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x1A - RR D', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x1A;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x1A;

    cpuRegisters.D = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ D: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.D = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ D: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x1B - RR E', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x1B;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x1B;

    cpuRegisters.E = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ E: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.E = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ E: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x1C - RR H', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x1C;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x1C;

    cpuRegisters.H = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ H: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.H = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ H: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x1D - RR L', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x1D;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x1D;

    cpuRegisters.L = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ L: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.L = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ L: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x1E - RR (HL)', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x1E;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x1E;

    cpuRegisters.HL = 0xC000;

    addressBus.get(cpuRegisters.HL).byte = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.get(cpuRegisters.HL).byte).to.equal(0b01010101);

    addressBus.get(cpuRegisters.HL).byte = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.get(cpuRegisters.HL).byte).to.equal(0b11010101);
  });

  it('0x1F - RR A', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x1F;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x1F;

    cpuRegisters.A = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ A: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ A: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x20 - SLA B', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x20;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x20;

    cpuRegisters.B = 0b10000001;
    executeNextOpcode(8);
    checkRegisters({ B: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.B = 0b01010101;
    executeNextOpcode(8);
    checkRegisters({ B: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x21 - SLA C', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x21;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x21;

    cpuRegisters.C = 0b10000001;
    executeNextOpcode(8);
    checkRegisters({ C: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.C = 0b01010101;
    executeNextOpcode(8);
    checkRegisters({ C: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x22 - SLA D', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x22;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x22;

    cpuRegisters.D = 0b10000001;
    executeNextOpcode(8);
    checkRegisters({ D: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.D = 0b01010101;
    executeNextOpcode(8);
    checkRegisters({ D: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x23 - SLA E', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x23;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x23;

    cpuRegisters.E = 0b10000001;
    executeNextOpcode(8);
    checkRegisters({ E: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.E = 0b01010101;
    executeNextOpcode(8);
    checkRegisters({ E: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x24 - SLA H', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x24;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x24;

    cpuRegisters.H = 0b10000001;
    executeNextOpcode(8);
    checkRegisters({ H: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.H = 0b01010101;
    executeNextOpcode(8);
    checkRegisters({ H: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x25 - SLA L', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x25;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x25;

    cpuRegisters.L = 0b10000001;
    executeNextOpcode(8);
    checkRegisters({ L: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.L = 0b01010101;
    executeNextOpcode(8);
    checkRegisters({ L: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x26 - SLA (HL)', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x26;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x26;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0b10000001;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0b00000010);

    addressBus.get(0xC000).byte = 0b01010101;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.get(0xC000).byte).to.equal(0b10101010);
  });

  it('0x27 - SLA A', () => {
    addressBus.get(0x0000).byte = 0xCB;
    addressBus.get(0x0001).byte = 0x27;
    addressBus.get(0x0002).byte = 0xCB;
    addressBus.get(0x0003).byte = 0x27;

    cpuRegisters.A = 0b10000001;
    executeNextOpcode(8);
    checkRegisters({ A: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b01010101;
    executeNextOpcode(8);
    checkRegisters({ A: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x28 - SRA B');
  it('0x29 - SRA C');
  it('0x2A - SRA D');
  it('0x2B - SRA E');
  it('0x2C - SRA H');
  it('0x2D - SRA L');
  it('0x2E - SRA (HL)');
  it('0x2F - SRA A');
  it('0x30 - SWAP B');
  it('0x31 - SWAP C');
  it('0x32 - SWAP D');
  it('0x33 - SWAP E');
  it('0x34 - SWAP H');
  it('0x35 - SWAP L');
  it('0x36 - SWAP (HL)');
  it('0x37 - SWAP A');
  it('0x38 - SRL B');
  it('0x39 - SRL C');
  it('0x3A - SRL D');
  it('0x3B - SRL E');
  it('0x3C - SRL H');
  it('0x3D - SRL L');
  it('0x3E - SRL (HL)');
  it('0x3F - SRL A');
  it('0x40 - BIT 0,B');
  it('0x41 - BIT 0,C');
  it('0x42 - BIT 0,D');
  it('0x43 - BIT 0,E');
  it('0x44 - BIT 0,H');
  it('0x45 - BIT 0,L');
  it('0x46 - BIT 0,(HL)');
  it('0x47 - BIT 0,A');
  it('0x48 - BIT 1,B');
  it('0x49 - BIT 1,C');
  it('0x4A - BIT 1,D');
  it('0x4B - BIT 1,E');
  it('0x4C - BIT 1,H');
  it('0x4D - BIT 1,L');
  it('0x4E - BIT 1,(HL)');
  it('0x4F - BIT 1,A');
  it('0x50 - BIT 2,B');
  it('0x51 - BIT 2,C');
  it('0x52 - BIT 2,D');
  it('0x53 - BIT 2,E');
  it('0x54 - BIT 2,H');
  it('0x55 - BIT 2,L');
  it('0x56 - BIT 2,(HL)');
  it('0x57 - BIT 2,A');
  it('0x58 - BIT 3,B');
  it('0x59 - BIT 3,C');
  it('0x5A - BIT 3,D');
  it('0x5B - BIT 3,E');
  it('0x5C - BIT 3,H');
  it('0x5D - BIT 3,L');
  it('0x5E - BIT 3,(HL)');
  it('0x5F - BIT 3,A');
  it('0x60 - BIT 4,B');
  it('0x61 - BIT 4,C');
  it('0x62 - BIT 4,D');
  it('0x63 - BIT 4,E');
  it('0x64 - BIT 4,H');
  it('0x65 - BIT 4,L');
  it('0x66 - BIT 4,(HL)');
  it('0x67 - BIT 4,A');
  it('0x68 - BIT 5,B');
  it('0x69 - BIT 5,C');
  it('0x6A - BIT 5,D');
  it('0x6B - BIT 5,E');
  it('0x6C - BIT 5,H');
  it('0x6D - BIT 5,L');
  it('0x6E - BIT 5,(HL)');
  it('0x6F - BIT 5,A');
  it('0x70 - BIT 6,B');
  it('0x71 - BIT 6,C');
  it('0x72 - BIT 6,D');
  it('0x73 - BIT 6,E');
  it('0x74 - BIT 6,H');
  it('0x75 - BIT 6,L');
  it('0x76 - BIT 6,(HL)');
  it('0x77 - BIT 6,A');
  it('0x78 - BIT 7,B');
  it('0x79 - BIT 7,C');
  it('0x7A - BIT 7,D');
  it('0x7B - BIT 7,E');
  it('0x7C - BIT 7,H');
  it('0x7D - BIT 7,L');
  it('0x7E - BIT 7,(HL)');
  it('0x7F - BIT 7,A');
  it('0x80 - RES 0,B');
  it('0x81 - RES 0,C');
  it('0x82 - RES 0,D');
  it('0x83 - RES 0,E');
  it('0x84 - RES 0,H');
  it('0x85 - RES 0,L');
  it('0x86 - RES 0,(HL)');
  it('0x87 - RES 0,A');
  it('0x88 - RES 1,B');
  it('0x89 - RES 1,C');
  it('0x8A - RES 1,D');
  it('0x8B - RES 1,E');
  it('0x8C - RES 1,H');
  it('0x8D - RES 1,L');
  it('0x8E - RES 1,(HL)');
  it('0x8F - RES 1,A');
  it('0x90 - RES 2,B');
  it('0x91 - RES 2,C');
  it('0x92 - RES 2,D');
  it('0x93 - RES 2,E');
  it('0x94 - RES 2,H');
  it('0x95 - RES 2,L');
  it('0x96 - RES 2,(HL)');
  it('0x97 - RES 2,A');
  it('0x98 - RES 3,B');
  it('0x99 - RES 3,C');
  it('0x9A - RES 3,D');
  it('0x9B - RES 3,E');
  it('0x9C - RES 3,H');
  it('0x9D - RES 3,L');
  it('0x9E - RES 3,(HL)');
  it('0x9F - RES 3,A');
  it('0xA0 - RES 4,B');
  it('0xA1 - RES 4,C');
  it('0xA2 - RES 4,D');
  it('0xA3 - RES 4,E');
  it('0xA4 - RES 4,H');
  it('0xA5 - RES 4,L');
  it('0xA6 - RES 4,(HL)');
  it('0xA7 - RES 4,A');
  it('0xA8 - RES 5,B');
  it('0xA9 - RES 5,C');
  it('0xAA - RES 5,D');
  it('0xAB - RES 5,E');
  it('0xAC - RES 5,H');
  it('0xAD - RES 5,L');
  it('0xAE - RES 5,(HL)');
  it('0xAF - RES 5,A');
  it('0xB0 - RES 6,B');
  it('0xB1 - RES 6,C');
  it('0xB2 - RES 6,D');
  it('0xB3 - RES 6,E');
  it('0xB4 - RES 6,H');
  it('0xB5 - RES 6,L');
  it('0xB6 - RES 6,(HL)');
  it('0xB7 - RES 6,A');
  it('0xB8 - RES 7,B');
  it('0xB9 - RES 7,C');
  it('0xBA - RES 7,D');
  it('0xBB - RES 7,E');
  it('0xBC - RES 7,H');
  it('0xBD - RES 7,L');
  it('0xBE - RES 7,(HL)');
  it('0xBF - RES 7,A');
  it('0xC0 - SET 0,B');
  it('0xC1 - SET 0,C');
  it('0xC2 - SET 0,D');
  it('0xC3 - SET 0,E');
  it('0xC4 - SET 0,H');
  it('0xC5 - SET 0,L');
  it('0xC6 - SET 0,(HL)');
  it('0xC7 - SET 0,A');
  it('0xC8 - SET 1,B');
  it('0xC9 - SET 1,C');
  it('0xCA - SET 1,D');
  it('0xCB - SET 1,E');
  it('0xCC - SET 1,H');
  it('0xCD - SET 1,L');
  it('0xCE - SET 1,(HL)');
  it('0xCF - SET 1,A');
  it('0xD0 - SET 2,B');
  it('0xD1 - SET 2,C');
  it('0xD2 - SET 2,D');
  it('0xD3 - SET 2,E');
  it('0xD4 - SET 2,H');
  it('0xD5 - SET 2,L');
  it('0xD6 - SET 2,(HL)');
  it('0xD7 - SET 2,A');
  it('0xD8 - SET 3,B');
  it('0xD9 - SET 3,C');
  it('0xDA - SET 3,D');
  it('0xDB - SET 3,E');
  it('0xDC - SET 3,H');
  it('0xDD - SET 3,L');
  it('0xDE - SET 3,(HL)');
  it('0xDF - SET 3,A');
  it('0xE0 - SET 4,B');
  it('0xE1 - SET 4,C');
  it('0xE2 - SET 4,D');
  it('0xE3 - SET 4,E');
  it('0xE4 - SET 4,H');
  it('0xE5 - SET 4,L');
  it('0xE6 - SET 4,(HL)');
  it('0xE7 - SET 4,A');
  it('0xE8 - SET 5,B');
  it('0xE9 - SET 5,C');
  it('0xEA - SET 5,D');
  it('0xEB - SET 5,E');
  it('0xEC - SET 5,H');
  it('0xED - SET 5,L');
  it('0xEE - SET 5,(HL)');
  it('0xEF - SET 5,A');
  it('0xF0 - SET 6,B');
  it('0xF1 - SET 6,C');
  it('0xF2 - SET 6,D');
  it('0xF3 - SET 6,E');
  it('0xF4 - SET 6,H');
  it('0xF5 - SET 6,L');
  it('0xF6 - SET 6,(HL)');
  it('0xF7 - SET 6,A');
  it('0xF8 - SET 7,B');
  it('0xF9 - SET 7,C');
  it('0xFA - SET 7,D');
  it('0xFB - SET 7,E');
  it('0xFC - SET 7,H');
  it('0xFD - SET 7,L');
  it('0xFE - SET 7,(HL)');
  it('0xFF - SET 7,A');
});
