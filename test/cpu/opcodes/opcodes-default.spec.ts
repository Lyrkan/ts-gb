import 'mocha';
import { expect } from 'chai';
import { OPCODES_DEFAULT } from '../../../src/cpu/opcodes/opcodes-default';
import { CpuRegisters } from '../../../src/cpu/cpu-registers';
import { AddressBus } from '../../../src/memory/address-bus';
import { GameCartridge } from '../../../src/cartridge/game-cartridge';

describe('Opcodes - Default table', () => {
  let cpuRegisters: CpuRegisters;
  let addressBus: AddressBus;

  const executeNextOpcode = (expectedCycles: number) => {
    const cycles = OPCODES_DEFAULT[addressBus[cpuRegisters.PC++].byte](cpuRegisters, addressBus);
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
    cpuRegisters = new CpuRegisters();
    cpuRegisters.PC = 0x0000;
    cpuRegisters.SP = 0xFFFE;

    addressBus = new AddressBus();
    addressBus.loadCartridge(new GameCartridge(new ArrayBuffer(32 * 1024)));
  });

  it('0x00 - NOP', () => {
    addressBus[0x0000].byte = 0x00;
    addressBus[0x0001].byte = 0x00;

    executeNextOpcode(4);
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x01 - LD BC,d16', () => {
    addressBus[0x0000].byte = 0x01;
    addressBus[0x0001].word = 0x1234;
    addressBus[0x0003].byte = 0x01;
    addressBus[0x0004].word = 0x5678;

    executeNextOpcode(12);
    checkRegisters({ BC: 0x1234, PC: 0x0003 });
  });

  it('0x02 - LD (BC),A', () => {
    addressBus[0x0000].byte = 0x02;
    addressBus[0x0001].byte = 0x02;
    addressBus[0xC000].byte = 0x12;
    addressBus[0xC001].byte = 0x34;

    cpuRegisters.A = 0x56;
    cpuRegisters.BC = 0xC000;

    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x56);
    expect(addressBus[0xC001].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.BC = 0xC001;

    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x56);
    expect(addressBus[0xC001].byte).to.equal(0x56);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x03 - INC BC', () => {
    addressBus[0x0000].byte = 0x03;
    addressBus[0x0001].byte = 0x03;
    addressBus[0x0002].byte = 0x03;

    cpuRegisters.BC = 0xFFFD;

    executeNextOpcode(8);
    checkRegisters({ BC: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(8);
    checkRegisters({ BC: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ BC: 0x0000, PC: 0x0003 });
  });

  it('0x04 - INC B', () => {
    addressBus[0x0000].byte = 0x04;
    addressBus[0x0001].byte = 0x04;
    addressBus[0x0002].byte = 0x04;

    cpuRegisters.B = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ B: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ B: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.B = 0xFF;

    executeNextOpcode(4);
    checkRegisters({ B: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x05 - DEC B', () => {
    addressBus[0x0000].byte = 0x05;
    addressBus[0x0001].byte = 0x05;
    addressBus[0x0002].byte = 0x05;

    cpuRegisters.B = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ B: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ B: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.B = 0x01;

    executeNextOpcode(4);
    checkRegisters({ B: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x06 - LD B,d8', () => {
    addressBus[0x0000].byte = 0x06;
    addressBus[0x0001].byte = 0x12;
    addressBus[0x0002].byte = 0x06;
    addressBus[0x0003].byte = 0x34;

    executeNextOpcode(8);
    checkRegisters({ B: 0x12, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ B: 0x34, PC: 0x0004 });
  });

  it('0x07 - RLCA');
  it('0x08 - LD (a16),SP');
  it('0x09 - ADD HL,BC');

  it('0x0A - LD A,(BC)', () => {
    addressBus[0x0000].byte = 0x0A;
    addressBus[0x0001].byte = 0x0A;

    cpuRegisters.BC = 0xC000;

    addressBus[0xC000].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus[0xC000].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x0B - DEC BC', () => {
    addressBus[0x0000].byte = 0x0B;
    addressBus[0x0001].byte = 0x0B;
    addressBus[0x0002].byte = 0x0B;

    cpuRegisters.BC = 0x0002;

    executeNextOpcode(8);
    checkRegisters({ BC: 0x0001, PC: 0x0001 });

    executeNextOpcode(8);
    checkRegisters({ BC: 0x0000, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ BC: 0xFFFF, PC: 0x0003 });
  });

  it('0x0C - INC C', () => {
    addressBus[0x0000].byte = 0x0C;
    addressBus[0x0001].byte = 0x0C;
    addressBus[0x0002].byte = 0x0C;

    cpuRegisters.C = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ C: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ C: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.C = 0xFF;

    executeNextOpcode(4);
    checkRegisters({ C: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x0D - DEC C', () => {
    addressBus[0x0000].byte = 0x0D;
    addressBus[0x0001].byte = 0x0D;
    addressBus[0x0002].byte = 0x0D;

    cpuRegisters.C = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ C: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ C: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.C = 0x01;

    executeNextOpcode(4);
    checkRegisters({ C: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x0E - LD C,d8', () => {
    addressBus[0x0000].byte = 0x0E;
    addressBus[0x0001].byte = 0x12;
    addressBus[0x0002].byte = 0x0E;
    addressBus[0x0003].byte = 0x34;

    executeNextOpcode(8);
    checkRegisters({ C: 0x12, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ C: 0x34, PC: 0x0004 });
  });

  it('0x0F - RRCA');
  it('0x10 - STOP 0');

  it('0x11 - LD DE,d16', () => {
    addressBus[0x0000].byte = 0x11;
    addressBus[0x0001].word = 0x1234;
    addressBus[0x0003].byte = 0x11;
    addressBus[0x0004].word = 0x5678;

    executeNextOpcode(12);
    checkRegisters({ DE: 0x1234, PC: 0x0003 });
  });

  it('0x12 - LD (DE),A', () => {
    addressBus[0x0000].byte = 0x12;
    addressBus[0x0001].byte = 0x12;

    cpuRegisters.DE = 0xC000;

    cpuRegisters.A = 0x12;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x13 - INC DE', () => {
    addressBus[0x0000].byte = 0x13;
    addressBus[0x0001].byte = 0x13;
    addressBus[0x0002].byte = 0x13;

    cpuRegisters.DE = 0xFFFD;

    executeNextOpcode(8);
    checkRegisters({ DE: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(8);
    checkRegisters({ DE: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ DE: 0x0000, PC: 0x0003 });
  });

  it('0x14 - INC D', () => {
    addressBus[0x0000].byte = 0x14;
    addressBus[0x0001].byte = 0x14;
    addressBus[0x0002].byte = 0x14;

    cpuRegisters.D = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ D: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ D: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.D = 0xFF;

    executeNextOpcode(4);
    checkRegisters({ D: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x15 - DEC D', () => {
    addressBus[0x0000].byte = 0x15;
    addressBus[0x0001].byte = 0x15;
    addressBus[0x0002].byte = 0x15;

    cpuRegisters.D = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ D: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ D: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.D = 0x01;

    executeNextOpcode(4);
    checkRegisters({ D: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x16 - LD D,d8', () => {
    addressBus[0x0000].byte = 0x16;
    addressBus[0x0001].byte = 0x12;
    addressBus[0x0002].byte = 0x16;
    addressBus[0x0003].byte = 0x34;

    executeNextOpcode(8);
    checkRegisters({ D: 0x12, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ D: 0x34, PC: 0x0004 });
  });

  it('0x17 - RLA');

  it('0x18 - JR r8', () => {
    addressBus[0x0000].byte = 0x18;
    addressBus[0x0001].byte = 0x20;
    addressBus[0x0022].byte = 0x18;
    addressBus[0x0023].byte = 0xF0;
    addressBus[0x0014].byte = 0x18;
    addressBus[0x0015].byte = 0x10;

    executeNextOpcode(12);
    checkRegisters({ PC: 0x0022 });

    executeNextOpcode(12);
    checkRegisters({ PC: 0x0014 });

    executeNextOpcode(12);
    checkRegisters({ PC: 0x0026 });
  });

  it('0x19 - ADD HL,DE');

  it('0x1A - LD A,(DE)', () => {
    addressBus[0x0000].byte = 0x1A;
    addressBus[0x0001].byte = 0x1A;

    cpuRegisters.DE = 0xC000;

    addressBus[0xC000].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus[0xC000].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x1B - DEC DE', () => {
    addressBus[0x0000].byte = 0x1B;
    addressBus[0x0001].byte = 0x1B;
    addressBus[0x0002].byte = 0x1B;

    cpuRegisters.DE = 0x0002;

    executeNextOpcode(8);
    checkRegisters({ DE: 0x0001, PC: 0x0001 });

    executeNextOpcode(8);
    checkRegisters({ DE: 0x0000, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ DE: 0xFFFF, PC: 0x0003 });
  });

  it('0x1C - INC E', () => {
    addressBus[0x0000].byte = 0x1C;
    addressBus[0x0001].byte = 0x1C;
    addressBus[0x0002].byte = 0x1C;

    cpuRegisters.E = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ E: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ E: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.E = 0xFF;

    executeNextOpcode(4);
    checkRegisters({ E: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x1D - DEC E', () => {
    addressBus[0x0000].byte = 0x1D;
    addressBus[0x0001].byte = 0x1D;
    addressBus[0x0002].byte = 0x1D;

    cpuRegisters.E = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ E: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ E: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.E = 0x01;

    executeNextOpcode(4);
    checkRegisters({ E: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x1E - LD E,d8', () => {
    addressBus[0x0000].byte = 0x1E;
    addressBus[0x0001].byte = 0x12;
    addressBus[0x0002].byte = 0x1E;
    addressBus[0x0003].byte = 0x34;

    executeNextOpcode(8);
    checkRegisters({ E: 0x12, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ E: 0x34, PC: 0x0004 });
  });

  it('0x1F - RRA');

  it('0x20 - JR NZ,r8', () => {
    addressBus[0x0000].byte = 0x20;
    addressBus[0x0001].byte = 0x20;
    addressBus[0x0022].byte = 0x20;
    addressBus[0x0023].byte = 0xF0;
    addressBus[0x0024].byte = 0x20;
    addressBus[0x0025].byte = 0xF0;

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0022 });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(8);
    checkRegisters({ PC: 0x0024 });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0016 });
  });

  it('0x21 - LD HL,d16', () => {
    addressBus[0x0000].byte = 0x21;
    addressBus[0x0001].word = 0x1234;
    addressBus[0x0003].byte = 0x21;
    addressBus[0x0004].word = 0x5678;

    executeNextOpcode(12);
    checkRegisters({ HL: 0x1234, PC: 0x0003 });

    executeNextOpcode(12);
    checkRegisters({ HL: 0x5678, PC: 0x0006 });
  });

  it('0x22 - LD (HL+),A', () => {
    addressBus[0x0000].byte = 0x22;
    addressBus[0x0001].byte = 0x22;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.A = 0x12;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(8);
    expect(addressBus[0xC001].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x23 - INC HL', () => {
    addressBus[0x0000].byte = 0x23;
    addressBus[0x0001].byte = 0x23;
    addressBus[0x0002].byte = 0x23;

    cpuRegisters.HL = 0xFFFD;

    executeNextOpcode(8);
    checkRegisters({ HL: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(8);
    checkRegisters({ HL: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ HL: 0x0000, PC: 0x0003 });
  });

  it('0x24 - INC H', () => {
    addressBus[0x0000].byte = 0x24;
    addressBus[0x0001].byte = 0x24;
    addressBus[0x0002].byte = 0x24;

    cpuRegisters.H = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ H: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ H: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.H = 0xFF;

    executeNextOpcode(4);
    checkRegisters({ H: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x25 - DEC H', () => {
    addressBus[0x0000].byte = 0x25;
    addressBus[0x0001].byte = 0x25;
    addressBus[0x0002].byte = 0x25;

    cpuRegisters.H = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ H: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ H: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.H = 0x01;

    executeNextOpcode(4);
    checkRegisters({ H: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x26 - LD H,d8', () => {
    addressBus[0x0000].byte = 0x26;
    addressBus[0x0001].byte = 0x12;
    addressBus[0x0002].byte = 0x26;
    addressBus[0x0003].byte = 0x34;

    executeNextOpcode(8);
    checkRegisters({ H: 0x12, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ H: 0x34, PC: 0x0004 });
  });

  it('0x27 - DAA');

  it('0x28 - JR Z,r8', () => {
    addressBus[0x0000].byte = 0x28;
    addressBus[0x0001].byte = 0x20;
    addressBus[0x0022].byte = 0x28;
    addressBus[0x0023].byte = 0xF0;
    addressBus[0x0024].byte = 0x28;
    addressBus[0x0025].byte = 0xF0;

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0022 });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(8);
    checkRegisters({ PC: 0x0024 });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0016 });
  });

  it('0x29 - ADD HL,HL');

  it('0x2A - LD A,(HL+)', () => {
    addressBus[0x0000].byte = 0x2A;
    addressBus[0x0001].byte = 0x2A;

    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus[0xC001].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x2B - DEC HL', () => {
    addressBus[0x0000].byte = 0x2B;
    addressBus[0x0001].byte = 0x2B;
    addressBus[0x0002].byte = 0x2B;

    cpuRegisters.HL = 0x0002;

    executeNextOpcode(8);
    checkRegisters({ HL: 0x0001, PC: 0x0001 });

    executeNextOpcode(8);
    checkRegisters({ HL: 0x0000, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ HL: 0xFFFF, PC: 0x0003 });
  });

  it('0x2C - INC L', () => {
    addressBus[0x0000].byte = 0x2C;
    addressBus[0x0001].byte = 0x2C;
    addressBus[0x0002].byte = 0x2C;

    cpuRegisters.L = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ L: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ L: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.L = 0xFF;

    executeNextOpcode(4);
    checkRegisters({ L: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x2D - DEC L', () => {
    addressBus[0x0000].byte = 0x2D;
    addressBus[0x0001].byte = 0x2D;
    addressBus[0x0002].byte = 0x2D;

    cpuRegisters.L = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ L: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ L: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.L = 0x01;

    executeNextOpcode(4);
    checkRegisters({ L: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x2E - LD L,d8', () => {
    addressBus[0x0000].byte = 0x2E;
    addressBus[0x0001].byte = 0x12;
    addressBus[0x0002].byte = 0x2E;
    addressBus[0x0003].byte = 0x34;

    executeNextOpcode(8);
    checkRegisters({ L: 0x12, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ L: 0x34, PC: 0x0004 });
  });

  it('0x2F - CPL');

  it('0x30 - JR NC,r8', () => {
    addressBus[0x0000].byte = 0x30;
    addressBus[0x0001].byte = 0x20;
    addressBus[0x0022].byte = 0x30;
    addressBus[0x0023].byte = 0xF0;
    addressBus[0x0024].byte = 0x30;
    addressBus[0x0025].byte = 0xF0;

    cpuRegisters.flags.C = 0;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0022 });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(8);
    checkRegisters({ PC: 0x0024 });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0016 });
  });

  it('0x31 - LD SP,d16', () => {
    addressBus[0x0000].byte = 0x31;
    addressBus[0x0001].word = 0x1234;
    addressBus[0x0003].byte = 0x31;
    addressBus[0x0004].word = 0x5678;

    executeNextOpcode(12);
    checkRegisters({ SP: 0x1234, PC: 0x0003 });

    executeNextOpcode(12);
    checkRegisters({ SP: 0x5678, PC: 0x0006 });
  });

  it('0x32 - LD (HL-),A', () => {
    addressBus[0x0000].byte = 0x32;
    addressBus[0x0001].byte = 0x32;

    cpuRegisters.HL = 0xC001;

    cpuRegisters.A = 0x12;
    executeNextOpcode(8);
    expect(addressBus[0xC001].byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x33 - INC SP', () => {
    addressBus[0x0000].byte = 0x33;
    addressBus[0x0001].byte = 0x33;
    addressBus[0x0002].byte = 0x33;

    cpuRegisters.SP = 0xFFFD;

    executeNextOpcode(8);
    checkRegisters({ SP: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(8);
    checkRegisters({ SP: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ SP: 0x0000, PC: 0x0003 });
  });

  it('0x34 - INC (HL)');
  it('0x35 - DEC (HL)');

  it('0x36 - LD (HL),d8', () => {
    addressBus[0x0000].byte = 0x36;
    addressBus[0x0001].byte = 0x12;
    addressBus[0x0002].byte = 0x36;
    addressBus[0x0003].byte = 0x34;

    cpuRegisters.HL = 0xC000;

    executeNextOpcode(12);
    expect(addressBus[0xC000].byte).to.equal(0x12);
    checkRegisters({ PC: 0x0002 });

    executeNextOpcode(12);
    expect(addressBus[0xC000].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0004 });
  });

  it('0x37 - SCF');

  it('0x38 - JR C,r8', () => {
    addressBus[0x0000].byte = 0x38;
    addressBus[0x0001].byte = 0x20;
    addressBus[0x0022].byte = 0x38;
    addressBus[0x0023].byte = 0xF0;
    addressBus[0x0024].byte = 0x38;
    addressBus[0x0025].byte = 0xF0;

    cpuRegisters.flags.C = 1;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0022 });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(8);
    checkRegisters({ PC: 0x0024 });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0016 });
  });

  it('0x39 - ADD HL,SP');

  it('0x3A - LD A,(HL-)', () => {
    addressBus[0x0000].byte = 0x3A;
    addressBus[0x0001].byte = 0x3A;

    cpuRegisters.HL = 0xC001;

    addressBus[0xC001].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus[0xC000].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x3B - DEC SP', () => {
    addressBus[0x0000].byte = 0x3B;
    addressBus[0x0001].byte = 0x3B;
    addressBus[0x0002].byte = 0x3B;

    cpuRegisters.SP = 0x0002;

    executeNextOpcode(8);
    checkRegisters({ SP: 0x0001, PC: 0x0001 });

    executeNextOpcode(8);
    checkRegisters({ SP: 0x0000, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ SP: 0xFFFF, PC: 0x0003 });
  });

  it('0x3C - INC A', () => {
    addressBus[0x0000].byte = 0x3C;
    addressBus[0x0001].byte = 0x3C;
    addressBus[0x0002].byte = 0x3C;

    cpuRegisters.A = 0x0E;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });

    cpuRegisters.A = 0xFF;

    executeNextOpcode(4);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x3D - DEC A', () => {
    addressBus[0x0000].byte = 0x3D;
    addressBus[0x0001].byte = 0x3D;
    addressBus[0x0002].byte = 0x3D;

    cpuRegisters.A = 0x11;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(4);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });

    executeNextOpcode(4);
    checkRegisters({ A: 0x0F, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });

    cpuRegisters.A = 0x01;

    executeNextOpcode(4);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
  });

  it('0x3E - LD A,d8', () => {
    addressBus[0x0000].byte = 0x3E;
    addressBus[0x0001].byte = 0x12;
    addressBus[0x0002].byte = 0x3E;
    addressBus[0x0003].byte = 0x34;

    executeNextOpcode(8);
    checkRegisters({ A: 0x12, PC: 0x0002 });

    executeNextOpcode(8);
    checkRegisters({ A: 0x34, PC: 0x0004 });
  });

  it('0x3F - CCF');

  it('0x40 - LD B,B', () => {
    addressBus[0x0000].byte = 0x40;
    addressBus[0x0001].byte = 0x40;

    cpuRegisters.B = 0x12;
    executeNextOpcode(4);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(4);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x41 - LD B,C', () => {
    addressBus[0x0000].byte = 0x41;
    addressBus[0x0001].byte = 0x41;

    cpuRegisters.C = 0x12;
    executeNextOpcode(4);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(4);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x42 - LD B,D', () => {
    addressBus[0x0000].byte = 0x42;
    addressBus[0x0001].byte = 0x42;

    cpuRegisters.D = 0x12;
    executeNextOpcode(4);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(4);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x43 - LD B,E', () => {
    addressBus[0x0000].byte = 0x43;
    addressBus[0x0001].byte = 0x43;

    cpuRegisters.E = 0x12;
    executeNextOpcode(4);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(4);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x44 - LD B,H', () => {
    addressBus[0x0000].byte = 0x44;
    addressBus[0x0001].byte = 0x44;

    cpuRegisters.H = 0x12;
    executeNextOpcode(4);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(4);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x45 - LD B,L', () => {
    addressBus[0x0000].byte = 0x45;
    addressBus[0x0001].byte = 0x45;

    cpuRegisters.L = 0x12;
    executeNextOpcode(4);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(4);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x46 - LD B,(HL)', () => {
    addressBus[0x0000].byte = 0x46;
    addressBus[0x0001].byte = 0x46;

    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    addressBus[0xC000].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x47 - LD B,A', () => {
    addressBus[0x0000].byte = 0x47;
    addressBus[0x0001].byte = 0x47;

    cpuRegisters.A = 0x12;
    executeNextOpcode(4);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(4);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x48 - LD C,B', () => {
    addressBus[0x0000].byte = 0x48;
    addressBus[0x0001].byte = 0x48;

    cpuRegisters.B = 0x12;
    executeNextOpcode(4);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(4);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x49 - LD C,C', () => {
    addressBus[0x0000].byte = 0x49;
    addressBus[0x0001].byte = 0x49;

    cpuRegisters.C = 0x12;
    executeNextOpcode(4);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(4);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4A - LD C,D', () => {
    addressBus[0x0000].byte = 0x4A;
    addressBus[0x0001].byte = 0x4A;

    cpuRegisters.D = 0x12;
    executeNextOpcode(4);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(4);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4B - LD C,E', () => {
    addressBus[0x0000].byte = 0x4B;
    addressBus[0x0001].byte = 0x4B;

    cpuRegisters.E = 0x12;
    executeNextOpcode(4);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(4);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4C - LD C,H', () => {
    addressBus[0x0000].byte = 0x4C;
    addressBus[0x0001].byte = 0x4C;

    cpuRegisters.H = 0x12;
    executeNextOpcode(4);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(4);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4D - LD C,L', () => {
    addressBus[0x0000].byte = 0x4D;
    addressBus[0x0001].byte = 0x4D;

    cpuRegisters.L = 0x12;
    executeNextOpcode(4);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(4);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4E - LD C,(HL)', () => {
    addressBus[0x0000].byte = 0x4E;
    addressBus[0x0001].byte = 0x4E;

    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    addressBus[0xC000].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4F - LD C,A', () => {
    addressBus[0x0000].byte = 0x4F;
    addressBus[0x0001].byte = 0x4F;

    cpuRegisters.A = 0x12;
    executeNextOpcode(4);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(4);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x50 - LD D,B', () => {
    addressBus[0x0000].byte = 0x50;
    addressBus[0x0001].byte = 0x50;

    cpuRegisters.B = 0x12;
    executeNextOpcode(4);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(4);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x51 - LD D,C', () => {
    addressBus[0x0000].byte = 0x51;
    addressBus[0x0001].byte = 0x51;

    cpuRegisters.C = 0x12;
    executeNextOpcode(4);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(4);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x52 - LD D,D', () => {
    addressBus[0x0000].byte = 0x52;
    addressBus[0x0001].byte = 0x52;

    cpuRegisters.D = 0x12;
    executeNextOpcode(4);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(4);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x53 - LD D,E', () => {
    addressBus[0x0000].byte = 0x53;
    addressBus[0x0001].byte = 0x53;

    cpuRegisters.E = 0x12;
    executeNextOpcode(4);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(4);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x54 - LD D,H', () => {
    addressBus[0x0000].byte = 0x54;
    addressBus[0x0001].byte = 0x54;

    cpuRegisters.H = 0x12;
    executeNextOpcode(4);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(4);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x55 - LD D,L', () => {
    addressBus[0x0000].byte = 0x55;
    addressBus[0x0001].byte = 0x55;

    cpuRegisters.L = 0x12;
    executeNextOpcode(4);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(4);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x56 - LD D,(HL)', () => {
    addressBus[0x0000].byte = 0x56;
    addressBus[0x0001].byte = 0x56;

    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    addressBus[0xC000].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x57 - LD D,A', () => {
    addressBus[0x0000].byte = 0x57;
    addressBus[0x0001].byte = 0x57;

    cpuRegisters.A = 0x12;
    executeNextOpcode(4);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(4);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x58 - LD E,B', () => {
    addressBus[0x0000].byte = 0x58;
    addressBus[0x0001].byte = 0x58;

    cpuRegisters.B = 0x12;
    executeNextOpcode(4);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(4);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x59 - LD E,C', () => {
    addressBus[0x0000].byte = 0x59;
    addressBus[0x0001].byte = 0x59;

    cpuRegisters.C = 0x12;
    executeNextOpcode(4);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(4);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5A - LD E,D', () => {
    addressBus[0x0000].byte = 0x5A;
    addressBus[0x0001].byte = 0x5A;

    cpuRegisters.D = 0x12;
    executeNextOpcode(4);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(4);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5B - LD E,E', () => {
    addressBus[0x0000].byte = 0x5B;
    addressBus[0x0001].byte = 0x5B;

    cpuRegisters.E = 0x12;
    executeNextOpcode(4);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(4);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5C - LD E,H', () => {
    addressBus[0x0000].byte = 0x5C;
    addressBus[0x0001].byte = 0x5C;

    cpuRegisters.H = 0x12;
    executeNextOpcode(4);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(4);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5D - LD E,L', () => {
    addressBus[0x0000].byte = 0x5D;
    addressBus[0x0001].byte = 0x5D;

    cpuRegisters.L = 0x12;
    executeNextOpcode(4);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(4);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5E - LD E,(HL)', () => {
    addressBus[0x0000].byte = 0x5E;
    addressBus[0x0001].byte = 0x5E;

    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    addressBus[0xC000].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5F - LD E,A', () => {
    addressBus[0x0000].byte = 0x5F;
    addressBus[0x0001].byte = 0x5F;

    cpuRegisters.A = 0x12;
    executeNextOpcode(4);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(4);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x60 - LD H,B', () => {
    addressBus[0x0000].byte = 0x60;
    addressBus[0x0001].byte = 0x60;

    cpuRegisters.B = 0x12;
    executeNextOpcode(4);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(4);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x61 - LD H,C', () => {
    addressBus[0x0000].byte = 0x61;
    addressBus[0x0001].byte = 0x61;

    cpuRegisters.C = 0x12;
    executeNextOpcode(4);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(4);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x62 - LD H,D', () => {
    addressBus[0x0000].byte = 0x62;
    addressBus[0x0001].byte = 0x62;

    cpuRegisters.D = 0x12;
    executeNextOpcode(4);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(4);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x63 - LD H,E', () => {
    addressBus[0x0000].byte = 0x63;
    addressBus[0x0001].byte = 0x63;

    cpuRegisters.E = 0x12;
    executeNextOpcode(4);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(4);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x64 - LD H,H', () => {
    addressBus[0x0000].byte = 0x64;
    addressBus[0x0001].byte = 0x64;

    cpuRegisters.H = 0x12;
    executeNextOpcode(4);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(4);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x65 - LD H,L', () => {
    addressBus[0x0000].byte = 0x65;
    addressBus[0x0001].byte = 0x65;

    cpuRegisters.L = 0x12;
    executeNextOpcode(4);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(4);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x66 - LD H,(HL)', () => {
    addressBus[0x0000].byte = 0x66;
    addressBus[0x0001].byte = 0x66;

    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x67 - LD H,A', () => {
    addressBus[0x0000].byte = 0x67;
    addressBus[0x0001].byte = 0x67;

    cpuRegisters.A = 0x12;
    executeNextOpcode(4);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(4);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x68 - LD L,B', () => {
    addressBus[0x0000].byte = 0x68;
    addressBus[0x0001].byte = 0x68;

    cpuRegisters.B = 0x12;
    executeNextOpcode(4);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(4);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x69 - LD L,C', () => {
    addressBus[0x0000].byte = 0x69;
    addressBus[0x0001].byte = 0x69;

    cpuRegisters.C = 0x12;
    executeNextOpcode(4);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(4);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6A - LD L,D', () => {
    addressBus[0x0000].byte = 0x6A;
    addressBus[0x0001].byte = 0x6A;

    cpuRegisters.D = 0x12;
    executeNextOpcode(4);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(4);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6B - LD L,E', () => {
    addressBus[0x0000].byte = 0x6B;
    addressBus[0x0001].byte = 0x6B;

    cpuRegisters.E = 0x12;
    executeNextOpcode(4);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(4);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6C - LD L,H', () => {
    addressBus[0x0000].byte = 0x6C;
    addressBus[0x0001].byte = 0x6C;

    cpuRegisters.H = 0x12;
    executeNextOpcode(4);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(4);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6D - LD L,L', () => {
    addressBus[0x0000].byte = 0x6D;
    addressBus[0x0001].byte = 0x6D;

    cpuRegisters.L = 0x12;
    executeNextOpcode(4);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(4);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6E - LD L,(HL)', () => {
    addressBus[0x0000].byte = 0x6E;
    addressBus[0x0001].byte = 0x6E;

    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6F - LD L,A', () => {
    addressBus[0x0000].byte = 0x6F;
    addressBus[0x0001].byte = 0x6F;

    cpuRegisters.A = 0x12;
    executeNextOpcode(4);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(4);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x70 - LD (HL),B', () => {
    addressBus[0x0000].byte = 0x70;
    addressBus[0x0001].byte = 0x70;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.B = 0x12;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x71 - LD (HL),C', () => {
    addressBus[0x0000].byte = 0x71;
    addressBus[0x0001].byte = 0x71;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.C = 0x12;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x72 - LD (HL),D', () => {
    addressBus[0x0000].byte = 0x72;
    addressBus[0x0001].byte = 0x72;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.D = 0x12;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x73 - LD (HL),E', () => {
    addressBus[0x0000].byte = 0x73;
    addressBus[0x0001].byte = 0x73;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.E = 0x12;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x74 - LD (HL),H', () => {
    addressBus[0x0000].byte = 0x74;
    addressBus[0x0001].byte = 0x74;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.H = 0xC0;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0xC0);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.H = 0xC1;
    executeNextOpcode(8);
    expect(addressBus[0xC100].byte).to.equal(0xC1);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x75 - LD (HL),L', () => {
    addressBus[0x0000].byte = 0x75;
    addressBus[0x0001].byte = 0x75;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.L = 0x12;
    executeNextOpcode(8);
    expect(addressBus[0xC012].byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(8);
    expect(addressBus[0xC034].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x76 - HALT');

  it('0x77 - LD (HL),A', () => {
    addressBus[0x0000].byte = 0x77;
    addressBus[0x0001].byte = 0x77;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.A = 0x12;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(8);
    expect(addressBus[0xC000].byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x78 - LD A,B', () => {
    addressBus[0x0000].byte = 0x78;
    addressBus[0x0001].byte = 0x78;

    cpuRegisters.B = 0x12;
    executeNextOpcode(4);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(4);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x79 - LD A,C', () => {
    addressBus[0x0000].byte = 0x79;
    addressBus[0x0001].byte = 0x79;

    cpuRegisters.C = 0x12;
    executeNextOpcode(4);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(4);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7A - LD A,D', () => {
    addressBus[0x0000].byte = 0x7A;
    addressBus[0x0001].byte = 0x7A;

    cpuRegisters.D = 0x12;
    executeNextOpcode(4);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(4);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7B - LD A,E', () => {
    addressBus[0x0000].byte = 0x7B;
    addressBus[0x0001].byte = 0x7B;

    cpuRegisters.E = 0x12;
    executeNextOpcode(4);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(4);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7C - LD A,H', () => {
    addressBus[0x0000].byte = 0x7C;
    addressBus[0x0001].byte = 0x7C;

    cpuRegisters.H = 0x12;
    executeNextOpcode(4);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(4);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7D - LD A,L', () => {
    addressBus[0x0000].byte = 0x7D;
    addressBus[0x0001].byte = 0x7D;

    cpuRegisters.L = 0x12;
    executeNextOpcode(4);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(4);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7E - LD A,(HL)', () => {
    addressBus[0x0000].byte = 0x7E;
    addressBus[0x0001].byte = 0x7E;

    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].byte = 0x12;
    executeNextOpcode(8);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus[0xC000].byte = 0x34;
    executeNextOpcode(8);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7F - LD A,A', () => {
    addressBus[0x0000].byte = 0x7F;
    addressBus[0x0001].byte = 0x7F;

    cpuRegisters.A = 0x12;
    executeNextOpcode(4);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(4);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x80 - ADD A,B');
  it('0x81 - ADD A,C');
  it('0x82 - ADD A,D');
  it('0x83 - ADD A,E');
  it('0x84 - ADD A,H');
  it('0x85 - ADD A,L');
  it('0x86 - ADD A,(HL)');
  it('0x87 - ADD A,A');
  it('0x88 - ADC A,B');
  it('0x89 - ADC A,C');
  it('0x8A - ADC A,D');
  it('0x8B - ADC A,E');
  it('0x8C - ADC A,H');
  it('0x8D - ADC A,L');
  it('0x8E - ADC A,(HL)');
  it('0x8F - ADC A,A');
  it('0x90 - SUB B');
  it('0x91 - SUB C');
  it('0x92 - SUB D');
  it('0x93 - SUB E');
  it('0x94 - SUB H');
  it('0x95 - SUB L');
  it('0x96 - SUB (HL)');
  it('0x97 - SUB A');
  it('0x98 - SBC A,B');
  it('0x99 - SBC A,C');
  it('0x9A - SBC A,D');
  it('0x9B - SBC A,E');
  it('0x9C - SBC A,H');
  it('0x9D - SBC A,L');
  it('0x9E - SBC A,(HL)');
  it('0x9F - SBC A,A');
  it('0xA0 - AND B');
  it('0xA1 - AND C');
  it('0xA2 - AND D');
  it('0xA3 - AND E');
  it('0xA4 - AND H');
  it('0xA5 - AND L');
  it('0xA6 - AND (HL)');
  it('0xA7 - AND A');
  it('0xA8 - XOR B');
  it('0xA9 - XOR C');
  it('0xAA - XOR D');
  it('0xAB - XOR E');
  it('0xAC - XOR H');
  it('0xAD - XOR L');
  it('0xAE - XOR (HL)');
  it('0xAF - XOR A');
  it('0xB0 - OR B');
  it('0xB1 - OR C');
  it('0xB2 - OR D');
  it('0xB3 - OR E');
  it('0xB4 - OR H');
  it('0xB5 - OR L');
  it('0xB6 - OR (HL)');
  it('0xB7 - OR A');
  it('0xB8 - CP B');
  it('0xB9 - CP C');
  it('0xBA - CP D');
  it('0xBB - CP E');
  it('0xBC - CP H');
  it('0xBD - CP L');
  it('0xBE - CP (HL)');
  it('0xBF - CP A');
  it('0xC0 - RET NZ');
  it('0xC1 - POP BC');

  it('0xC2 - JP NZ,a16', () => {
    addressBus[0x0000].byte = 0xC2;
    addressBus[0x0001].word = 0x0012;
    addressBus[0x0003].byte = 0xC2;
    addressBus[0x0004].word = 0x0034;

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xC3 - JP a16', () => {
    addressBus[0x0000].byte = 0xC3;
    addressBus[0x0001].word = 0x0012;
    addressBus[0x0012].byte = 0xC3;
    addressBus[0x0013].word = 0x0034;

    executeNextOpcode(16);
    checkRegisters({ PC: 0x0012 });

    executeNextOpcode(16);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xC4 - CALL NZ,a16');
  it('0xC5 - PUSH BC');
  it('0xC6 - ADD A,d8');
  it('0xC7 - RST 00H');
  it('0xC8 - RET Z');
  it('0xC9 - RET');

  it('0xCA - JP Z,a16', () => {
    addressBus[0x0000].byte = 0xCA;
    addressBus[0x0001].word = 0x0012;
    addressBus[0x0003].byte = 0xCA;
    addressBus[0x0004].word = 0x0034;

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xCB - PREFIX CB');
  it('0xCC - CALL Z,a16');
  it('0xCD - CALL a16');
  it('0xCE - ADC A,d8');
  it('0xCF - RST 08H');
  it('0xD0 - RET NC');
  it('0xD1 - POP DE');

  it('0xD2 - JP NC,a16', () => {
    addressBus[0x0000].byte = 0xD2;
    addressBus[0x0001].word = 0x0012;
    addressBus[0x0003].byte = 0xD2;
    addressBus[0x0004].word = 0x0034;

    cpuRegisters.flags.C = 1;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xD4 - CALL NC,a16');
  it('0xD5 - PUSH DE');
  it('0xD6 - SUB d8');
  it('0xD7 - RST 10H');
  it('0xD8 - RET C');
  it('0xD9 - RETI');

  it('0xDA - JP C,a16', () => {
    addressBus[0x0000].byte = 0xDA;
    addressBus[0x0001].word = 0x0012;
    addressBus[0x0003].byte = 0xDA;
    addressBus[0x0004].word = 0x0034;

    cpuRegisters.flags.C = 0;
    executeNextOpcode(12);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(16);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xDC - CALL C,a16');
  it('0xDE - SBC A,d8');
  it('0xDF - RST 18H');
  it('0xE0 - LDH (a8),A');
  it('0xE1 - POP HL');
  it('0xE2 - LD (C),A');
  it('0xE5 - PUSH HL');
  it('0xE6 - AND d8');
  it('0xE7 - RST 20H');
  it('0xE8 - ADD SP,r8');

  it('0xE9 - JP (HL)', () => {
    addressBus[0x0000].byte = 0xE9;
    addressBus[0x0012].byte = 0xE9;
    cpuRegisters.HL = 0xC000;

    addressBus[0xC000].word = 0x0012;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0012 });

    addressBus[0xC000].word = 0x0034;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xEA - LD (a16),A');
  it('0xEE - XOR d8');
  it('0xEF - RST 28H');
  it('0xF0 - LDH A,(a8)');
  it('0xF1 - POP AF');
  it('0xF2 - LD A,(C)');
  it('0xF3 - DI');
  it('0xF5 - PUSH AF');
  it('0xF6 - OR d8');
  it('0xF7 - RST 30H');
  it('0xF8 - LD HL,SP+r8');
  it('0xF9 - LD SP,HL');
  it('0xFA - LD A,(a16)');
  it('0xFB - EI');
  it('0xFE - CP d8');
  it('0xFF - RST 38H');
});
