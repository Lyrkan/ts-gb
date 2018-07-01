import 'mocha';
import { expect } from 'chai';
import { OPCODES_0XCB } from '../../../src/cpu/opcodes/opcodes-0xCB';
import { CpuRegisters } from '../../../src/cpu/cpu-registers';
import { AddressBus } from '../../../src/memory/address-bus';
import { Joypad } from '../../../src/controls/joypad';
import { MBC_TYPE } from '../../../src/cartridge/game-cartridge-info';
import { MemorySegment } from '../../../src/memory/segments/memory-segment';
import {
  CARTRIDGE_ROM_BANK_LENGTH,
  CARTRIDGE_RAM_BANK_LENGTH
} from '../../../src/cartridge/game-cartridge';
import { DMAHandler } from '../../../src/memory/dma/dma-handler';

describe('Opcodes - 0xCB table', () => {
  let cpuRegisters: CpuRegisters;
  let addressBus: AddressBus;

  const executeNextOpcode = (expectedCycles: number) => {
    expect(addressBus.getByte(cpuRegisters.PC++)).to.equal(0xCB, '0xCB prefix not found');
    const cycles = OPCODES_0XCB[addressBus.getByte(cpuRegisters.PC++)](cpuRegisters, addressBus);
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

    addressBus = new AddressBus(new Joypad(), new DMAHandler());
    addressBus.loadCartridge({
      cartridgeInfo: {
        gameTitle: 'TEST',
        cgbFlag: 0x00,
        hasBattery: true,
        hasRam: true,
        hasRumble: false,
        hasTimer: false,
        mbcType: MBC_TYPE.NONE,
        romSize: CARTRIDGE_ROM_BANK_LENGTH * 2,
        ramSize: CARTRIDGE_RAM_BANK_LENGTH,
      },
      staticRomBank: new MemorySegment(CARTRIDGE_ROM_BANK_LENGTH),
      switchableRomBank: new MemorySegment(CARTRIDGE_ROM_BANK_LENGTH),
      ramBank: new MemorySegment(CARTRIDGE_ROM_BANK_LENGTH),
      reset: () => { /* NOP */ },
      getRamContent: () => new Uint8Array(CARTRIDGE_RAM_BANK_LENGTH),
      loadRamContent: () => { /* NOP */ },
      setRamChangedListener: () => { /* NOP */ },
    });
  });

  it('0x00 - RLC B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x00);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x00);

    cpuRegisters.B = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.B = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x01 - RLC C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x01);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x01);

    cpuRegisters.C = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.C = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x02 - RLC D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x02);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x02);

    cpuRegisters.D = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.D = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x03 - RLC E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x03);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x03);

    cpuRegisters.E = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.E = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x04 - RLC H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x04);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x04);

    cpuRegisters.H = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.H = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x05 - RLC L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x05);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x05);

    cpuRegisters.L = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.L = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x06 - RLC (HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x06);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x06);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b10101010);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01010101);

    addressBus.setByte(0xC000, 0b10000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000001);
  });

  it('0x07 - RLC A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x07);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x07);

    cpuRegisters.A = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x08 - RRC B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x08);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x08);

    cpuRegisters.B = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.B = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x09 - RRC C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x09);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x09);

    cpuRegisters.C = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.C = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x0A - RRC D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x0A);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x0A);

    cpuRegisters.D = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.D = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x0B - RRC E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x0B);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x0B);

    cpuRegisters.E = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.E = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x0C - RRC H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x0C);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x0C);

    cpuRegisters.H = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.H = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x0D - RRC L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x0D);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x0D);

    cpuRegisters.L = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.L = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x0E - RRC (HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x0E);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x0E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b10101010);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01010101);

    addressBus.setByte(0xC000, 0b10000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01000000);
  });

  it('0x0F - RRC A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x0F);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x0F);

    cpuRegisters.A = 0b10101010;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x10 - RL B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x10);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x10);

    cpuRegisters.B = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.B = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x11 - RL C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x11);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x11);

    cpuRegisters.C = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.C = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x12 - RL D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x12);

    cpuRegisters.D = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.D = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x13 - RL E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x13);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x13);

    cpuRegisters.E = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.E = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x14 - RL H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x14);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x14);

    cpuRegisters.H = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.H = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x15 - RL L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x15);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x15);

    cpuRegisters.L = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.L = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x16 - RL (HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x16);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x16);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b10101010);
    cpuRegisters.flags.C = 0;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01010100);

    addressBus.setByte(0xC000, 0b10101010);
    cpuRegisters.flags.C = 1;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01010101);
  });

  it('0x17 - RL A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x17);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x17);

    cpuRegisters.A = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01010100, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x18 - RR B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x18);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x18);

    cpuRegisters.B = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.B = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x19 - RR C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x19);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x19);

    cpuRegisters.C = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.C = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x1A - RR D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x1A);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x1A);

    cpuRegisters.D = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.D = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x1B - RR E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x1B);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x1B);

    cpuRegisters.E = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.E = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x1C - RR H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x1C);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x1C);

    cpuRegisters.H = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.H = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x1D - RR L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x1D);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x1D);

    cpuRegisters.L = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.L = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x1E - RR (HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x1E);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x1E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(cpuRegisters.HL, 0b10101010);
    cpuRegisters.flags.C = 0;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.getByte(cpuRegisters.HL)).to.equal(0b01010101);

    addressBus.setByte(cpuRegisters.HL, 0b10101010);
    cpuRegisters.flags.C = 1;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.getByte(cpuRegisters.HL)).to.equal(0b11010101);
  });

  it('0x1F - RR A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x1F);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x1F);

    cpuRegisters.A = 0b10101010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01010101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0b10101010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11010101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x20 - SLA B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x20);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x20);

    cpuRegisters.B = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.B = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ B: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x21 - SLA C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x21);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x21);

    cpuRegisters.C = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.C = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ C: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x22 - SLA D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x22);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x22);

    cpuRegisters.D = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.D = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ D: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x23 - SLA E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x23);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x23);

    cpuRegisters.E = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.E = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ E: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x24 - SLA H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x24);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x24);

    cpuRegisters.H = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.H = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ H: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x25 - SLA L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x25);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x25);

    cpuRegisters.L = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.L = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ L: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x26 - SLA (HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x26);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x26);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b10000001);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000010);

    addressBus.setByte(0xC000, 0b01010101);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b10101010);
  });

  it('0x27 - SLA A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x27);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x27);

    cpuRegisters.A = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ A: 0b10101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x28 - SRA B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x28);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x28);

    cpuRegisters.B = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.B = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x29 - SRA C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x29);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x29);

    cpuRegisters.C = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.C = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x2A - SRA D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x2A);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x2A);

    cpuRegisters.D = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.D = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x2B - SRA E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x2B);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x2B);

    cpuRegisters.E = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.E = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x2C - SRA H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x2C);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x2C);

    cpuRegisters.H = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.H = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x2D - SRA L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x2D);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x2D);

    cpuRegisters.L = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.L = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x2E - SRA (HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x2E);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x2E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b10000001);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11000000);

    addressBus.setByte(0xC000, 0b01010101);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00101010);
  });

  it('0x2F - SRA A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x2F);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x2F);

    cpuRegisters.A = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b01010101;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00101010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x30 - SWAP B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x30);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x30);
    addressBus.setByte(0x0004, 0xCB);
    addressBus.setByte(0x0005, 0x30);

    cpuRegisters.B = 0b11011011;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ B: 0b10111101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.B = 0b10010110;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01101001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.B = 0b00000000;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0006 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0x31 - SWAP C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x31);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x31);
    addressBus.setByte(0x0004, 0xCB);
    addressBus.setByte(0x0005, 0x31);

    cpuRegisters.C = 0b11011011;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ C: 0b10111101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.C = 0b10010110;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01101001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.C = 0b00000000;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0006 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0x32 - SWAP D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x32);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x32);
    addressBus.setByte(0x0004, 0xCB);
    addressBus.setByte(0x0005, 0x32);

    cpuRegisters.D = 0b11011011;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ D: 0b10111101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.D = 0b10010110;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01101001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.D = 0b00000000;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0006 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0x33 - SWAP E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x33);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x33);
    addressBus.setByte(0x0004, 0xCB);
    addressBus.setByte(0x0005, 0x33);

    cpuRegisters.E = 0b11011011;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ E: 0b10111101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.E = 0b10010110;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01101001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.E = 0b00000000;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0006 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0x34 - SWAP H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x34);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x34);
    addressBus.setByte(0x0004, 0xCB);
    addressBus.setByte(0x0005, 0x34);

    cpuRegisters.H = 0b11011011;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ H: 0b10111101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.H = 0b10010110;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01101001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.H = 0b00000000;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0006 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0x35 - SWAP L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x35);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x35);
    addressBus.setByte(0x0004, 0xCB);
    addressBus.setByte(0x0005, 0x35);

    cpuRegisters.L = 0b11011011;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ L: 0b10111101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.L = 0b10010110;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01101001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.L = 0b00000000;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0006 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0x36 - SWAP (HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x36);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x36);
    addressBus.setByte(0x0004, 0xCB);
    addressBus.setByte(0x0005, 0x36);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b11011011);
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b10111101);

    addressBus.setByte(0xC000, 0b10010110);
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01101001);

    addressBus.setByte(0xC000, 0b00000000);
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0006 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);
  });

  it('0x37 - SWAP A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x37);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x37);
    addressBus.setByte(0x0004, 0xCB);
    addressBus.setByte(0x0005, 0x37);

    cpuRegisters.A = 0b11011011;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ A: 0b10111101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0b10010110;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01101001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0b00000000;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0006 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0x38 - SRL B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x38);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x38);

    cpuRegisters.B = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01111111, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x39 - SRL C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x39);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x39);

    cpuRegisters.C = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01111111, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x3A - SRL D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x3A);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x3A);

    cpuRegisters.D = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01111111, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x3B - SRL E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x3B);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x3B);

    cpuRegisters.E = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01111111, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x3C - SRL H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x3C);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x3C);

    cpuRegisters.H = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01111111, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x3D - SRL L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x3D);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x3D);

    cpuRegisters.L = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01111111, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x3E - SRL (HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x3E);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x3E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b10000001);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01111111);
  });

  it('0x3F - SRL A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x3F);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x3F);

    cpuRegisters.A = 0b10000001;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01000000, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01111111, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x40 - BIT 0,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x40);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x40);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.B = 0b00000001;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x41 - BIT 0,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x41);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x41);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.C = 0b00000001;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x42 - BIT 0,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x42);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x42);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.D = 0b00000001;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x43 - BIT 0,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x43);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x43);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.E = 0b00000001;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x44 - BIT 0,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x44);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x44);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.H = 0b00000001;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x45 - BIT 0,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x45);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x45);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.L = 0b00000001;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x46 - BIT 0,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x46);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x46);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b00000001);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000001);
  });

  it('0x47 - BIT 0,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x47);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x47);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0b00000001;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000001, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x48 - BIT 1,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x48);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x48);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.B = 0b00000010;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x49 - BIT 1,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x49);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x49);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.C = 0b00000010;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x4A - BIT 1,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x4A);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x4A);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.D = 0b00000010;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x4B - BIT 1,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x4B);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x4B);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.E = 0b00000010;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x4C - BIT 1,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x4C);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x4C);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.H = 0b00000010;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x4D - BIT 1,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x4D);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x4D);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.L = 0b00000010;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x4E - BIT 1,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x4E);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x4E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b00000010);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000010);
  });

  it('0x4F - BIT 1,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x4F);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x4F);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0b00000010;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000010, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x50 - BIT 2,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x50);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x50);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.B = 0b00000100;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000100, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x51 - BIT 2,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x51);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x51);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.C = 0b00000100;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000100, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x52 - BIT 2,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x52);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x52);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.D = 0b00000100;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000100, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x53 - BIT 2,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x53);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x53);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.E = 0b00000100;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000100, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x54 - BIT 2,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x54);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x54);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.H = 0b00000100;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000100, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x55 - BIT 2,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x55);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x55);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.L = 0b00000100;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000100, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x56 - BIT 2,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x56);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x56);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b00000100);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000100);
  });

  it('0x57 - BIT 2,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x57);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x57);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0b00000100;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000100, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x58 - BIT 3,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x58);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x58);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.B = 0b00001000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00001000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x59 - BIT 3,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x59);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x59);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.C = 0b00001000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00001000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x5A - BIT 3,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x5A);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x5A);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.D = 0b00001000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00001000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x5B - BIT 3,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x5B);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x5B);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.E = 0b00001000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00001000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x5C - BIT 3,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x5C);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x5C);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.H = 0b00001000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00001000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x5D - BIT 3,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x5D);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x5D);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.L = 0b00001000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00001000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x5E - BIT 3,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x5E);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x5E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b00001000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00001000);
  });

  it('0x5F - BIT 3,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x5F);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x5F);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0b00001000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00001000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x60 - BIT 4,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x60);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x60);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.B = 0b00010000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00010000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x61 - BIT 4,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x61);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x61);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.C = 0b00010000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00010000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x62 - BIT 4,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x62);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x62);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.D = 0b00010000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00010000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x63 - BIT 4,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x63);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x63);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.E = 0b00010000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00010000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x64 - BIT 4,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x64);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x64);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.H = 0b00010000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00010000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x65 - BIT 4,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x65);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x65);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.L = 0b00010000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00010000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x66 - BIT 4,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x66);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x66);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b00010000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00010000);
  });

  it('0x67 - BIT 4,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x67);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x67);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0b00010000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00010000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x68 - BIT 5,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x68);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x68);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.B = 0b00100000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00100000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x69 - BIT 5,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x69);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x69);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.C = 0b00100000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00100000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x6A - BIT 5,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x6A);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x6A);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.D = 0b00100000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00100000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x6B - BIT 5,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x6B);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x6B);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.E = 0b00100000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00100000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x6C - BIT 5,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x6C);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x6C);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.H = 0b00100000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00100000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x6D - BIT 5,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x6D);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x6D);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.L = 0b00100000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00100000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x6E - BIT 5,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x6E);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x6E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b00100000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00100000);
  });

  it('0x6F - BIT 5,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x6F);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x6F);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0b00100000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00100000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x70 - BIT 6,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x70);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x70);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.B = 0b01000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x71 - BIT 6,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x71);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x71);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.C = 0b01000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x72 - BIT 6,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x72);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x72);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.D = 0b01000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x73 - BIT 6,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x73);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x73);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.E = 0b01000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x74 - BIT 6,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x74);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x74);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.H = 0b01000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x75 - BIT 6,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x75);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x75);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.L = 0b01000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x76 - BIT 6,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x76);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x76);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b01000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01000000);
  });

  it('0x77 - BIT 6,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x77);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x77);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0b01000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x78 - BIT 7,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x78);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x78);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.B = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b10000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x79 - BIT 7,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x79);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x79);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.C = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b10000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x7A - BIT 7,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x7A);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x7A);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.D = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b10000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x7B - BIT 7,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x7B);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x7B);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.E = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b10000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x7C - BIT 7,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x7C);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x7C);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.H = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b10000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x7D - BIT 7,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x7D);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x7D);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.L = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b10000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x7E - BIT 7,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x7E);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x7E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b10000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
    expect(addressBus.getByte(0xC000)).to.equal(0b10000000);
  });

  it('0x7F - BIT 7,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x7F);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x7F);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0b10000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b10000000, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x80 - RES 0,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x80);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x80);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111110, PC: 0x0004 });
  });

  it('0x81 - RES 0,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x81);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x81);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111110, PC: 0x0004 });
  });

  it('0x82 - RES 0,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x82);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x82);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111110, PC: 0x0004 });
  });

  it('0x83 - RES 0,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x83);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x83);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111110, PC: 0x0004 });
  });

  it('0x84 - RES 0,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x84);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x84);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111110, PC: 0x0004 });
  });

  it('0x85 - RES 0,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x85);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x85);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111110, PC: 0x0004 });
  });

  it('0x86 - RES 0,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x86);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x86);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111110);
  });

  it('0x87 - RES 0,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x87);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x87);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111110, PC: 0x0004 });
  });

  it('0x88 - RES 1,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x88);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x88);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111101, PC: 0x0004 });
  });

  it('0x89 - RES 1,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x89);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x89);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111101, PC: 0x0004 });
  });

  it('0x8A - RES 1,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x8A);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x8A);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111101, PC: 0x0004 });
  });

  it('0x8B - RES 1,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x8B);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x8B);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111101, PC: 0x0004 });
  });

  it('0x8C - RES 1,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x8C);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x8C);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111101, PC: 0x0004 });
  });

  it('0x8D - RES 1,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x8D);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x8D);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111101, PC: 0x0004 });
  });

  it('0x8E - RES 1,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x8E);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x8E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111101);
  });

  it('0x8F - RES 1,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x8F);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x8F);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111101, PC: 0x0004 });
  });

  it('0x90 - RES 2,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x90);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x90);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111011, PC: 0x0004 });
  });

  it('0x91 - RES 2,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x91);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x91);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111011, PC: 0x0004 });
  });

  it('0x92 - RES 2,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x92);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x92);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111011, PC: 0x0004 });
  });

  it('0x93 - RES 2,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x93);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x93);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111011, PC: 0x0004 });
  });

  it('0x94 - RES 2,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x94);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x94);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111011, PC: 0x0004 });
  });

  it('0x95 - RES 2,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x95);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x95);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111011, PC: 0x0004 });
  });

  it('0x96 - RES 2,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x96);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x96);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111011);
  });

  it('0x97 - RES 2,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x97);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x97);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111011, PC: 0x0004 });
  });

  it('0x98 - RES 3,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x98);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x98);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11110111, PC: 0x0004 });
  });

  it('0x99 - RES 3,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x99);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x99);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11110111, PC: 0x0004 });
  });

  it('0x9A - RES 3,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x9A);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x9A);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11110111, PC: 0x0004 });
  });

  it('0x9B - RES 3,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x9B);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x9B);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11110111, PC: 0x0004 });
  });

  it('0x9C - RES 3,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x9C);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x9C);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11110111, PC: 0x0004 });
  });

  it('0x9D - RES 3,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x9D);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x9D);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11110111, PC: 0x0004 });
  });

  it('0x9E - RES 3,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x9E);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x9E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11110111);
  });

  it('0x9F - RES 3,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0x9F);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0x9F);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11110111, PC: 0x0004 });
  });

  it('0xA0 - RES 4,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xA0);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xA0);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11101111, PC: 0x0004 });
  });

  it('0xA1 - RES 4,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xA1);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xA1);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11101111, PC: 0x0004 });
  });

  it('0xA2 - RES 4,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xA2);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xA2);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11101111, PC: 0x0004 });
  });

  it('0xA3 - RES 4,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xA3);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xA3);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11101111, PC: 0x0004 });
  });

  it('0xA4 - RES 4,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xA4);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xA4);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11101111, PC: 0x0004 });
  });

  it('0xA5 - RES 4,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xA5);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xA5);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11101111, PC: 0x0004 });
  });

  it('0xA6 - RES 4,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xA6);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xA6);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11101111);
  });

  it('0xA7 - RES 4,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xA7);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xA7);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11101111, PC: 0x0004 });
  });

  it('0xA8 - RES 5,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xA8);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xA8);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11011111, PC: 0x0004 });
  });

  it('0xA9 - RES 5,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xA9);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xA9);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11011111, PC: 0x0004 });
  });

  it('0xAA - RES 5,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xAA);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xAA);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11011111, PC: 0x0004 });
  });

  it('0xAB - RES 5,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xAB);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xAB);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11011111, PC: 0x0004 });
  });

  it('0xAC - RES 5,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xAC);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xAC);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11011111, PC: 0x0004 });
  });

  it('0xAD - RES 5,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xAD);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xAD);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11011111, PC: 0x0004 });
  });

  it('0xAE - RES 5,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xAE);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xAE);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11011111);
  });

  it('0xAF - RES 5,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xAF);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xAF);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11011111, PC: 0x0004 });
  });

  it('0xB0 - RES 6,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xB0);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xB0);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b10111111, PC: 0x0004 });
  });

  it('0xB1 - RES 6,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xB1);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xB1);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b10111111, PC: 0x0004 });
  });

  it('0xB2 - RES 6,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xB2);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xB2);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b10111111, PC: 0x0004 });
  });

  it('0xB3 - RES 6,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xB3);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xB3);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b10111111, PC: 0x0004 });
  });

  it('0xB4 - RES 6,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xB4);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xB4);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b10111111, PC: 0x0004 });
  });

  it('0xB5 - RES 6,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xB5);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xB5);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b10111111, PC: 0x0004 });
  });

  it('0xB6 - RES 6,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xB6);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xB6);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b10111111);
  });

  it('0xB7 - RES 6,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xB7);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xB7);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b10111111, PC: 0x0004 });
  });

  it('0xB8 - RES 7,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xB8);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xB8);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01111111, PC: 0x0004 });
  });

  it('0xB9 - RES 7,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xB9);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xB9);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01111111, PC: 0x0004 });
  });

  it('0xBA - RES 7,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xBA);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xBA);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01111111, PC: 0x0004 });
  });

  it('0xBB - RES 7,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xBB);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xBB);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01111111, PC: 0x0004 });
  });

  it('0xBC - RES 7,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xBC);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xBC);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01111111, PC: 0x0004 });
  });

  it('0xBD - RES 7,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xBD);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xBD);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01111111, PC: 0x0004 });
  });

  it('0xBE - RES 7,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xBE);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xBE);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01111111);
  });

  it('0xBF - RES 7,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xBF);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xBF);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01111111, PC: 0x0004 });
  });

  it('0xC0 - SET 0,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xC0);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xC0);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000001, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111111, PC: 0x0004 });
  });

  it('0xC1 - SET 0,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xC1);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xC1);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000001, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111111, PC: 0x0004 });
  });

  it('0xC2 - SET 0,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xC2);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xC2);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000001, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111111, PC: 0x0004 });
  });

  it('0xC3 - SET 0,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xC3);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xC3);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000001, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111111, PC: 0x0004 });
  });

  it('0xC4 - SET 0,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xC4);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xC4);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000001, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111111, PC: 0x0004 });
  });

  it('0xC5 - SET 0,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xC5);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xC5);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000001, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111111, PC: 0x0004 });
  });

  it('0xC6 - SET 0,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xC6);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xC6);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000001);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111111);
  });

  it('0xC7 - SET 0,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xC7);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xC7);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000001, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111111, PC: 0x0004 });
  });

  it('0xC8 - SET 1,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xC8);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xC8);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000010, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111111, PC: 0x0004 });
  });

  it('0xC9 - SET 1,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xC9);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xC9);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000010, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111111, PC: 0x0004 });
  });

  it('0xCA - SET 1,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xCA);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xCA);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000010, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111111, PC: 0x0004 });
  });

  it('0xCB - SET 1,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xCB);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xCB);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000010, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111111, PC: 0x0004 });
  });

  it('0xCC - SET 1,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xCC);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xCC);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000010, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111111, PC: 0x0004 });
  });

  it('0xCD - SET 1,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xCD);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xCD);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000010, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111111, PC: 0x0004 });
  });

  it('0xCE - SET 1,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xCE);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xCE);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000010);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111111);
  });

  it('0xCF - SET 1,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xCF);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xCF);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000010, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111111, PC: 0x0004 });
  });

  it('0xD0 - SET 2,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xD0);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xD0);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00000100, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111111, PC: 0x0004 });
  });

  it('0xD1 - SET 2,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xD1);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xD1);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00000100, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111111, PC: 0x0004 });
  });

  it('0xD2 - SET 2,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xD2);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xD2);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00000100, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111111, PC: 0x0004 });
  });

  it('0xD3 - SET 2,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xD3);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xD3);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00000100, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111111, PC: 0x0004 });
  });

  it('0xD4 - SET 2,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xD4);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xD4);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00000100, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111111, PC: 0x0004 });
  });

  it('0xD5 - SET 2,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xD5);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xD5);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00000100, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111111, PC: 0x0004 });
  });

  it('0xD6 - SET 2,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xD6);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xD6);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00000100);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111111);
  });

  it('0xD7 - SET 2,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xD7);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xD7);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00000100, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111111, PC: 0x0004 });
  });

  it('0xD8 - SET 3,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xD8);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xD8);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00001000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111111, PC: 0x0004 });
  });

  it('0xD9 - SET 3,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xD9);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xD9);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00001000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111111, PC: 0x0004 });
  });

  it('0xDA - SET 3,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xDA);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xDA);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00001000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111111, PC: 0x0004 });
  });

  it('0xDB - SET 3,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xDB);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xDB);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00001000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111111, PC: 0x0004 });
  });

  it('0xDC - SET 3,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xDC);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xDC);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00001000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111111, PC: 0x0004 });
  });

  it('0xDD - SET 3,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xDD);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xDD);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00001000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111111, PC: 0x0004 });
  });

  it('0xDE - SET 3,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xDE);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xDE);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00001000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111111);
  });

  it('0xDF - SET 3,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xDF);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xDF);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00001000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111111, PC: 0x0004 });
  });

  it('0xE0 - SET 4,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xE0);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xE0);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00010000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111111, PC: 0x0004 });
  });

  it('0xE1 - SET 4,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xE1);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xE1);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00010000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111111, PC: 0x0004 });
  });

  it('0xE2 - SET 4,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xE2);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xE2);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00010000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111111, PC: 0x0004 });
  });

  it('0xE3 - SET 4,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xE3);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xE3);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00010000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111111, PC: 0x0004 });
  });

  it('0xE4 - SET 4,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xE4);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xE4);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00010000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111111, PC: 0x0004 });
  });

  it('0xE5 - SET 4,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xE5);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xE5);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00010000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111111, PC: 0x0004 });
  });

  it('0xE6 - SET 4,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xE6);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xE6);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00010000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111111);
  });

  it('0xE7 - SET 4,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xE7);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xE7);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00010000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111111, PC: 0x0004 });
  });

  it('0xE8 - SET 5,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xE8);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xE8);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b00100000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111111, PC: 0x0004 });
  });

  it('0xE9 - SET 5,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xE9);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xE9);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b00100000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111111, PC: 0x0004 });
  });

  it('0xEA - SET 5,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xEA);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xEA);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b00100000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111111, PC: 0x0004 });
  });

  it('0xEB - SET 5,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xEB);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xEB);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b00100000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111111, PC: 0x0004 });
  });

  it('0xEC - SET 5,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xEC);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xEC);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b00100000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111111, PC: 0x0004 });
  });

  it('0xED - SET 5,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xED);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xED);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b00100000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111111, PC: 0x0004 });
  });

  it('0xEE - SET 5,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xEE);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xEE);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b00100000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111111);
  });

  it('0xEF - SET 5,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xEF);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xEF);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b00100000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111111, PC: 0x0004 });
  });

  it('0xF0 - SET 6,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xF0);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xF0);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b01000000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111111, PC: 0x0004 });
  });

  it('0xF1 - SET 6,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xF1);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xF1);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b01000000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111111, PC: 0x0004 });
  });

  it('0xF2 - SET 6,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xF2);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xF2);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b01000000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111111, PC: 0x0004 });
  });

  it('0xF3 - SET 6,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xF3);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xF3);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b01000000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111111, PC: 0x0004 });
  });

  it('0xF4 - SET 6,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xF4);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xF4);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b01000000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111111, PC: 0x0004 });
  });

  it('0xF5 - SET 6,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xF5);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xF5);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b01000000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111111, PC: 0x0004 });
  });

  it('0xF6 - SET 6,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xF6);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xF6);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b01000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111111);
  });

  it('0xF7 - SET 6,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xF7);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xF7);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b01000000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111111, PC: 0x0004 });
  });

  it('0xF8 - SET 7,B', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xF8);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xF8);

    cpuRegisters.B = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ B: 0b10000000, PC: 0x0002 });

    cpuRegisters.B = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ B: 0b11111111, PC: 0x0004 });
  });

  it('0xF9 - SET 7,C', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xF9);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xF9);

    cpuRegisters.C = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ C: 0b10000000, PC: 0x0002 });

    cpuRegisters.C = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ C: 0b11111111, PC: 0x0004 });
  });

  it('0xFA - SET 7,D', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xFA);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xFA);

    cpuRegisters.D = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ D: 0b10000000, PC: 0x0002 });

    cpuRegisters.D = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ D: 0b11111111, PC: 0x0004 });
  });

  it('0xFB - SET 7,E', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xFB);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xFB);

    cpuRegisters.E = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ E: 0b10000000, PC: 0x0002 });

    cpuRegisters.E = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ E: 0b11111111, PC: 0x0004 });
  });

  it('0xFC - SET 7,H', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xFC);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xFC);

    cpuRegisters.H = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ H: 0b10000000, PC: 0x0002 });

    cpuRegisters.H = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ H: 0b11111111, PC: 0x0004 });
  });

  it('0xFD - SET 7,L', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xFD);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xFD);

    cpuRegisters.L = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ L: 0b10000000, PC: 0x0002 });

    cpuRegisters.L = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ L: 0b11111111, PC: 0x0004 });
  });

  it('0xFE - SET 7,(HL)', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xFE);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xFE);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0b00000000);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xC000)).to.equal(0b10000000);

    addressBus.setByte(0xC000, 0b11111111);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xC000)).to.equal(0b11111111);
  });

  it('0xFF - SET 7,A', () => {
    addressBus.setByte(0x0000, 0xCB);
    addressBus.setByte(0x0001, 0xFF);
    addressBus.setByte(0x0002, 0xCB);
    addressBus.setByte(0x0003, 0xFF);

    cpuRegisters.A = 0b00000000;
    executeNextOpcode(2);
    checkRegisters({ A: 0b10000000, PC: 0x0002 });

    cpuRegisters.A = 0b11111111;
    executeNextOpcode(2);
    checkRegisters({ A: 0b11111111, PC: 0x0004 });
  });
});
