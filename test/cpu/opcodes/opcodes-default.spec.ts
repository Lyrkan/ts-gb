import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { OPCODES_DEFAULT } from '../../../src/cpu/opcodes/opcodes-default';
import { CPURegisters } from '../../../src/cpu/cpu-registers';
import { AddressBus } from '../../../src/memory/address-bus';
import { ICPUCallbacks } from '../../../src/cpu/opcodes';
import { Joypad } from '../../../src/controls/joypad';
import { MemorySegment } from '../../../src/memory/segments/memory-segment';
import { MBC_TYPE } from '../../../src/cartridge/game-cartridge-info';
import { DMAHandler } from '../../../src/memory/dma/dma-handler';
import { CPUTimer } from '../../../src/cpu/cpu-timer';
import {
  CARTRIDGE_ROM_BANK_LENGTH,
  CARTRIDGE_RAM_BANK_LENGTH
} from '../../../src/cartridge/game-cartridge';

describe('Opcodes - Default table', () => {
  let cpuRegisters: CPURegisters;
  let cpuCallbacks: ICPUCallbacks;
  let addressBus: AddressBus;

  const executeNextOpcode = (expectedCycles: number) => {
    const cycles = OPCODES_DEFAULT[addressBus.getByte(cpuRegisters.PC++)](
      cpuRegisters,
      addressBus,
      cpuCallbacks
    );
    expect(cycles).to.equal(expectedCycles, 'Unexpected cycles count');
  };

  const checkFlags = ({Z, N, H, C }: { Z: number, N: number, H: number, C: number }) => {
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
    cpuRegisters = new CPURegisters();
    cpuRegisters.PC = 0x0000;
    cpuRegisters.SP = 0xFFFE;

    cpuCallbacks = {
      stop: () => { /* NOP */ },
      disableInterrupts: () => { /* NOP */ },
      enableInterrupts: () => { /* NOP */ },
      halt: () => { /* NOP */ },
    };

    addressBus = new AddressBus(new Joypad(), new DMAHandler(), new CPUTimer());
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

  it('0x00 - NOP', () => {
    addressBus.setByte(0x0000, 0x00);
    addressBus.setByte(0x0001, 0x00);

    executeNextOpcode(1);
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x01 - LD BC,d16', () => {
    addressBus.setByte(0x0000, 0x01);
    addressBus.setWord(0x0001, 0x1234);
    addressBus.setByte(0x0003, 0x01);
    addressBus.setWord(0x0004, 0x5678);

    executeNextOpcode(3);
    checkRegisters({ BC: 0x1234, PC: 0x0003 });
  });

  it('0x02 - LD (BC),A', () => {
    addressBus.setByte(0x0000, 0x02);
    addressBus.setByte(0x0001, 0x02);
    addressBus.setByte(0xC000, 0x12);
    addressBus.setByte(0xC001, 0x34);

    cpuRegisters.A = 0x56;
    cpuRegisters.BC = 0xC000;

    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x56);
    expect(addressBus.getByte(0xC001)).to.equal(0x34);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.BC = 0xC001;

    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x56);
    expect(addressBus.getByte(0xC001)).to.equal(0x56);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x03 - INC BC', () => {
    addressBus.setByte(0x0000, 0x03);
    addressBus.setByte(0x0001, 0x03);
    addressBus.setByte(0x0002, 0x03);

    cpuRegisters.BC = 0xFFFD;

    executeNextOpcode(2);
    checkRegisters({ BC: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ BC: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ BC: 0x0000, PC: 0x0003 });
  });

  it('0x04 - INC B', () => {
    addressBus.setByte(0x0000, 0x04);
    addressBus.setByte(0x0001, 0x04);
    addressBus.setByte(0x0002, 0x04);

    cpuRegisters.B = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ B: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ B: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.B = 0xFF;

    executeNextOpcode(1);
    checkRegisters({ B: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x05 - DEC B', () => {
    addressBus.setByte(0x0000, 0x05);
    addressBus.setByte(0x0001, 0x05);
    addressBus.setByte(0x0002, 0x05);

    cpuRegisters.B = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ B: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ B: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.B = 0x01;

    executeNextOpcode(1);
    checkRegisters({ B: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x06 - LD B,d8', () => {
    addressBus.setByte(0x0000, 0x06);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0x06);
    addressBus.setByte(0x0003, 0x34);

    executeNextOpcode(2);
    checkRegisters({ B: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ B: 0x34, PC: 0x0004 });
  });

  it('0x07 - RLCA', () => {
    addressBus.setByte(0x0000, 0x07);
    addressBus.setByte(0x0001, 0x07);

    cpuRegisters.A = 0b01110101;
    executeNextOpcode(1);
    checkRegisters({ A: 0b11101010, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0b10111010;
    executeNextOpcode(1);
    checkRegisters({ A: 0b01110101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x08 - LD (a16),SP', () => {
    addressBus.setByte(0x0000, 0x08);
    addressBus.setWord(0x0001, 0xC000);
    addressBus.setByte(0x0003, 0x08);
    addressBus.setWord(0x0004, 0xC001);

    cpuRegisters.SP = 0x1234;
    executeNextOpcode(5);
    expect(addressBus.getWord(0xC000)).to.equal(0x1234);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.SP = 0x5678;
    executeNextOpcode(5);
    expect(addressBus.getWord(0xC001)).to.equal(0x5678);
    checkRegisters({ PC: 0x0006 });
  });

  it('0x09 - ADD HL,BC', () => {
    addressBus.setByte(0x0000, 0x09);
    addressBus.setByte(0x0001, 0x09);

    cpuRegisters.HL = 0x0FFE;
    cpuRegisters.BC = 0x0002;
    executeNextOpcode(2);
    checkRegisters({ HL: 0x1000, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.HL = 0xFFFF;
    cpuRegisters.BC = 0xFFFF;
    executeNextOpcode(2);
    checkRegisters({ HL: 0xFFFE, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });
  });

  it('0x0A - LD A,(BC)', () => {
    addressBus.setByte(0x0000, 0x0A);
    addressBus.setByte(0x0001, 0x0A);

    cpuRegisters.BC = 0xC000;

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x0B - DEC BC', () => {
    addressBus.setByte(0x0000, 0x0B);
    addressBus.setByte(0x0001, 0x0B);
    addressBus.setByte(0x0002, 0x0B);

    cpuRegisters.BC = 0x0002;

    executeNextOpcode(2);
    checkRegisters({ BC: 0x0001, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ BC: 0x0000, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ BC: 0xFFFF, PC: 0x0003 });
  });

  it('0x0C - INC C', () => {
    addressBus.setByte(0x0000, 0x0C);
    addressBus.setByte(0x0001, 0x0C);
    addressBus.setByte(0x0002, 0x0C);

    cpuRegisters.C = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ C: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ C: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.C = 0xFF;

    executeNextOpcode(1);
    checkRegisters({ C: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x0D - DEC C', () => {
    addressBus.setByte(0x0000, 0x0D);
    addressBus.setByte(0x0001, 0x0D);
    addressBus.setByte(0x0002, 0x0D);

    cpuRegisters.C = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ C: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ C: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.C = 0x01;

    executeNextOpcode(1);
    checkRegisters({ C: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x0E - LD C,d8', () => {
    addressBus.setByte(0x0000, 0x0E);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0x0E);
    addressBus.setByte(0x0003, 0x34);

    executeNextOpcode(2);
    checkRegisters({ C: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ C: 0x34, PC: 0x0004 });
  });

  it('0x0F - RRCA', () => {
    addressBus.setByte(0x0000, 0x0F);
    addressBus.setByte(0x0001, 0x0F);

    cpuRegisters.A = 0b01110101;
    executeNextOpcode(1);
    checkRegisters({ A: 0b10111010, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b10111010;
    executeNextOpcode(1);
    checkRegisters({ A: 0b01011101, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x10 - STOP 0', () => {
    addressBus.setByte(0x0000, 0x10);

    const spy = sinon.spy(cpuCallbacks, 'stop');
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0002 });
    expect(spy.calledOnce).to.equal(true);
  });

  it('0x11 - LD DE,d16', () => {
    addressBus.setByte(0x0000, 0x11);
    addressBus.setWord(0x0001, 0x1234);
    addressBus.setByte(0x0003, 0x11);
    addressBus.setWord(0x0004, 0x5678);

    executeNextOpcode(3);
    checkRegisters({ DE: 0x1234, PC: 0x0003 });
  });

  it('0x12 - LD (DE),A', () => {
    addressBus.setByte(0x0000, 0x12);
    addressBus.setByte(0x0001, 0x12);

    cpuRegisters.DE = 0xC000;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x13 - INC DE', () => {
    addressBus.setByte(0x0000, 0x13);
    addressBus.setByte(0x0001, 0x13);
    addressBus.setByte(0x0002, 0x13);

    cpuRegisters.DE = 0xFFFD;

    executeNextOpcode(2);
    checkRegisters({ DE: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ DE: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ DE: 0x0000, PC: 0x0003 });
  });

  it('0x14 - INC D', () => {
    addressBus.setByte(0x0000, 0x14);
    addressBus.setByte(0x0001, 0x14);
    addressBus.setByte(0x0002, 0x14);

    cpuRegisters.D = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ D: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ D: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.D = 0xFF;

    executeNextOpcode(1);
    checkRegisters({ D: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x15 - DEC D', () => {
    addressBus.setByte(0x0000, 0x15);
    addressBus.setByte(0x0001, 0x15);
    addressBus.setByte(0x0002, 0x15);

    cpuRegisters.D = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ D: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ D: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.D = 0x01;

    executeNextOpcode(1);
    checkRegisters({ D: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x16 - LD D,d8', () => {
    addressBus.setByte(0x0000, 0x16);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0x16);
    addressBus.setByte(0x0003, 0x34);

    executeNextOpcode(2);
    checkRegisters({ D: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ D: 0x34, PC: 0x0004 });
  });

  it('0x17 - RLA', () => {
    addressBus.setByte(0x0000, 0x17);
    addressBus.setByte(0x0001, 0x17);
    addressBus.setByte(0x0002, 0x17);
    addressBus.setByte(0x0003, 0x17);

    cpuRegisters.A = 0b01110101;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0b11101010, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0b01110101;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0b11101011, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0b10111010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0b01110100, PC: 0x0003 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b10111010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0b01110101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
  });

  it('0x18 - JR r8', () => {
    addressBus.setByte(0x0000, 0x18);
    addressBus.setByte(0x0001, 0x20);
    addressBus.setByte(0x0022, 0x18);
    addressBus.setByte(0x0023, 0xF0);
    addressBus.setByte(0x0014, 0x18);
    addressBus.setByte(0x0015, 0x10);

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0022 });

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0014 });

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0026 });
  });

  it('0x19 - ADD HL,DE', () => {
    addressBus.setByte(0x0000, 0x19);
    addressBus.setByte(0x0001, 0x19);

    cpuRegisters.HL = 0x0FFE;
    cpuRegisters.DE = 0x0002;
    executeNextOpcode(2);
    checkRegisters({ HL: 0x1000, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.HL = 0xFFFF;
    cpuRegisters.DE = 0xFFFF;
    executeNextOpcode(2);
    checkRegisters({ HL: 0xFFFE, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });
  });

  it('0x1A - LD A,(DE)', () => {
    addressBus.setByte(0x0000, 0x1A);
    addressBus.setByte(0x0001, 0x1A);

    cpuRegisters.DE = 0xC000;

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x1B - DEC DE', () => {
    addressBus.setByte(0x0000, 0x1B);
    addressBus.setByte(0x0001, 0x1B);
    addressBus.setByte(0x0002, 0x1B);

    cpuRegisters.DE = 0x0002;

    executeNextOpcode(2);
    checkRegisters({ DE: 0x0001, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ DE: 0x0000, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ DE: 0xFFFF, PC: 0x0003 });
  });

  it('0x1C - INC E', () => {
    addressBus.setByte(0x0000, 0x1C);
    addressBus.setByte(0x0001, 0x1C);
    addressBus.setByte(0x0002, 0x1C);

    cpuRegisters.E = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ E: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ E: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.E = 0xFF;

    executeNextOpcode(1);
    checkRegisters({ E: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x1D - DEC E', () => {
    addressBus.setByte(0x0000, 0x1D);
    addressBus.setByte(0x0001, 0x1D);
    addressBus.setByte(0x0002, 0x1D);

    cpuRegisters.E = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ E: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ E: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.E = 0x01;

    executeNextOpcode(1);
    checkRegisters({ E: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x1E - LD E,d8', () => {
    addressBus.setByte(0x0000, 0x1E);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0x1E);
    addressBus.setByte(0x0003, 0x34);

    executeNextOpcode(2);
    checkRegisters({ E: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ E: 0x34, PC: 0x0004 });
  });

  it('0x1F - RRA', () => {
    addressBus.setByte(0x0000, 0x1F);
    addressBus.setByte(0x0001, 0x1F);
    addressBus.setByte(0x0002, 0x1F);
    addressBus.setByte(0x0003, 0x1F);

    cpuRegisters.A = 0b01110101;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0b00111010, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b01110101;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0b10111010, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0b10111010;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0b01011101, PC: 0x0003 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0b10111010;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0b11011101, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0x20 - JR NZ,r8', () => {
    addressBus.setByte(0x0000, 0x20);
    addressBus.setByte(0x0001, 0x20);
    addressBus.setByte(0x0022, 0x20);
    addressBus.setByte(0x0023, 0xF0);
    addressBus.setByte(0x0024, 0x20);
    addressBus.setByte(0x0025, 0xF0);

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0022 });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(2);
    checkRegisters({ PC: 0x0024 });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0016 });
  });

  it('0x21 - LD HL,d16', () => {
    addressBus.setByte(0x0000, 0x21);
    addressBus.setWord(0x0001, 0x1234);
    addressBus.setByte(0x0003, 0x21);
    addressBus.setWord(0x0004, 0x5678);

    executeNextOpcode(3);
    checkRegisters({ HL: 0x1234, PC: 0x0003 });

    executeNextOpcode(3);
    checkRegisters({ HL: 0x5678, PC: 0x0006 });
  });

  it('0x22 - LD (HL+),A', () => {
    addressBus.setByte(0x0000, 0x22);
    addressBus.setByte(0x0001, 0x22);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC001)).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x23 - INC HL', () => {
    addressBus.setByte(0x0000, 0x23);
    addressBus.setByte(0x0001, 0x23);
    addressBus.setByte(0x0002, 0x23);

    cpuRegisters.HL = 0xFFFD;

    executeNextOpcode(2);
    checkRegisters({ HL: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ HL: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ HL: 0x0000, PC: 0x0003 });
  });

  it('0x24 - INC H', () => {
    addressBus.setByte(0x0000, 0x24);
    addressBus.setByte(0x0001, 0x24);
    addressBus.setByte(0x0002, 0x24);

    cpuRegisters.H = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ H: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ H: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.H = 0xFF;

    executeNextOpcode(1);
    checkRegisters({ H: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x25 - DEC H', () => {
    addressBus.setByte(0x0000, 0x25);
    addressBus.setByte(0x0001, 0x25);
    addressBus.setByte(0x0002, 0x25);

    cpuRegisters.H = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ H: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ H: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.H = 0x01;

    executeNextOpcode(1);
    checkRegisters({ H: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x26 - LD H,d8', () => {
    addressBus.setByte(0x0000, 0x26);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0x26);
    addressBus.setByte(0x0003, 0x34);

    executeNextOpcode(2);
    checkRegisters({ H: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ H: 0x34, PC: 0x0004 });
  });

  it('0x27 - DAA', () => {
    addressBus.setByte(0x0000, 0x27);
    addressBus.setByte(0x0001, 0x27);
    addressBus.setByte(0x0002, 0x27);
    addressBus.setByte(0x0003, 0x27);

    cpuRegisters.A = 0x00;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;
    cpuRegisters.flags.N = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x66, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0x0A;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    cpuRegisters.flags.N = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0xB0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    cpuRegisters.flags.N = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0003 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.A = 0x0A;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    cpuRegisters.flags.N = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0A, PC: 0x0004 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 0 });
  });

  it('0x28 - JR Z,r8', () => {
    addressBus.setByte(0x0000, 0x28);
    addressBus.setByte(0x0001, 0x20);
    addressBus.setByte(0x0022, 0x28);
    addressBus.setByte(0x0023, 0xF0);
    addressBus.setByte(0x0024, 0x28);
    addressBus.setByte(0x0025, 0xF0);

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0022 });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(2);
    checkRegisters({ PC: 0x0024 });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0016 });
  });

  it('0x29 - ADD HL,HL', () => {
    addressBus.setByte(0x0000, 0x29);
    addressBus.setByte(0x0001, 0x29);

    cpuRegisters.HL = 0x1111;
    executeNextOpcode(2);
    checkRegisters({ HL: 0x2222, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.HL = 0x0FFF;
    executeNextOpcode(2);
    checkRegisters({ HL: 0x1FFE, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x2A - LD A,(HL+)', () => {
    addressBus.setByte(0x0000, 0x2A);
    addressBus.setByte(0x0001, 0x2A);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus.setByte(0xC001, 0x34);
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x2B - DEC HL', () => {
    addressBus.setByte(0x0000, 0x2B);
    addressBus.setByte(0x0001, 0x2B);
    addressBus.setByte(0x0002, 0x2B);

    cpuRegisters.HL = 0x0002;

    executeNextOpcode(2);
    checkRegisters({ HL: 0x0001, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ HL: 0x0000, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ HL: 0xFFFF, PC: 0x0003 });
  });

  it('0x2C - INC L', () => {
    addressBus.setByte(0x0000, 0x2C);
    addressBus.setByte(0x0001, 0x2C);
    addressBus.setByte(0x0002, 0x2C);

    cpuRegisters.L = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ L: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ L: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.L = 0xFF;

    executeNextOpcode(1);
    checkRegisters({ L: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x2D - DEC L', () => {
    addressBus.setByte(0x0000, 0x2D);
    addressBus.setByte(0x0001, 0x2D);
    addressBus.setByte(0x0002, 0x2D);

    cpuRegisters.L = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ L: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ L: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.L = 0x01;

    executeNextOpcode(1);
    checkRegisters({ L: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x2E - LD L,d8', () => {
    addressBus.setByte(0x0000, 0x2E);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0x2E);
    addressBus.setByte(0x0003, 0x34);

    executeNextOpcode(2);
    checkRegisters({ L: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ L: 0x34, PC: 0x0004 });
  });

  it('0x2F - CPL', () => {
    addressBus.setByte(0x0000, 0x2F);
    addressBus.setByte(0x0001, 0x2F);
    addressBus.setByte(0x0002, 0x2F);

    cpuRegisters.A = 0x00;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0xFF, PC: 0x0001 });
    checkFlags({ Z: 1, N: 1, H: 1, C: 1 });

    cpuRegisters.A = 0xF0;
    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 1, C: 0 });
  });

  it('0x30 - JR NC,r8', () => {
    addressBus.setByte(0x0000, 0x30);
    addressBus.setByte(0x0001, 0x20);
    addressBus.setByte(0x0022, 0x30);
    addressBus.setByte(0x0023, 0xF0);
    addressBus.setByte(0x0024, 0x30);
    addressBus.setByte(0x0025, 0xF0);

    cpuRegisters.flags.C = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0022 });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ PC: 0x0024 });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0016 });
  });

  it('0x31 - LD SP,d16', () => {
    addressBus.setByte(0x0000, 0x31);
    addressBus.setWord(0x0001, 0x1234);
    addressBus.setByte(0x0003, 0x31);
    addressBus.setWord(0x0004, 0x5678);

    executeNextOpcode(3);
    checkRegisters({ SP: 0x1234, PC: 0x0003 });

    executeNextOpcode(3);
    checkRegisters({ SP: 0x5678, PC: 0x0006 });
  });

  it('0x32 - LD (HL-),A', () => {
    addressBus.setByte(0x0000, 0x32);
    addressBus.setByte(0x0001, 0x32);

    cpuRegisters.HL = 0xC001;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC001)).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x33 - INC SP', () => {
    addressBus.setByte(0x0000, 0x33);
    addressBus.setByte(0x0001, 0x33);
    addressBus.setByte(0x0002, 0x33);

    cpuRegisters.SP = 0xFFFD;

    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ SP: 0x0000, PC: 0x0003 });
  });

  it('0x34 - INC (HL)', () => {
    addressBus.setByte(0x0000, 0x34);
    addressBus.setByte(0x0001, 0x34);
    addressBus.setByte(0x0002, 0x34);

    addressBus.setByte(0xC000, 0x0E);

    cpuRegisters.HL = 0xC000;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0x0F);

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0x10);

    addressBus.setByte(0xC000, 0xFF);

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0x00);
  });

  it('0x35 - DEC (HL)', () => {
    addressBus.setByte(0x0000, 0x35);
    addressBus.setByte(0x0001, 0x35);
    addressBus.setByte(0x0002, 0x35);

    addressBus.setByte(0xC000, 0x11);

    cpuRegisters.HL = 0xC000;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0x10);

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0x0F);

    addressBus.setByte(0xC000, 0x01);

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
    expect(addressBus.getByte(0xC000)).to.equal(0x00);
  });

  it('0x36 - LD (HL),d8', () => {
    addressBus.setByte(0x0000, 0x36);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0x36);
    addressBus.setByte(0x0003, 0x34);

    cpuRegisters.HL = 0xC000;

    executeNextOpcode(3);
    expect(addressBus.getByte(0xC000)).to.equal(0x12);
    checkRegisters({ PC: 0x0002 });

    executeNextOpcode(3);
    expect(addressBus.getByte(0xC000)).to.equal(0x34);
    checkRegisters({ PC: 0x0004 });
  });

  it('0x37 - SCF', () => {
    addressBus.setByte(0x0000, 0x37);
    addressBus.setByte(0x0001, 0x37);

    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.C = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.N = 0;
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.C = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.N = 1;
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 1 });
  });

  it('0x38 - JR C,r8', () => {
    addressBus.setByte(0x0000, 0x38);
    addressBus.setByte(0x0001, 0x20);
    addressBus.setByte(0x0022, 0x38);
    addressBus.setByte(0x0023, 0xF0);
    addressBus.setByte(0x0024, 0x38);
    addressBus.setByte(0x0025, 0xF0);

    cpuRegisters.flags.C = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0022 });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ PC: 0x0024 });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0016 });
  });

  it('0x39 - ADD HL,SP', () => {
    addressBus.setByte(0x0000, 0x39);
    addressBus.setByte(0x0001, 0x39);

    cpuRegisters.HL = 0x0FFE;
    cpuRegisters.SP = 0x0002;
    executeNextOpcode(2);
    checkRegisters({ HL: 0x1000, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.HL = 0xFFFF;
    cpuRegisters.SP = 0xFFFF;
    executeNextOpcode(2);
    checkRegisters({ HL: 0xFFFE, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });
  });

  it('0x3A - LD A,(HL-)', () => {
    addressBus.setByte(0x0000, 0x3A);
    addressBus.setByte(0x0001, 0x3A);

    cpuRegisters.HL = 0xC001;

    addressBus.setByte(0xC001, 0x12);
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x3B - DEC SP', () => {
    addressBus.setByte(0x0000, 0x3B);
    addressBus.setByte(0x0001, 0x3B);
    addressBus.setByte(0x0002, 0x3B);

    cpuRegisters.SP = 0x0002;

    executeNextOpcode(2);
    checkRegisters({ SP: 0x0001, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ SP: 0x0000, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFF, PC: 0x0003 });
  });

  it('0x3C - INC A', () => {
    addressBus.setByte(0x0000, 0x3C);
    addressBus.setByte(0x0001, 0x3C);
    addressBus.setByte(0x0002, 0x3C);

    cpuRegisters.A = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.A = 0xFF;

    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x3D - DEC A', () => {
    addressBus.setByte(0x0000, 0x3D);
    addressBus.setByte(0x0001, 0x3D);
    addressBus.setByte(0x0002, 0x3D);

    cpuRegisters.A = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.A = 0x01;

    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x3E - LD A,d8', () => {
    addressBus.setByte(0x0000, 0x3E);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0x3E);
    addressBus.setByte(0x0003, 0x34);

    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0004 });
  });

  it('0x3F - CCF', () => {
    addressBus.setByte(0x0000, 0x3F);
    addressBus.setByte(0x0001, 0x3F);

    cpuRegisters.flags.Z = 0;
    cpuRegisters.flags.C = 0;
    cpuRegisters.flags.H = 0;
    cpuRegisters.flags.N = 0;
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.C = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.N = 1;
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0x40 - LD B,B', () => {
    addressBus.setByte(0x0000, 0x40);
    addressBus.setByte(0x0001, 0x40);

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x41 - LD B,C', () => {
    addressBus.setByte(0x0000, 0x41);
    addressBus.setByte(0x0001, 0x41);

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x42 - LD B,D', () => {
    addressBus.setByte(0x0000, 0x42);
    addressBus.setByte(0x0001, 0x42);

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x43 - LD B,E', () => {
    addressBus.setByte(0x0000, 0x43);
    addressBus.setByte(0x0001, 0x43);

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x44 - LD B,H', () => {
    addressBus.setByte(0x0000, 0x44);
    addressBus.setByte(0x0001, 0x44);

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x45 - LD B,L', () => {
    addressBus.setByte(0x0000, 0x45);
    addressBus.setByte(0x0001, 0x45);

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x46 - LD B,(HL)', () => {
    addressBus.setByte(0x0000, 0x46);
    addressBus.setByte(0x0001, 0x46);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x47 - LD B,A', () => {
    addressBus.setByte(0x0000, 0x47);
    addressBus.setByte(0x0001, 0x47);

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x48 - LD C,B', () => {
    addressBus.setByte(0x0000, 0x48);
    addressBus.setByte(0x0001, 0x48);

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x49 - LD C,C', () => {
    addressBus.setByte(0x0000, 0x49);
    addressBus.setByte(0x0001, 0x49);

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4A - LD C,D', () => {
    addressBus.setByte(0x0000, 0x4A);
    addressBus.setByte(0x0001, 0x4A);

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4B - LD C,E', () => {
    addressBus.setByte(0x0000, 0x4B);
    addressBus.setByte(0x0001, 0x4B);

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4C - LD C,H', () => {
    addressBus.setByte(0x0000, 0x4C);
    addressBus.setByte(0x0001, 0x4C);

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4D - LD C,L', () => {
    addressBus.setByte(0x0000, 0x4D);
    addressBus.setByte(0x0001, 0x4D);

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4E - LD C,(HL)', () => {
    addressBus.setByte(0x0000, 0x4E);
    addressBus.setByte(0x0001, 0x4E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4F - LD C,A', () => {
    addressBus.setByte(0x0000, 0x4F);
    addressBus.setByte(0x0001, 0x4F);

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x50 - LD D,B', () => {
    addressBus.setByte(0x0000, 0x50);
    addressBus.setByte(0x0001, 0x50);

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x51 - LD D,C', () => {
    addressBus.setByte(0x0000, 0x51);
    addressBus.setByte(0x0001, 0x51);

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x52 - LD D,D', () => {
    addressBus.setByte(0x0000, 0x52);
    addressBus.setByte(0x0001, 0x52);

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x53 - LD D,E', () => {
    addressBus.setByte(0x0000, 0x53);
    addressBus.setByte(0x0001, 0x53);

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x54 - LD D,H', () => {
    addressBus.setByte(0x0000, 0x54);
    addressBus.setByte(0x0001, 0x54);

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x55 - LD D,L', () => {
    addressBus.setByte(0x0000, 0x55);
    addressBus.setByte(0x0001, 0x55);

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x56 - LD D,(HL)', () => {
    addressBus.setByte(0x0000, 0x56);
    addressBus.setByte(0x0001, 0x56);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x57 - LD D,A', () => {
    addressBus.setByte(0x0000, 0x57);
    addressBus.setByte(0x0001, 0x57);

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x58 - LD E,B', () => {
    addressBus.setByte(0x0000, 0x58);
    addressBus.setByte(0x0001, 0x58);

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x59 - LD E,C', () => {
    addressBus.setByte(0x0000, 0x59);
    addressBus.setByte(0x0001, 0x59);

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5A - LD E,D', () => {
    addressBus.setByte(0x0000, 0x5A);
    addressBus.setByte(0x0001, 0x5A);

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5B - LD E,E', () => {
    addressBus.setByte(0x0000, 0x5B);
    addressBus.setByte(0x0001, 0x5B);

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5C - LD E,H', () => {
    addressBus.setByte(0x0000, 0x5C);
    addressBus.setByte(0x0001, 0x5C);

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5D - LD E,L', () => {
    addressBus.setByte(0x0000, 0x5D);
    addressBus.setByte(0x0001, 0x5D);

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5E - LD E,(HL)', () => {
    addressBus.setByte(0x0000, 0x5E);
    addressBus.setByte(0x0001, 0x5E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5F - LD E,A', () => {
    addressBus.setByte(0x0000, 0x5F);
    addressBus.setByte(0x0001, 0x5F);

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x60 - LD H,B', () => {
    addressBus.setByte(0x0000, 0x60);
    addressBus.setByte(0x0001, 0x60);

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x61 - LD H,C', () => {
    addressBus.setByte(0x0000, 0x61);
    addressBus.setByte(0x0001, 0x61);

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x62 - LD H,D', () => {
    addressBus.setByte(0x0000, 0x62);
    addressBus.setByte(0x0001, 0x62);

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x63 - LD H,E', () => {
    addressBus.setByte(0x0000, 0x63);
    addressBus.setByte(0x0001, 0x63);

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x64 - LD H,H', () => {
    addressBus.setByte(0x0000, 0x64);
    addressBus.setByte(0x0001, 0x64);

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x65 - LD H,L', () => {
    addressBus.setByte(0x0000, 0x65);
    addressBus.setByte(0x0001, 0x65);

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x66 - LD H,(HL)', () => {
    addressBus.setByte(0x0000, 0x66);
    addressBus.setByte(0x0001, 0x66);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x67 - LD H,A', () => {
    addressBus.setByte(0x0000, 0x67);
    addressBus.setByte(0x0001, 0x67);

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x68 - LD L,B', () => {
    addressBus.setByte(0x0000, 0x68);
    addressBus.setByte(0x0001, 0x68);

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x69 - LD L,C', () => {
    addressBus.setByte(0x0000, 0x69);
    addressBus.setByte(0x0001, 0x69);

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6A - LD L,D', () => {
    addressBus.setByte(0x0000, 0x6A);
    addressBus.setByte(0x0001, 0x6A);

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6B - LD L,E', () => {
    addressBus.setByte(0x0000, 0x6B);
    addressBus.setByte(0x0001, 0x6B);

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6C - LD L,H', () => {
    addressBus.setByte(0x0000, 0x6C);
    addressBus.setByte(0x0001, 0x6C);

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6D - LD L,L', () => {
    addressBus.setByte(0x0000, 0x6D);
    addressBus.setByte(0x0001, 0x6D);

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6E - LD L,(HL)', () => {
    addressBus.setByte(0x0000, 0x6E);
    addressBus.setByte(0x0001, 0x6E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6F - LD L,A', () => {
    addressBus.setByte(0x0000, 0x6F);
    addressBus.setByte(0x0001, 0x6F);

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x70 - LD (HL),B', () => {
    addressBus.setByte(0x0000, 0x70);
    addressBus.setByte(0x0001, 0x70);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.B = 0x12;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x71 - LD (HL),C', () => {
    addressBus.setByte(0x0000, 0x71);
    addressBus.setByte(0x0001, 0x71);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.C = 0x12;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x72 - LD (HL),D', () => {
    addressBus.setByte(0x0000, 0x72);
    addressBus.setByte(0x0001, 0x72);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.D = 0x12;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x73 - LD (HL),E', () => {
    addressBus.setByte(0x0000, 0x73);
    addressBus.setByte(0x0001, 0x73);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.E = 0x12;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x74 - LD (HL),H', () => {
    addressBus.setByte(0x0000, 0x74);
    addressBus.setByte(0x0001, 0x74);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.H = 0xC0;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0xC0);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.H = 0xC1;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC100)).to.equal(0xC1);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x75 - LD (HL),L', () => {
    addressBus.setByte(0x0000, 0x75);
    addressBus.setByte(0x0001, 0x75);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.L = 0x12;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC012)).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC034)).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x76 - HALT', () => {
    addressBus.setByte(0x0000, 0x76);

    const spy = sinon.spy(cpuCallbacks, 'halt');
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0001 });
    expect(spy.calledOnce).to.equal(true);
  });

  it('0x77 - LD (HL),A', () => {
    addressBus.setByte(0x0000, 0x77);
    addressBus.setByte(0x0001, 0x77);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xC000)).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x78 - LD A,B', () => {
    addressBus.setByte(0x0000, 0x78);
    addressBus.setByte(0x0001, 0x78);

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x79 - LD A,C', () => {
    addressBus.setByte(0x0000, 0x79);
    addressBus.setByte(0x0001, 0x79);

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7A - LD A,D', () => {
    addressBus.setByte(0x0000, 0x7A);
    addressBus.setByte(0x0001, 0x7A);

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7B - LD A,E', () => {
    addressBus.setByte(0x0000, 0x7B);
    addressBus.setByte(0x0001, 0x7B);

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7C - LD A,H', () => {
    addressBus.setByte(0x0000, 0x7C);
    addressBus.setByte(0x0001, 0x7C);

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7D - LD A,L', () => {
    addressBus.setByte(0x0000, 0x7D);
    addressBus.setByte(0x0001, 0x7D);

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7E - LD A,(HL)', () => {
    addressBus.setByte(0x0000, 0x7E);
    addressBus.setByte(0x0001, 0x7E);

    cpuRegisters.HL = 0xC000;

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7F - LD A,A', () => {
    addressBus.setByte(0x0000, 0x7F);
    addressBus.setByte(0x0001, 0x7F);

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x80 - ADD A,B', () => {
    addressBus.setByte(0x0000, 0x80);
    addressBus.setByte(0x0001, 0x80);

    cpuRegisters.A = 0x0F;
    cpuRegisters.B = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    cpuRegisters.B = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x81 - ADD A,C', () => {
    addressBus.setByte(0x0000, 0x81);
    addressBus.setByte(0x0001, 0x81);

    cpuRegisters.A = 0x0F;
    cpuRegisters.C = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    cpuRegisters.C = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x82 - ADD A,D', () => {
    addressBus.setByte(0x0000, 0x82);
    addressBus.setByte(0x0001, 0x82);

    cpuRegisters.A = 0x0F;
    cpuRegisters.D = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    cpuRegisters.D = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x83 - ADD A,E', () => {
    addressBus.setByte(0x0000, 0x83);
    addressBus.setByte(0x0001, 0x83);

    cpuRegisters.A = 0x0F;
    cpuRegisters.E = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    cpuRegisters.E = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x84 - ADD A,H', () => {
    addressBus.setByte(0x0000, 0x84);
    addressBus.setByte(0x0001, 0x84);

    cpuRegisters.A = 0x0F;
    cpuRegisters.H = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    cpuRegisters.H = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x85 - ADD A,L', () => {
    addressBus.setByte(0x0000, 0x85);
    addressBus.setByte(0x0001, 0x85);

    cpuRegisters.A = 0x0F;
    cpuRegisters.L = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    cpuRegisters.L = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x86 - ADD A,(HL)', () => {
    addressBus.setByte(0x0000, 0x86);
    addressBus.setByte(0x0001, 0x86);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.A = 0x0F;
    addressBus.setByte(0xC000, 0x01);
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    addressBus.setByte(0xC000, 0x01);
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x87 - ADD A,A', () => {
    addressBus.setByte(0x0000, 0x87);
    addressBus.setByte(0x0001, 0x87);

    cpuRegisters.A = 0x0F;
    executeNextOpcode(1);
    checkRegisters({ A: 0x1E, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    executeNextOpcode(1);
    checkRegisters({ A: 0xFE, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });
  });

  it('0x88 - ADC A,B', () => {
    addressBus.setByte(0x0000, 0x88);
    addressBus.setByte(0x0001, 0x88);

    cpuRegisters.A = 0x0F;
    cpuRegisters.B = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x0F;
    cpuRegisters.B = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x11, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x89 - ADC A,C', () => {
    addressBus.setByte(0x0000, 0x89);
    addressBus.setByte(0x0001, 0x89);

    cpuRegisters.A = 0x0F;
    cpuRegisters.C = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x0F;
    cpuRegisters.C = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x11, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x8A - ADC A,D', () => {
    addressBus.setByte(0x0000, 0x8A);
    addressBus.setByte(0x0001, 0x8A);

    cpuRegisters.A = 0x0F;
    cpuRegisters.D = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x0F;
    cpuRegisters.D = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x11, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x8B - ADC A,E', () => {
    addressBus.setByte(0x0000, 0x8B);
    addressBus.setByte(0x0001, 0x8B);

    cpuRegisters.A = 0x0F;
    cpuRegisters.E = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x0F;
    cpuRegisters.E = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x11, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x8C - ADC A,H', () => {
    addressBus.setByte(0x0000, 0x8C);
    addressBus.setByte(0x0001, 0x8C);

    cpuRegisters.A = 0x0F;
    cpuRegisters.H = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x0F;
    cpuRegisters.H = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x11, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x8D - ADC A,L', () => {
    addressBus.setByte(0x0000, 0x8D);
    addressBus.setByte(0x0001, 0x8D);

    cpuRegisters.A = 0x0F;
    cpuRegisters.L = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x0F;
    cpuRegisters.L = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x11, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x8E - ADC A,(HL)', () => {
    addressBus.setByte(0x0000, 0x8E);
    addressBus.setByte(0x0001, 0x8E);

    cpuRegisters.A = 0x0F;
    cpuRegisters.HL = 0x000C;
    cpuRegisters.flags.C = 0;
    addressBus.setByte(0x000C, 0x01);
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x0F;
    cpuRegisters.HL = 0x000C;
    cpuRegisters.flags.C = 1;
    addressBus.setByte(0x000C, 0x01);
    executeNextOpcode(2);
    checkRegisters({ A: 0x11, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x8F - ADC A,A', () => {
    addressBus.setByte(0x0000, 0x8F);
    addressBus.setByte(0x0001, 0x8F);

    cpuRegisters.A = 0x08;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x08;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x11, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x90 - SUB B', () => {
    addressBus.setByte(0x0000, 0x90);
    addressBus.setByte(0x0001, 0x90);

    cpuRegisters.A = 0x10;
    cpuRegisters.B = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.B = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0xFF, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0x91 - SUB C', () => {
    addressBus.setByte(0x0000, 0x91);
    addressBus.setByte(0x0001, 0x91);

    cpuRegisters.A = 0x10;
    cpuRegisters.C = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.C = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0xFF, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0x92 - SUB D', () => {
    addressBus.setByte(0x0000, 0x92);
    addressBus.setByte(0x0001, 0x92);

    cpuRegisters.A = 0x10;
    cpuRegisters.D = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.D = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0xFF, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0x93 - SUB E', () => {
    addressBus.setByte(0x0000, 0x93);
    addressBus.setByte(0x0001, 0x93);

    cpuRegisters.A = 0x10;
    cpuRegisters.E = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.E = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0xFF, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0x94 - SUB H', () => {
    addressBus.setByte(0x0000, 0x94);
    addressBus.setByte(0x0001, 0x94);

    cpuRegisters.A = 0x10;
    cpuRegisters.H = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.H = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0xFF, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0x95 - SUB L', () => {
    addressBus.setByte(0x0000, 0x95);
    addressBus.setByte(0x0001, 0x95);

    cpuRegisters.A = 0x10;
    cpuRegisters.L = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.L = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0xFF, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0x96 - SUB (HL)', () => {
    addressBus.setByte(0x0000, 0x96);
    addressBus.setByte(0x0001, 0x96);

    cpuRegisters.A = 0x10;
    cpuRegisters.HL = 0xC000;
    addressBus.setByte(0xC000, 0x01);
    executeNextOpcode(2);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.HL = 0xC000;
    addressBus.setByte(0xC000, 0x01);
    executeNextOpcode(2);
    checkRegisters({ A: 0xFF, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0x97 - SUB A', () => {
    addressBus.setByte(0x0000, 0x97);
    addressBus.setByte(0x0001, 0x97);

    cpuRegisters.A = 0x10;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 0 });

    cpuRegisters.A = 0xFF;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 0 });
  });

  it('0x98 - SBC A,B', () => {
    addressBus.setByte(0x0000, 0x98);
    addressBus.setByte(0x0001, 0x98);

    cpuRegisters.A = 0x10;
    cpuRegisters.B = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x10;
    cpuRegisters.B = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0E, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });
  });

  it('0x99 - SBC A,C', () => {
    addressBus.setByte(0x0000, 0x99);
    addressBus.setByte(0x0001, 0x99);

    cpuRegisters.A = 0x10;
    cpuRegisters.C = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x10;
    cpuRegisters.C = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0E, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });
  });

  it('0x9A - SBC A,D', () => {
    addressBus.setByte(0x0000, 0x9A);
    addressBus.setByte(0x0001, 0x9A);

    cpuRegisters.A = 0x10;
    cpuRegisters.D = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x10;
    cpuRegisters.D = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0E, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });
  });

  it('0x9B - SBC A,E', () => {
    addressBus.setByte(0x0000, 0x9B);
    addressBus.setByte(0x0001, 0x9B);

    cpuRegisters.A = 0x10;
    cpuRegisters.E = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x10;
    cpuRegisters.E = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0E, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });
  });

  it('0x9C - SBC A,H', () => {
    addressBus.setByte(0x0000, 0x9C);
    addressBus.setByte(0x0001, 0x9C);

    cpuRegisters.A = 0x10;
    cpuRegisters.H = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x10;
    cpuRegisters.H = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0E, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });
  });

  it('0x9D - SBC A,L', () => {
    addressBus.setByte(0x0000, 0x9D);
    addressBus.setByte(0x0001, 0x9D);

    cpuRegisters.A = 0x10;
    cpuRegisters.L = 0x01;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x10;
    cpuRegisters.L = 0x01;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0x0E, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });
  });

  it('0x9E - SBC A,(HL)', () => {
    addressBus.setByte(0x0000, 0x9E);
    addressBus.setByte(0x0001, 0x9E);

    cpuRegisters.HL = 0xC000;
    addressBus.setByte(0xC000, 0x01);

    cpuRegisters.A = 0x10;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x10;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ A: 0x0E, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });
  });

  it('0x9F - SBC A,A', () => {
    addressBus.setByte(0x0000, 0x9F);
    addressBus.setByte(0x0001, 0x9F);

    cpuRegisters.A = 0x10;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 0 });

    cpuRegisters.A = 0x10;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(1);
    checkRegisters({ A: 0xFF, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xA0 - AND B', () => {
    addressBus.setByte(0x0000, 0xA0);
    addressBus.setByte(0x0001, 0xA0);
    addressBus.setByte(0x0002, 0xA0);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.B = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
  });

  it('0xA1 - AND C', () => {
    addressBus.setByte(0x0000, 0xA1);
    addressBus.setByte(0x0001, 0xA1);
    addressBus.setByte(0x0002, 0xA1);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.C = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
  });

  it('0xA2 - AND D', () => {
    addressBus.setByte(0x0000, 0xA2);
    addressBus.setByte(0x0001, 0xA2);
    addressBus.setByte(0x0002, 0xA2);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.D = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
  });

  it('0xA3 - AND E', () => {
    addressBus.setByte(0x0000, 0xA3);
    addressBus.setByte(0x0001, 0xA3);
    addressBus.setByte(0x0002, 0xA3);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.E = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
  });

  it('0xA4 - AND H', () => {
    addressBus.setByte(0x0000, 0xA4);
    addressBus.setByte(0x0001, 0xA4);
    addressBus.setByte(0x0002, 0xA4);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.H = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
  });

  it('0xA5 - AND L', () => {
    addressBus.setByte(0x0000, 0xA5);
    addressBus.setByte(0x0001, 0xA5);
    addressBus.setByte(0x0002, 0xA5);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.L = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
  });

  it('0xA6 - AND (HL)', () => {
    addressBus.setByte(0x0000, 0xA6);
    addressBus.setByte(0x0001, 0xA6);
    addressBus.setByte(0x0002, 0xA6);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x12;
    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    addressBus.setByte(0xC000, 0x00);
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
  });

  it('0xA7 - AND A', () => {
    addressBus.setByte(0x0000, 0xA7);
    addressBus.setByte(0x0001, 0xA7);
    addressBus.setByte(0x0002, 0xA7);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
  });

  it('0xA8 - XOR B', () => {
    addressBus.setByte(0x0000, 0xA8);
    addressBus.setByte(0x0001, 0xA8);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0});

    cpuRegisters.A = 0x12;
    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x26, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0xA9 - XOR C', () => {
    addressBus.setByte(0x0000, 0xA9);
    addressBus.setByte(0x0001, 0xA9);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x26, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0xAA - XOR D', () => {
    addressBus.setByte(0x0000, 0xAA);
    addressBus.setByte(0x0001, 0xAA);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x26, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0xAB - XOR E', () => {
    addressBus.setByte(0x0000, 0xAB);
    addressBus.setByte(0x0001, 0xAB);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x26, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0xAC - XOR H', () => {
    addressBus.setByte(0x0000, 0xAC);
    addressBus.setByte(0x0001, 0xAC);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x26, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0xAD - XOR L', () => {
    addressBus.setByte(0x0000, 0xAD);
    addressBus.setByte(0x0001, 0xAD);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x26, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0xAE - XOR (HL)', () => {
    addressBus.setByte(0x0000, 0xAE);
    addressBus.setByte(0x0001, 0xAE);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ A: 0x26, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0xAF - XOR A', () => {
    addressBus.setByte(0x0000, 0xAF);
    addressBus.setByte(0x0001, 0xAF);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xB0 - OR B', () => {
    addressBus.setByte(0x0000, 0xB0);
    addressBus.setByte(0x0001, 0xB0);
    addressBus.setByte(0x0002, 0xB0);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x36, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.B = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xB1 - OR C', () => {
    addressBus.setByte(0x0000, 0xB1);
    addressBus.setByte(0x0001, 0xB1);
    addressBus.setByte(0x0002, 0xB1);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x36, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.C = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xB2 - OR D', () => {
    addressBus.setByte(0x0000, 0xB2);
    addressBus.setByte(0x0001, 0xB2);
    addressBus.setByte(0x0002, 0xB2);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x36, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.D = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xB3 - OR E', () => {
    addressBus.setByte(0x0000, 0xB3);
    addressBus.setByte(0x0001, 0xB3);
    addressBus.setByte(0x0002, 0xB3);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x36, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.E = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xB4 - OR H', () => {
    addressBus.setByte(0x0000, 0xB4);
    addressBus.setByte(0x0001, 0xB4);
    addressBus.setByte(0x0002, 0xB4);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x36, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.H = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xB5 - OR L', () => {
    addressBus.setByte(0x0000, 0xB5);
    addressBus.setByte(0x0001, 0xB5);
    addressBus.setByte(0x0002, 0xB5);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x36, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.L = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xB6 - OR (HL)', () => {
    addressBus.setByte(0x0000, 0xB6);
    addressBus.setByte(0x0001, 0xB6);
    addressBus.setByte(0x0002, 0xB6);

    cpuRegisters.HL = 0xC000;

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(2);
    checkRegisters({ A: 0x36, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x00;
    addressBus.setByte(0xC000, 0x00);
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xB7 - OR A', () => {
    addressBus.setByte(0x0000, 0xB7);
    addressBus.setByte(0x0001, 0xB7);
    addressBus.setByte(0x0002, 0xB7);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x00;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xB8 - CP B', () => {
    addressBus.setByte(0x0000, 0xB8);
    addressBus.setByte(0x0001, 0xB8);

    cpuRegisters.A = 0x10;
    cpuRegisters.B = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.B = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xB9 - CP C', () => {
    addressBus.setByte(0x0000, 0xB9);
    addressBus.setByte(0x0001, 0xB9);

    cpuRegisters.A = 0x10;
    cpuRegisters.C = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.C = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xBA - CP D', () => {
    addressBus.setByte(0x0000, 0xBA);
    addressBus.setByte(0x0001, 0xBA);

    cpuRegisters.A = 0x10;
    cpuRegisters.D = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.D = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xBB - CP E', () => {
    addressBus.setByte(0x0000, 0xBB);
    addressBus.setByte(0x0001, 0xBB);

    cpuRegisters.A = 0x10;
    cpuRegisters.E = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.E = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xBC - CP H', () => {
    addressBus.setByte(0x0000, 0xBC);
    addressBus.setByte(0x0001, 0xBC);

    cpuRegisters.A = 0x10;
    cpuRegisters.H = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.H = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xBD - CP L', () => {
    addressBus.setByte(0x0000, 0xBD);
    addressBus.setByte(0x0001, 0xBD);

    cpuRegisters.A = 0x10;
    cpuRegisters.L = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.L = 0x01;
    executeNextOpcode(1);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xBE - CP (HL)', () => {
    addressBus.setByte(0x0000, 0xBE);
    addressBus.setByte(0x0001, 0xBE);

    cpuRegisters.A = 0x10;
    cpuRegisters.HL = 0xC000;
    addressBus.setByte(0xC000, 0x01);
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.HL = 0xC000;
    addressBus.setByte(0xC000, 0x01);
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xBF - CP A', () => {
    addressBus.setByte(0x0000, 0xBF);
    addressBus.setByte(0x0001, 0xBF);

    cpuRegisters.A = 0x10;
    executeNextOpcode(1);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 0 });

    cpuRegisters.A = 0xFF;
    executeNextOpcode(1);
    checkRegisters({ A: 0xFF, PC: 0x0002 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 0 });
  });

  it('0xC0 - RET NZ', () => {
    addressBus.setByte(0x0000, 0xC0);
    addressBus.setByte(0x0001, 0xC0);

    cpuRegisters.SP = 0xFFFC;
    addressBus.setWord(0xFFFC, 0x1234);

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(5);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
  });

  it('0xC1 - POP BC', () => {
    addressBus.setByte(0x0000, 0xC1);
    addressBus.setByte(0x0001, 0xC1);

    cpuRegisters.SP = 0xFFFA;
    addressBus.setWord(0xFFFA, 0x1234);
    addressBus.setWord(0xFFFC, 0x5678);

    executeNextOpcode(3);
    checkRegisters({ BC: 0x1234, SP: 0xFFFC, PC: 0x0001 });

    executeNextOpcode(3);
    checkRegisters({ BC: 0x5678, SP: 0xFFFE, PC: 0x0002 });
  });

  it('0xC2 - JP NZ,a16', () => {
    addressBus.setByte(0x0000, 0xC2);
    addressBus.setWord(0x0001, 0x0012);
    addressBus.setByte(0x0003, 0xC2);
    addressBus.setWord(0x0004, 0x0034);

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xC3 - JP a16', () => {
    addressBus.setByte(0x0000, 0xC3);
    addressBus.setWord(0x0001, 0x0012);
    addressBus.setByte(0x0012, 0xC3);
    addressBus.setWord(0x0013, 0x0034);

    executeNextOpcode(4);
    checkRegisters({ PC: 0x0012 });

    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xC4 - CALL NZ,a16', () => {
    addressBus.setByte(0x1111, 0xC4);
    addressBus.setWord(0x1112, 0x1234);
    addressBus.setByte(0x1114, 0xC4);
    addressBus.setWord(0x1115, 0x1345);

    cpuRegisters.PC = 0x1111;
    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x1114, SP: 0xFFFE });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(6);
    checkRegisters({ PC: 0x1345, SP: 0xFFFC });
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x1117);
  });

  it('0xC5 - PUSH BC', () => {
    addressBus.setByte(0x0000, 0xC5);
    addressBus.setByte(0x0001, 0xC5);

    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.BC = 0x1234;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });
    addressBus.setWord(cpuRegisters.SP, 0x1234);

    cpuRegisters.BC = 0x5678;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFA, PC: 0x0002 });
    addressBus.setWord(cpuRegisters.SP, 0x5678);
  });

  it('0xC6 - ADD A,d8', () => {
    addressBus.setByte(0x0000, 0xC6);
    addressBus.setByte(0x0001, 0x01);
    addressBus.setByte(0x0002, 0xC6);
    addressBus.setByte(0x0003, 0x01);

    cpuRegisters.A = 0x0F;
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0004 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0xC7 - RST 00H', () => {
    addressBus.setByte(0x0123, 0xC7);
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x0124);
    checkRegisters({ PC: 0x0000, SP: 0xFFFC });
  });

  it('0xC8 - RET Z', () => {
    addressBus.setByte(0x0000, 0xC8);
    addressBus.setByte(0x0001, 0xC8);

    cpuRegisters.SP = 0xFFFC;
    addressBus.setWord(0xFFFC, 0x1234);

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(5);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
  });

  it('0xC9 - RET', () => {
    addressBus.setByte(0x0000, 0xC9);

    cpuRegisters.SP = 0xFFFC;
    addressBus.setWord(0xFFFC, 0x1234);

    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
  });

  it('0xCA - JP Z,a16', () => {
    addressBus.setByte(0x0000, 0xCA);
    addressBus.setWord(0x0001, 0x0012);
    addressBus.setByte(0x0003, 0xCA);
    addressBus.setWord(0x0004, 0x0034);

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xCC - CALL Z,a16', () => {
    addressBus.setByte(0x1111, 0xCC);
    addressBus.setWord(0x1112, 0x1234);
    addressBus.setByte(0x1114, 0xCC);
    addressBus.setWord(0x1115, 0x1345);

    cpuRegisters.PC = 0x1111;
    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x1114, SP: 0xFFFE });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(6);
    checkRegisters({ PC: 0x1345, SP: 0xFFFC });
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x1117);
  });

  it('0xCD - CALL a16', () => {
    addressBus.setByte(0x1111, 0xCD);
    addressBus.setWord(0x1112, 0x1234);

    cpuRegisters.PC = 0x1111;
    cpuRegisters.SP = 0xFFFE;

    executeNextOpcode(6);
    checkRegisters({ PC: 0x1234, SP: 0xFFFC });
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x1114);
  });

  it('0xCE - ADC A,d8', () => {
    addressBus.setByte(0x0000, 0xCE);
    addressBus.setByte(0x0001, 0x01);
    addressBus.setByte(0x0002, 0xCE);
    addressBus.setByte(0x0003, 0x01);

    cpuRegisters.A = 0x0F;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x0F;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ A: 0x11, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0xCF - RST 08H', () => {
    addressBus.setByte(0x0123, 0xCF);
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x0124);
    checkRegisters({ PC: 0x0008, SP: 0xFFFC });
  });

  it('0xD0 - RET NC', () => {
    addressBus.setByte(0x0000, 0xD0);
    addressBus.setByte(0x0001, 0xD0);

    cpuRegisters.SP = 0xFFFC;
    addressBus.setWord(0xFFFC, 0x1234);

    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(5);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
  });

  it('0xD1 - POP DE', () => {
    addressBus.setByte(0x0000, 0xD1);
    addressBus.setByte(0x0001, 0xD1);

    cpuRegisters.SP = 0xFFFA;
    addressBus.setWord(0xFFFA, 0x1234);
    addressBus.setWord(0xFFFC, 0x5678);

    executeNextOpcode(3);
    checkRegisters({ DE: 0x1234, SP: 0xFFFC, PC: 0x0001 });

    executeNextOpcode(3);
    checkRegisters({ DE: 0x5678, SP: 0xFFFE, PC: 0x0002 });
  });

  it('0xD2 - JP NC,a16', () => {
    addressBus.setByte(0x0000, 0xD2);
    addressBus.setWord(0x0001, 0x0012);
    addressBus.setByte(0x0003, 0xD2);
    addressBus.setWord(0x0004, 0x0034);

    cpuRegisters.flags.C = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xD4 - CALL NC,a16', () => {
    addressBus.setByte(0x1111, 0xD4);
    addressBus.setWord(0x1112, 0x1234);
    addressBus.setByte(0x1114, 0xD4);
    addressBus.setWord(0x1115, 0x1345);

    cpuRegisters.PC = 0x1111;
    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.flags.C = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x1114, SP: 0xFFFE });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(6);
    checkRegisters({ PC: 0x1345, SP: 0xFFFC });
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x1117);
  });

  it('0xD5 - PUSH DE', () => {
    addressBus.setByte(0x0000, 0xD5);
    addressBus.setByte(0x0001, 0xD5);

    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.DE = 0x1234;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });
    addressBus.setWord(cpuRegisters.SP, 0x1234);

    cpuRegisters.DE = 0x5678;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFA, PC: 0x0002 });
    addressBus.setWord(cpuRegisters.SP, 0x5678);
  });

  it('0xD6 - SUB d8', () => {
    addressBus.setByte(0x0000, 0xD6);
    addressBus.setByte(0x0001, 0x01);
    addressBus.setByte(0x0002, 0xD6);
    addressBus.setByte(0x0003, 0x01);

    cpuRegisters.A = 0x10;
    executeNextOpcode(2);
    checkRegisters({ A: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    executeNextOpcode(2);
    checkRegisters({ A: 0xFF, PC: 0x0004 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xD7 - RST 10H', () => {
    addressBus.setByte(0x0123, 0xD7);
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x0124);
    checkRegisters({ PC: 0x0010, SP: 0xFFFC });
  });

  it('0xD8 - RET C', () => {
    addressBus.setByte(0x0000, 0xD8);
    addressBus.setByte(0x0001, 0xD8);

    cpuRegisters.SP = 0xFFFC;
    addressBus.setWord(0xFFFC, 0x1234);

    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(5);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
  });

  it('0xD9 - RETI', () => {
    addressBus.setByte(0x0000, 0xD9);

    cpuRegisters.SP = 0xFFFC;
    addressBus.setWord(0xFFFC, 0x1234);

    const spy = sinon.spy(cpuCallbacks, 'enableInterrupts');
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
    expect(spy.calledOnce).to.equal(true);
  });

  it('0xDA - JP C,a16', () => {
    addressBus.setByte(0x0000, 0xDA);
    addressBus.setWord(0x0001, 0x0012);
    addressBus.setByte(0x0003, 0xDA);
    addressBus.setWord(0x0004, 0x0034);

    cpuRegisters.flags.C = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xDC - CALL C,a16', () => {
    addressBus.setByte(0x1111, 0xDC);
    addressBus.setWord(0x1112, 0x1234);
    addressBus.setByte(0x1114, 0xDC);
    addressBus.setWord(0x1115, 0x1345);

    cpuRegisters.PC = 0x1111;
    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.flags.C = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x1114, SP: 0xFFFE });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(6);
    checkRegisters({ PC: 0x1345, SP: 0xFFFC });
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x1117);
  });

  it('0xDE - SBC A,d8', () => {
    addressBus.setByte(0x0000, 0xDE);
    addressBus.setByte(0x0001, 0x01);
    addressBus.setByte(0x0002, 0xDE);
    addressBus.setByte(0x0003, 0x01);

    cpuRegisters.A = 0x10;
    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ A: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x10;
    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ A: 0x0E, PC: 0x0004 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });
  });

  it('0xDF - RST 18H', () => {
    addressBus.setByte(0x0123, 0xDF);
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x0124);
    checkRegisters({ PC: 0x0018, SP: 0xFFFC });
  });

  it('0xE0 - LDH (a8),A', () => {
    addressBus.setByte(0x0000, 0xE0);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0xE0);
    addressBus.setByte(0x0003, 0x34);

    cpuRegisters.A = 0x56;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.getByte(0xFF12)).to.equal(0x56);

    cpuRegisters.A = 0x78;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.getByte(0xFF34)).to.equal(0x78);
  });

  it('0xE1 - POP HL', () => {
    addressBus.setByte(0x0000, 0xE1);
    addressBus.setByte(0x0001, 0xE1);

    cpuRegisters.SP = 0xFFFA;
    addressBus.setWord(0xFFFA, 0x1234);
    addressBus.setWord(0xFFFC, 0x5678);

    executeNextOpcode(3);
    checkRegisters({ HL: 0x1234, SP: 0xFFFC, PC: 0x0001 });

    executeNextOpcode(3);
    checkRegisters({ HL: 0x5678, SP: 0xFFFE, PC: 0x0002 });
  });

  it('0xE2 - LD (C),A', () => {
    addressBus.setByte(0x0000, 0xE2);
    addressBus.setByte(0x0001, 0xE2);

    cpuRegisters.C = 0x12;
    cpuRegisters.A = 0x34;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xFF12)).to.equal(0x34);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.C = 0x13;
    cpuRegisters.A = 0x56;
    executeNextOpcode(2);
    expect(addressBus.getByte(0xFF13)).to.equal(0x56);
    checkRegisters({ PC: 0x0002 });
  });

  it('0xE5 - PUSH HL', () => {
    addressBus.setByte(0x0000, 0xE5);
    addressBus.setByte(0x0001, 0xE5);

    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.HL = 0x1234;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });
    addressBus.setWord(cpuRegisters.SP, 0x1234);

    cpuRegisters.HL = 0x5678;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFA, PC: 0x0002 });
    addressBus.setWord(cpuRegisters.SP, 0x5678);
  });

  it('0xE6 - AND d8', () => {
    addressBus.setByte(0x0000, 0xE6);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0xE6);
    addressBus.setByte(0x0003, 0x34);
    addressBus.setByte(0x0004, 0xE6);
    addressBus.setByte(0x0005, 0x00);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0006 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
  });

  it('0xE7 - RST 20H', () => {
    addressBus.setByte(0x0123, 0xE7);
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x0124);
    checkRegisters({ PC: 0x0020, SP: 0xFFFC });
  });

  it('0xE8 - ADD SP,r8', () => {
    addressBus.setByte(0x0000, 0xE8);
    addressBus.setByte(0x0001, 0x03);
    addressBus.setByte(0x0002, 0xE8);
    addressBus.setByte(0x0003, 0xFD);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.SP = 0x0FFE;
    executeNextOpcode(4);
    checkRegisters({ SP: 0x1001, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.SP = 0x0FFE;
    executeNextOpcode(4);
    checkRegisters({ SP: 0x0FFB, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });
  });

  it('0xE9 - JP HL', () => {
    addressBus.setByte(0x0000, 0xE9);
    addressBus.setByte(0x0012, 0xE9);

    cpuRegisters.HL = 0x0012;
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0012 });

    cpuRegisters.HL = 0xC123;
    executeNextOpcode(1);
    checkRegisters({ PC: 0xC123 });
  });

  it('0xEA - LD (a16),A', () => {
    addressBus.setByte(0x0000, 0xEA);
    addressBus.setWord(0x0001, 0xC000);
    addressBus.setByte(0x0003, 0xEA);
    addressBus.setWord(0x0004, 0xC001);

    cpuRegisters.A = 0x12;
    executeNextOpcode(4);
    expect(addressBus.getByte(0xC000)).to.equal(0x12);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(4);
    expect(addressBus.getByte(0xC001)).to.equal(0x34);
    checkRegisters({ PC: 0x0006 });
  });

  it('0xEE - XOR d8', () => {
    addressBus.setByte(0x0000, 0xEE);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0xEE);
    addressBus.setByte(0x0003, 0x34);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x26, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0xEF - RST 28H', () => {
    addressBus.setByte(0x0123, 0xEF);
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x0124);
    checkRegisters({ PC: 0x0028, SP: 0xFFFC });
  });

  it('0xF0 - LDH A,(a8)', () => {
    addressBus.setByte(0x0000, 0xF0);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0xF0);
    addressBus.setByte(0x0003, 0x34);

    addressBus.setByte(0xFF12, 0x56);
    addressBus.setByte(0xFF34, 0x78);

    executeNextOpcode(3);
    checkRegisters({ A: 0x56, PC: 0x0002 });

    executeNextOpcode(3);
    checkRegisters({ A: 0x78, PC: 0x0004 });
  });

  it('0xF1 - POP AF', () => {
    addressBus.setByte(0x0000, 0xF1);
    addressBus.setByte(0x0001, 0xF1);

    cpuRegisters.SP = 0xFFFA;
    addressBus.setWord(0xFFFA, 0x1234);
    addressBus.setWord(0xFFFC, 0x5678);

    executeNextOpcode(3);
    checkRegisters({ AF: (0x1234 & ~0b1111), SP: 0xFFFC, PC: 0x0001 });

    executeNextOpcode(3);
    checkRegisters({ AF: (0x5678 & ~0b1111), SP: 0xFFFE, PC: 0x0002 });
  });

  it('0xF2 - LD A,(C)', () => {
    addressBus.setByte(0x0000, 0xF2);
    addressBus.setByte(0x0001, 0xF2);

    cpuRegisters.C = 0x12;
    addressBus.setByte(0xFF12, 0x34);
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0001 });

    cpuRegisters.C = 0x13;
    addressBus.setByte(0xFF13, 0x56);
    executeNextOpcode(2);
    checkRegisters({ A: 0x56, PC: 0x0002 });
  });

  it('0xF3 - DI', () => {
    addressBus.setByte(0x0000, 0xF3);

    const spy = sinon.spy(cpuCallbacks, 'disableInterrupts');
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0001 });
    expect(spy.calledOnce).to.equal(true);
  });

  it('0xF5 - PUSH AF', () => {
    addressBus.setByte(0x0000, 0xF5);
    addressBus.setByte(0x0001, 0xF5);

    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.AF = 0x1234;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });
    addressBus.setWord(cpuRegisters.SP, 0x1234);

    cpuRegisters.AF = 0x5678;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFA, PC: 0x0002 });
    addressBus.setWord(cpuRegisters.SP, 0x5678);
  });

  it('0xF6 - OR d8', () => {
    addressBus.setByte(0x0000, 0xF6);
    addressBus.setByte(0x0001, 0x12);
    addressBus.setByte(0x0002, 0xF6);
    addressBus.setByte(0x0003, 0x34);
    addressBus.setByte(0x0004, 0xF6);
    addressBus.setByte(0x0005, 0x00);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x36, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x00;
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0006 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xF7 - RST 30H', () => {
    addressBus.setByte(0x0123, 0xF7);
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x0124);
    checkRegisters({ PC: 0x0030, SP: 0xFFFC });
  });

  it('0xF8 - LD HL,SP+r8', () => {
    addressBus.setByte(0x0000, 0xF8);
    addressBus.setByte(0x0001, 0x03);
    addressBus.setByte(0x0002, 0xF8);
    addressBus.setByte(0x0003, 0xFD);

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.SP = 0x1234;
    executeNextOpcode(3);
    checkRegisters({ HL: 0x1237, PC: 0x0002 });

    cpuRegisters.SP = 0x1234;
    executeNextOpcode(3);
    checkRegisters({ HL: 0x1231, PC: 0x0004 });
  });

  it('0xF9 - LD SP,HL', () => {
    addressBus.setByte(0x0000, 0xF9);
    addressBus.setByte(0x0001, 0xF9);

    cpuRegisters.HL = 0x1234;
    executeNextOpcode(2);
    checkRegisters({ SP: 0x1234, PC: 0x0001 });

    cpuRegisters.HL = 0x5678;
    executeNextOpcode(2);
    checkRegisters({ HL: 0x5678, PC: 0x0002 });
  });

  it('0xFA - LD A,(a16)', () => {
    addressBus.setByte(0x0000, 0xFA);
    addressBus.setWord(0x0001, 0xC000);
    addressBus.setByte(0x0003, 0xFA);
    addressBus.setWord(0x0004, 0xC000);

    addressBus.setByte(0xC000, 0x12);
    executeNextOpcode(4);
    checkRegisters({ A: 0x12, PC: 0x0003 });

    addressBus.setByte(0xC000, 0x34);
    executeNextOpcode(4);
    checkRegisters({ A: 0x34, PC: 0x0006 });
  });

  it('0xFB - EI', () => {
    addressBus.setByte(0x0000, 0xFB);

    const spy = sinon.spy(cpuCallbacks, 'enableInterrupts');
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0001 });
    expect(spy.calledOnce).to.equal(true);
  });

  it('0xFE - CP d8', () => {
    addressBus.setByte(0x0000, 0xFE);
    addressBus.setByte(0x0001, 0x01);
    addressBus.setByte(0x0002, 0xFE);
    addressBus.setByte(0x0003, 0x01);

    cpuRegisters.A = 0x10;
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0004 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xFF - RST 38H', () => {
    addressBus.setByte(0x0123, 0xFF);
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.getWord(cpuRegisters.SP)).to.equal(0x0124);
    checkRegisters({ PC: 0x0038, SP: 0xFFFC });
  });
});
