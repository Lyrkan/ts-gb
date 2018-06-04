import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { OPCODES_DEFAULT } from '../../../src/cpu/opcodes/opcodes-default';
import { CpuRegisters } from '../../../src/cpu/cpu-registers';
import { AddressBus } from '../../../src/memory/address-bus';
import { GameCartridge } from '../../../src/cartridge/game-cartridge';
import { ICPUCallbacks } from '../../../src/cpu/opcodes';

describe('Opcodes - Default table', () => {
  let cpuRegisters: CpuRegisters;
  let cpuCallbacks: ICPUCallbacks;
  let addressBus: AddressBus;

  const executeNextOpcode = (expectedCycles: number) => {
    const cycles = OPCODES_DEFAULT[addressBus.get(cpuRegisters.PC++).byte](
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
    cpuRegisters = new CpuRegisters();
    cpuRegisters.PC = 0x0000;
    cpuRegisters.SP = 0xFFFE;

    cpuCallbacks = {
      stop: () => { /* NOP */ },
      disableInterrupts: () => { /* NOP */ },
      enableInterrupts: () => { /* NOP */ },
      halt: () => { /* NOP */ },
    };

    addressBus = new AddressBus();
    addressBus.loadCartridge(new GameCartridge(new ArrayBuffer(32 * 1024)));
  });

  it('0x00 - NOP', () => {
    addressBus.get(0x0000).byte = 0x00;
    addressBus.get(0x0001).byte = 0x00;

    executeNextOpcode(1);
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x01 - LD BC,d16', () => {
    addressBus.get(0x0000).byte = 0x01;
    addressBus.get(0x0001).word = 0x1234;
    addressBus.get(0x0003).byte = 0x01;
    addressBus.get(0x0004).word = 0x5678;

    executeNextOpcode(3);
    checkRegisters({ BC: 0x1234, PC: 0x0003 });
  });

  it('0x02 - LD (BC),A', () => {
    addressBus.get(0x0000).byte = 0x02;
    addressBus.get(0x0001).byte = 0x02;
    addressBus.get(0xC000).byte = 0x12;
    addressBus.get(0xC001).byte = 0x34;

    cpuRegisters.A = 0x56;
    cpuRegisters.BC = 0xC000;

    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x56);
    expect(addressBus.get(0xC001).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.BC = 0xC001;

    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x56);
    expect(addressBus.get(0xC001).byte).to.equal(0x56);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x03 - INC BC', () => {
    addressBus.get(0x0000).byte = 0x03;
    addressBus.get(0x0001).byte = 0x03;
    addressBus.get(0x0002).byte = 0x03;

    cpuRegisters.BC = 0xFFFD;

    executeNextOpcode(2);
    checkRegisters({ BC: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ BC: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ BC: 0x0000, PC: 0x0003 });
  });

  it('0x04 - INC B', () => {
    addressBus.get(0x0000).byte = 0x04;
    addressBus.get(0x0001).byte = 0x04;
    addressBus.get(0x0002).byte = 0x04;

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
    addressBus.get(0x0000).byte = 0x05;
    addressBus.get(0x0001).byte = 0x05;
    addressBus.get(0x0002).byte = 0x05;

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
    addressBus.get(0x0000).byte = 0x06;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0x06;
    addressBus.get(0x0003).byte = 0x34;

    executeNextOpcode(2);
    checkRegisters({ B: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ B: 0x34, PC: 0x0004 });
  });

  it('0x07 - RLCA', () => {
    addressBus.get(0x0000).byte = 0x07;
    addressBus.get(0x0001).byte = 0x07;

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
    addressBus.get(0x0000).byte = 0x08;
    addressBus.get(0x0001).word = 0xC000;
    addressBus.get(0x0003).byte = 0x08;
    addressBus.get(0x0004).word = 0xC001;

    cpuRegisters.SP = 0x1234;
    executeNextOpcode(5);
    expect(addressBus.get(0xC000).word).to.equal(0x1234);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.SP = 0x5678;
    executeNextOpcode(5);
    expect(addressBus.get(0xC001).word).to.equal(0x5678);
    checkRegisters({ PC: 0x0006 });
  });

  it('0x09 - ADD HL,BC', () => {
    addressBus.get(0x0000).byte = 0x09;
    addressBus.get(0x0001).byte = 0x09;

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
    addressBus.get(0x0000).byte = 0x0A;
    addressBus.get(0x0001).byte = 0x0A;

    cpuRegisters.BC = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x0B - DEC BC', () => {
    addressBus.get(0x0000).byte = 0x0B;
    addressBus.get(0x0001).byte = 0x0B;
    addressBus.get(0x0002).byte = 0x0B;

    cpuRegisters.BC = 0x0002;

    executeNextOpcode(2);
    checkRegisters({ BC: 0x0001, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ BC: 0x0000, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ BC: 0xFFFF, PC: 0x0003 });
  });

  it('0x0C - INC C', () => {
    addressBus.get(0x0000).byte = 0x0C;
    addressBus.get(0x0001).byte = 0x0C;
    addressBus.get(0x0002).byte = 0x0C;

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
    addressBus.get(0x0000).byte = 0x0D;
    addressBus.get(0x0001).byte = 0x0D;
    addressBus.get(0x0002).byte = 0x0D;

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
    addressBus.get(0x0000).byte = 0x0E;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0x0E;
    addressBus.get(0x0003).byte = 0x34;

    executeNextOpcode(2);
    checkRegisters({ C: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ C: 0x34, PC: 0x0004 });
  });

  it('0x0F - RRCA', () => {
    addressBus.get(0x0000).byte = 0x0F;
    addressBus.get(0x0001).byte = 0x0F;

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
    addressBus.get(0x0000).byte = 0x10;

    const spy = sinon.spy(cpuCallbacks, 'stop');
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0002 });
    expect(spy.calledOnce).to.equal(true);
  });

  it('0x11 - LD DE,d16', () => {
    addressBus.get(0x0000).byte = 0x11;
    addressBus.get(0x0001).word = 0x1234;
    addressBus.get(0x0003).byte = 0x11;
    addressBus.get(0x0004).word = 0x5678;

    executeNextOpcode(3);
    checkRegisters({ DE: 0x1234, PC: 0x0003 });
  });

  it('0x12 - LD (DE),A', () => {
    addressBus.get(0x0000).byte = 0x12;
    addressBus.get(0x0001).byte = 0x12;

    cpuRegisters.DE = 0xC000;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x13 - INC DE', () => {
    addressBus.get(0x0000).byte = 0x13;
    addressBus.get(0x0001).byte = 0x13;
    addressBus.get(0x0002).byte = 0x13;

    cpuRegisters.DE = 0xFFFD;

    executeNextOpcode(2);
    checkRegisters({ DE: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ DE: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ DE: 0x0000, PC: 0x0003 });
  });

  it('0x14 - INC D', () => {
    addressBus.get(0x0000).byte = 0x14;
    addressBus.get(0x0001).byte = 0x14;
    addressBus.get(0x0002).byte = 0x14;

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
    addressBus.get(0x0000).byte = 0x15;
    addressBus.get(0x0001).byte = 0x15;
    addressBus.get(0x0002).byte = 0x15;

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
    addressBus.get(0x0000).byte = 0x16;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0x16;
    addressBus.get(0x0003).byte = 0x34;

    executeNextOpcode(2);
    checkRegisters({ D: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ D: 0x34, PC: 0x0004 });
  });

  it('0x17 - RLA', () => {
    addressBus.get(0x0000).byte = 0x17;
    addressBus.get(0x0001).byte = 0x17;
    addressBus.get(0x0002).byte = 0x17;
    addressBus.get(0x0003).byte = 0x17;

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
    addressBus.get(0x0000).byte = 0x18;
    addressBus.get(0x0001).byte = 0x20;
    addressBus.get(0x0022).byte = 0x18;
    addressBus.get(0x0023).byte = 0xF0;
    addressBus.get(0x0014).byte = 0x18;
    addressBus.get(0x0015).byte = 0x10;

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0022 });

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0014 });

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0026 });
  });

  it('0x19 - ADD HL,DE', () => {
    addressBus.get(0x0000).byte = 0x19;
    addressBus.get(0x0001).byte = 0x19;

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
    addressBus.get(0x0000).byte = 0x1A;
    addressBus.get(0x0001).byte = 0x1A;

    cpuRegisters.DE = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x1B - DEC DE', () => {
    addressBus.get(0x0000).byte = 0x1B;
    addressBus.get(0x0001).byte = 0x1B;
    addressBus.get(0x0002).byte = 0x1B;

    cpuRegisters.DE = 0x0002;

    executeNextOpcode(2);
    checkRegisters({ DE: 0x0001, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ DE: 0x0000, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ DE: 0xFFFF, PC: 0x0003 });
  });

  it('0x1C - INC E', () => {
    addressBus.get(0x0000).byte = 0x1C;
    addressBus.get(0x0001).byte = 0x1C;
    addressBus.get(0x0002).byte = 0x1C;

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
    addressBus.get(0x0000).byte = 0x1D;
    addressBus.get(0x0001).byte = 0x1D;
    addressBus.get(0x0002).byte = 0x1D;

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
    addressBus.get(0x0000).byte = 0x1E;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0x1E;
    addressBus.get(0x0003).byte = 0x34;

    executeNextOpcode(2);
    checkRegisters({ E: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ E: 0x34, PC: 0x0004 });
  });

  it('0x1F - RRA', () => {
    addressBus.get(0x0000).byte = 0x1F;
    addressBus.get(0x0001).byte = 0x1F;
    addressBus.get(0x0002).byte = 0x1F;
    addressBus.get(0x0003).byte = 0x1F;

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
    addressBus.get(0x0000).byte = 0x20;
    addressBus.get(0x0001).byte = 0x20;
    addressBus.get(0x0022).byte = 0x20;
    addressBus.get(0x0023).byte = 0xF0;
    addressBus.get(0x0024).byte = 0x20;
    addressBus.get(0x0025).byte = 0xF0;

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
    addressBus.get(0x0000).byte = 0x21;
    addressBus.get(0x0001).word = 0x1234;
    addressBus.get(0x0003).byte = 0x21;
    addressBus.get(0x0004).word = 0x5678;

    executeNextOpcode(3);
    checkRegisters({ HL: 0x1234, PC: 0x0003 });

    executeNextOpcode(3);
    checkRegisters({ HL: 0x5678, PC: 0x0006 });
  });

  it('0x22 - LD (HL+),A', () => {
    addressBus.get(0x0000).byte = 0x22;
    addressBus.get(0x0001).byte = 0x22;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(2);
    expect(addressBus.get(0xC001).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x23 - INC HL', () => {
    addressBus.get(0x0000).byte = 0x23;
    addressBus.get(0x0001).byte = 0x23;
    addressBus.get(0x0002).byte = 0x23;

    cpuRegisters.HL = 0xFFFD;

    executeNextOpcode(2);
    checkRegisters({ HL: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ HL: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ HL: 0x0000, PC: 0x0003 });
  });

  it('0x24 - INC H', () => {
    addressBus.get(0x0000).byte = 0x24;
    addressBus.get(0x0001).byte = 0x24;
    addressBus.get(0x0002).byte = 0x24;

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
    addressBus.get(0x0000).byte = 0x25;
    addressBus.get(0x0001).byte = 0x25;
    addressBus.get(0x0002).byte = 0x25;

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
    addressBus.get(0x0000).byte = 0x26;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0x26;
    addressBus.get(0x0003).byte = 0x34;

    executeNextOpcode(2);
    checkRegisters({ H: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ H: 0x34, PC: 0x0004 });
  });

  it('0x27 - DAA', () => {
    addressBus.get(0x0000).byte = 0x27;
    addressBus.get(0x0001).byte = 0x27;
    addressBus.get(0x0002).byte = 0x27;
    addressBus.get(0x0003).byte = 0x27;

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
    addressBus.get(0x0000).byte = 0x28;
    addressBus.get(0x0001).byte = 0x20;
    addressBus.get(0x0022).byte = 0x28;
    addressBus.get(0x0023).byte = 0xF0;
    addressBus.get(0x0024).byte = 0x28;
    addressBus.get(0x0025).byte = 0xF0;

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
    addressBus.get(0x0000).byte = 0x29;
    addressBus.get(0x0001).byte = 0x29;

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
    addressBus.get(0x0000).byte = 0x2A;
    addressBus.get(0x0001).byte = 0x2A;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus.get(0xC001).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x2B - DEC HL', () => {
    addressBus.get(0x0000).byte = 0x2B;
    addressBus.get(0x0001).byte = 0x2B;
    addressBus.get(0x0002).byte = 0x2B;

    cpuRegisters.HL = 0x0002;

    executeNextOpcode(2);
    checkRegisters({ HL: 0x0001, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ HL: 0x0000, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ HL: 0xFFFF, PC: 0x0003 });
  });

  it('0x2C - INC L', () => {
    addressBus.get(0x0000).byte = 0x2C;
    addressBus.get(0x0001).byte = 0x2C;
    addressBus.get(0x0002).byte = 0x2C;

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
    addressBus.get(0x0000).byte = 0x2D;
    addressBus.get(0x0001).byte = 0x2D;
    addressBus.get(0x0002).byte = 0x2D;

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
    addressBus.get(0x0000).byte = 0x2E;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0x2E;
    addressBus.get(0x0003).byte = 0x34;

    executeNextOpcode(2);
    checkRegisters({ L: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ L: 0x34, PC: 0x0004 });
  });

  it('0x2F - CPL', () => {
    addressBus.get(0x0000).byte = 0x2F;
    addressBus.get(0x0001).byte = 0x2F;
    addressBus.get(0x0002).byte = 0x2F;

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
    addressBus.get(0x0000).byte = 0x30;
    addressBus.get(0x0001).byte = 0x20;
    addressBus.get(0x0022).byte = 0x30;
    addressBus.get(0x0023).byte = 0xF0;
    addressBus.get(0x0024).byte = 0x30;
    addressBus.get(0x0025).byte = 0xF0;

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
    addressBus.get(0x0000).byte = 0x31;
    addressBus.get(0x0001).word = 0x1234;
    addressBus.get(0x0003).byte = 0x31;
    addressBus.get(0x0004).word = 0x5678;

    executeNextOpcode(3);
    checkRegisters({ SP: 0x1234, PC: 0x0003 });

    executeNextOpcode(3);
    checkRegisters({ SP: 0x5678, PC: 0x0006 });
  });

  it('0x32 - LD (HL-),A', () => {
    addressBus.get(0x0000).byte = 0x32;
    addressBus.get(0x0001).byte = 0x32;

    cpuRegisters.HL = 0xC001;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    expect(addressBus.get(0xC001).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x33 - INC SP', () => {
    addressBus.get(0x0000).byte = 0x33;
    addressBus.get(0x0001).byte = 0x33;
    addressBus.get(0x0002).byte = 0x33;

    cpuRegisters.SP = 0xFFFD;

    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFE, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFF, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ SP: 0x0000, PC: 0x0003 });
  });

  it('0x34 - INC (HL)', () => {
    addressBus.get(0x0000).byte = 0x34;
    addressBus.get(0x0001).byte = 0x34;
    addressBus.get(0x0002).byte = 0x34;

    addressBus.get(0xC000).byte = 0x0E;

    cpuRegisters.HL = 0xC000;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0x0F);

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0x10);

    addressBus.get(0xC000).byte = 0xFF;

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0x00);
  });

  it('0x35 - DEC (HL)', () => {
    addressBus.get(0x0000).byte = 0x35;
    addressBus.get(0x0001).byte = 0x35;
    addressBus.get(0x0002).byte = 0x35;

    addressBus.get(0xC000).byte = 0x11;

    cpuRegisters.HL = 0xC000;
    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 0;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 0, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0x10);

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0x0F);

    addressBus.get(0xC000).byte = 0x01;

    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });
    checkFlags({ Z: 1, N: 1, H: 0, C: 1 });
    expect(addressBus.get(0xC000).byte).to.equal(0x00);
  });

  it('0x36 - LD (HL),d8', () => {
    addressBus.get(0x0000).byte = 0x36;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0x36;
    addressBus.get(0x0003).byte = 0x34;

    cpuRegisters.HL = 0xC000;

    executeNextOpcode(3);
    expect(addressBus.get(0xC000).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0002 });

    executeNextOpcode(3);
    expect(addressBus.get(0xC000).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0004 });
  });

  it('0x37 - SCF', () => {
    addressBus.get(0x0000).byte = 0x37;
    addressBus.get(0x0001).byte = 0x37;

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
    addressBus.get(0x0000).byte = 0x38;
    addressBus.get(0x0001).byte = 0x20;
    addressBus.get(0x0022).byte = 0x38;
    addressBus.get(0x0023).byte = 0xF0;
    addressBus.get(0x0024).byte = 0x38;
    addressBus.get(0x0025).byte = 0xF0;

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
    addressBus.get(0x0000).byte = 0x39;
    addressBus.get(0x0001).byte = 0x39;

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
    addressBus.get(0x0000).byte = 0x3A;
    addressBus.get(0x0001).byte = 0x3A;

    cpuRegisters.HL = 0xC001;

    addressBus.get(0xC001).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x3B - DEC SP', () => {
    addressBus.get(0x0000).byte = 0x3B;
    addressBus.get(0x0001).byte = 0x3B;
    addressBus.get(0x0002).byte = 0x3B;

    cpuRegisters.SP = 0x0002;

    executeNextOpcode(2);
    checkRegisters({ SP: 0x0001, PC: 0x0001 });

    executeNextOpcode(2);
    checkRegisters({ SP: 0x0000, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFF, PC: 0x0003 });
  });

  it('0x3C - INC A', () => {
    addressBus.get(0x0000).byte = 0x3C;
    addressBus.get(0x0001).byte = 0x3C;
    addressBus.get(0x0002).byte = 0x3C;

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
    addressBus.get(0x0000).byte = 0x3D;
    addressBus.get(0x0001).byte = 0x3D;
    addressBus.get(0x0002).byte = 0x3D;

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
    addressBus.get(0x0000).byte = 0x3E;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0x3E;
    addressBus.get(0x0003).byte = 0x34;

    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0002 });

    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0004 });
  });

  it('0x3F - CCF', () => {
    addressBus.get(0x0000).byte = 0x3F;
    addressBus.get(0x0001).byte = 0x3F;

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
    addressBus.get(0x0000).byte = 0x40;
    addressBus.get(0x0001).byte = 0x40;

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x41 - LD B,C', () => {
    addressBus.get(0x0000).byte = 0x41;
    addressBus.get(0x0001).byte = 0x41;

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x42 - LD B,D', () => {
    addressBus.get(0x0000).byte = 0x42;
    addressBus.get(0x0001).byte = 0x42;

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x43 - LD B,E', () => {
    addressBus.get(0x0000).byte = 0x43;
    addressBus.get(0x0001).byte = 0x43;

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x44 - LD B,H', () => {
    addressBus.get(0x0000).byte = 0x44;
    addressBus.get(0x0001).byte = 0x44;

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x45 - LD B,L', () => {
    addressBus.get(0x0000).byte = 0x45;
    addressBus.get(0x0001).byte = 0x45;

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x46 - LD B,(HL)', () => {
    addressBus.get(0x0000).byte = 0x46;
    addressBus.get(0x0001).byte = 0x46;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x47 - LD B,A', () => {
    addressBus.get(0x0000).byte = 0x47;
    addressBus.get(0x0001).byte = 0x47;

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ B: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ B: 0x34, PC: 0x0002 });
  });

  it('0x48 - LD C,B', () => {
    addressBus.get(0x0000).byte = 0x48;
    addressBus.get(0x0001).byte = 0x48;

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x49 - LD C,C', () => {
    addressBus.get(0x0000).byte = 0x49;
    addressBus.get(0x0001).byte = 0x49;

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4A - LD C,D', () => {
    addressBus.get(0x0000).byte = 0x4A;
    addressBus.get(0x0001).byte = 0x4A;

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4B - LD C,E', () => {
    addressBus.get(0x0000).byte = 0x4B;
    addressBus.get(0x0001).byte = 0x4B;

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4C - LD C,H', () => {
    addressBus.get(0x0000).byte = 0x4C;
    addressBus.get(0x0001).byte = 0x4C;

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4D - LD C,L', () => {
    addressBus.get(0x0000).byte = 0x4D;
    addressBus.get(0x0001).byte = 0x4D;

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4E - LD C,(HL)', () => {
    addressBus.get(0x0000).byte = 0x4E;
    addressBus.get(0x0001).byte = 0x4E;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x4F - LD C,A', () => {
    addressBus.get(0x0000).byte = 0x4F;
    addressBus.get(0x0001).byte = 0x4F;

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ C: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ C: 0x34, PC: 0x0002 });
  });

  it('0x50 - LD D,B', () => {
    addressBus.get(0x0000).byte = 0x50;
    addressBus.get(0x0001).byte = 0x50;

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x51 - LD D,C', () => {
    addressBus.get(0x0000).byte = 0x51;
    addressBus.get(0x0001).byte = 0x51;

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x52 - LD D,D', () => {
    addressBus.get(0x0000).byte = 0x52;
    addressBus.get(0x0001).byte = 0x52;

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x53 - LD D,E', () => {
    addressBus.get(0x0000).byte = 0x53;
    addressBus.get(0x0001).byte = 0x53;

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x54 - LD D,H', () => {
    addressBus.get(0x0000).byte = 0x54;
    addressBus.get(0x0001).byte = 0x54;

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x55 - LD D,L', () => {
    addressBus.get(0x0000).byte = 0x55;
    addressBus.get(0x0001).byte = 0x55;

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x56 - LD D,(HL)', () => {
    addressBus.get(0x0000).byte = 0x56;
    addressBus.get(0x0001).byte = 0x56;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x57 - LD D,A', () => {
    addressBus.get(0x0000).byte = 0x57;
    addressBus.get(0x0001).byte = 0x57;

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ D: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ D: 0x34, PC: 0x0002 });
  });

  it('0x58 - LD E,B', () => {
    addressBus.get(0x0000).byte = 0x58;
    addressBus.get(0x0001).byte = 0x58;

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x59 - LD E,C', () => {
    addressBus.get(0x0000).byte = 0x59;
    addressBus.get(0x0001).byte = 0x59;

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5A - LD E,D', () => {
    addressBus.get(0x0000).byte = 0x5A;
    addressBus.get(0x0001).byte = 0x5A;

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5B - LD E,E', () => {
    addressBus.get(0x0000).byte = 0x5B;
    addressBus.get(0x0001).byte = 0x5B;

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5C - LD E,H', () => {
    addressBus.get(0x0000).byte = 0x5C;
    addressBus.get(0x0001).byte = 0x5C;

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5D - LD E,L', () => {
    addressBus.get(0x0000).byte = 0x5D;
    addressBus.get(0x0001).byte = 0x5D;

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5E - LD E,(HL)', () => {
    addressBus.get(0x0000).byte = 0x5E;
    addressBus.get(0x0001).byte = 0x5E;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x5F - LD E,A', () => {
    addressBus.get(0x0000).byte = 0x5F;
    addressBus.get(0x0001).byte = 0x5F;

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ E: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ E: 0x34, PC: 0x0002 });
  });

  it('0x60 - LD H,B', () => {
    addressBus.get(0x0000).byte = 0x60;
    addressBus.get(0x0001).byte = 0x60;

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x61 - LD H,C', () => {
    addressBus.get(0x0000).byte = 0x61;
    addressBus.get(0x0001).byte = 0x61;

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x62 - LD H,D', () => {
    addressBus.get(0x0000).byte = 0x62;
    addressBus.get(0x0001).byte = 0x62;

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x63 - LD H,E', () => {
    addressBus.get(0x0000).byte = 0x63;
    addressBus.get(0x0001).byte = 0x63;

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x64 - LD H,H', () => {
    addressBus.get(0x0000).byte = 0x64;
    addressBus.get(0x0001).byte = 0x64;

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x65 - LD H,L', () => {
    addressBus.get(0x0000).byte = 0x65;
    addressBus.get(0x0001).byte = 0x65;

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x66 - LD H,(HL)', () => {
    addressBus.get(0x0000).byte = 0x66;
    addressBus.get(0x0001).byte = 0x66;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x67 - LD H,A', () => {
    addressBus.get(0x0000).byte = 0x67;
    addressBus.get(0x0001).byte = 0x67;

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ H: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ H: 0x34, PC: 0x0002 });
  });

  it('0x68 - LD L,B', () => {
    addressBus.get(0x0000).byte = 0x68;
    addressBus.get(0x0001).byte = 0x68;

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x69 - LD L,C', () => {
    addressBus.get(0x0000).byte = 0x69;
    addressBus.get(0x0001).byte = 0x69;

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6A - LD L,D', () => {
    addressBus.get(0x0000).byte = 0x6A;
    addressBus.get(0x0001).byte = 0x6A;

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6B - LD L,E', () => {
    addressBus.get(0x0000).byte = 0x6B;
    addressBus.get(0x0001).byte = 0x6B;

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6C - LD L,H', () => {
    addressBus.get(0x0000).byte = 0x6C;
    addressBus.get(0x0001).byte = 0x6C;

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6D - LD L,L', () => {
    addressBus.get(0x0000).byte = 0x6D;
    addressBus.get(0x0001).byte = 0x6D;

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6E - LD L,(HL)', () => {
    addressBus.get(0x0000).byte = 0x6E;
    addressBus.get(0x0001).byte = 0x6E;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x6F - LD L,A', () => {
    addressBus.get(0x0000).byte = 0x6F;
    addressBus.get(0x0001).byte = 0x6F;

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ L: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ L: 0x34, PC: 0x0002 });
  });

  it('0x70 - LD (HL),B', () => {
    addressBus.get(0x0000).byte = 0x70;
    addressBus.get(0x0001).byte = 0x70;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.B = 0x12;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x71 - LD (HL),C', () => {
    addressBus.get(0x0000).byte = 0x71;
    addressBus.get(0x0001).byte = 0x71;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.C = 0x12;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x72 - LD (HL),D', () => {
    addressBus.get(0x0000).byte = 0x72;
    addressBus.get(0x0001).byte = 0x72;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.D = 0x12;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x73 - LD (HL),E', () => {
    addressBus.get(0x0000).byte = 0x73;
    addressBus.get(0x0001).byte = 0x73;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.E = 0x12;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x74 - LD (HL),H', () => {
    addressBus.get(0x0000).byte = 0x74;
    addressBus.get(0x0001).byte = 0x74;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.H = 0xC0;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0xC0);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.H = 0xC1;
    executeNextOpcode(2);
    expect(addressBus.get(0xC100).byte).to.equal(0xC1);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x75 - LD (HL),L', () => {
    addressBus.get(0x0000).byte = 0x75;
    addressBus.get(0x0001).byte = 0x75;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.L = 0x12;
    executeNextOpcode(2);
    expect(addressBus.get(0xC012).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(2);
    expect(addressBus.get(0xC034).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x76 - HALT', () => {
    addressBus.get(0x0000).byte = 0x76;

    const spy = sinon.spy(cpuCallbacks, 'halt');
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0001 });
    expect(spy.calledOnce).to.equal(true);
  });

  it('0x77 - LD (HL),A', () => {
    addressBus.get(0x0000).byte = 0x77;
    addressBus.get(0x0001).byte = 0x77;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.A = 0x12;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(2);
    expect(addressBus.get(0xC000).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0002 });
  });

  it('0x78 - LD A,B', () => {
    addressBus.get(0x0000).byte = 0x78;
    addressBus.get(0x0001).byte = 0x78;

    cpuRegisters.B = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.B = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x79 - LD A,C', () => {
    addressBus.get(0x0000).byte = 0x79;
    addressBus.get(0x0001).byte = 0x79;

    cpuRegisters.C = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.C = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7A - LD A,D', () => {
    addressBus.get(0x0000).byte = 0x7A;
    addressBus.get(0x0001).byte = 0x7A;

    cpuRegisters.D = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.D = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7B - LD A,E', () => {
    addressBus.get(0x0000).byte = 0x7B;
    addressBus.get(0x0001).byte = 0x7B;

    cpuRegisters.E = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.E = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7C - LD A,H', () => {
    addressBus.get(0x0000).byte = 0x7C;
    addressBus.get(0x0001).byte = 0x7C;

    cpuRegisters.H = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.H = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7D - LD A,L', () => {
    addressBus.get(0x0000).byte = 0x7D;
    addressBus.get(0x0001).byte = 0x7D;

    cpuRegisters.L = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.L = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7E - LD A,(HL)', () => {
    addressBus.get(0x0000).byte = 0x7E;
    addressBus.get(0x0001).byte = 0x7E;

    cpuRegisters.HL = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x7F - LD A,A', () => {
    addressBus.get(0x0000).byte = 0x7F;
    addressBus.get(0x0001).byte = 0x7F;

    cpuRegisters.A = 0x12;
    executeNextOpcode(1);
    checkRegisters({ A: 0x12, PC: 0x0001 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(1);
    checkRegisters({ A: 0x34, PC: 0x0002 });
  });

  it('0x80 - ADD A,B', () => {
    addressBus.get(0x0000).byte = 0x80;
    addressBus.get(0x0001).byte = 0x80;

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
    addressBus.get(0x0000).byte = 0x81;
    addressBus.get(0x0001).byte = 0x81;

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
    addressBus.get(0x0000).byte = 0x82;
    addressBus.get(0x0001).byte = 0x82;

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
    addressBus.get(0x0000).byte = 0x83;
    addressBus.get(0x0001).byte = 0x83;

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
    addressBus.get(0x0000).byte = 0x84;
    addressBus.get(0x0001).byte = 0x84;

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
    addressBus.get(0x0000).byte = 0x85;
    addressBus.get(0x0001).byte = 0x85;

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
    addressBus.get(0x0000).byte = 0x86;
    addressBus.get(0x0001).byte = 0x86;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.A = 0x0F;
    addressBus.get(0xC000).byte = 0x01;
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0xFF;
    addressBus.get(0xC000).byte = 0x01;
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 1 });
  });

  it('0x87 - ADD A,A', () => {
    addressBus.get(0x0000).byte = 0x87;
    addressBus.get(0x0001).byte = 0x87;

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
    addressBus.get(0x0000).byte = 0x88;
    addressBus.get(0x0001).byte = 0x88;

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
    addressBus.get(0x0000).byte = 0x89;
    addressBus.get(0x0001).byte = 0x89;

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
    addressBus.get(0x0000).byte = 0x8A;
    addressBus.get(0x0001).byte = 0x8A;

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
    addressBus.get(0x0000).byte = 0x8B;
    addressBus.get(0x0001).byte = 0x8B;

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
    addressBus.get(0x0000).byte = 0x8C;
    addressBus.get(0x0001).byte = 0x8C;

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
    addressBus.get(0x0000).byte = 0x8D;
    addressBus.get(0x0001).byte = 0x8D;

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
    addressBus.get(0x0000).byte = 0x8E;
    addressBus.get(0x0001).byte = 0x8E;

    cpuRegisters.A = 0x0F;
    cpuRegisters.HL = 0x000C;
    cpuRegisters.flags.C = 0;
    addressBus.get(0x000C).byte = 0x01;
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x0F;
    cpuRegisters.HL = 0x000C;
    cpuRegisters.flags.C = 1;
    addressBus.get(0x000C).byte = 0x01;
    executeNextOpcode(2);
    checkRegisters({ A: 0x11, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0x8F - ADC A,A', () => {
    addressBus.get(0x0000).byte = 0x8F;
    addressBus.get(0x0001).byte = 0x8F;

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
    addressBus.get(0x0000).byte = 0x90;
    addressBus.get(0x0001).byte = 0x90;

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
    addressBus.get(0x0000).byte = 0x91;
    addressBus.get(0x0001).byte = 0x91;

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
    addressBus.get(0x0000).byte = 0x92;
    addressBus.get(0x0001).byte = 0x92;

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
    addressBus.get(0x0000).byte = 0x93;
    addressBus.get(0x0001).byte = 0x93;

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
    addressBus.get(0x0000).byte = 0x94;
    addressBus.get(0x0001).byte = 0x94;

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
    addressBus.get(0x0000).byte = 0x95;
    addressBus.get(0x0001).byte = 0x95;

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
    addressBus.get(0x0000).byte = 0x96;
    addressBus.get(0x0001).byte = 0x96;

    cpuRegisters.A = 0x10;
    cpuRegisters.HL = 0xC000;
    addressBus.get(0xC000).byte = 0x01;
    executeNextOpcode(2);
    checkRegisters({ A: 0x0F, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.HL = 0xC000;
    addressBus.get(0xC000).byte = 0x01;
    executeNextOpcode(2);
    checkRegisters({ A: 0xFF, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0x97 - SUB A', () => {
    addressBus.get(0x0000).byte = 0x97;
    addressBus.get(0x0001).byte = 0x97;

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
    addressBus.get(0x0000).byte = 0x98;
    addressBus.get(0x0001).byte = 0x98;

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
    addressBus.get(0x0000).byte = 0x99;
    addressBus.get(0x0001).byte = 0x99;

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
    addressBus.get(0x0000).byte = 0x9A;
    addressBus.get(0x0001).byte = 0x9A;

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
    addressBus.get(0x0000).byte = 0x9B;
    addressBus.get(0x0001).byte = 0x9B;

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
    addressBus.get(0x0000).byte = 0x9C;
    addressBus.get(0x0001).byte = 0x9C;

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
    addressBus.get(0x0000).byte = 0x9D;
    addressBus.get(0x0001).byte = 0x9D;

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
    addressBus.get(0x0000).byte = 0x9E;
    addressBus.get(0x0001).byte = 0x9E;

    cpuRegisters.HL = 0xC000;
    addressBus.get(0xC000).byte = 0x01;

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
    addressBus.get(0x0000).byte = 0x9F;
    addressBus.get(0x0001).byte = 0x9F;

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
    addressBus.get(0x0000).byte = 0xA0;
    addressBus.get(0x0001).byte = 0xA0;
    addressBus.get(0x0002).byte = 0xA0;

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
    addressBus.get(0x0000).byte = 0xA1;
    addressBus.get(0x0001).byte = 0xA1;
    addressBus.get(0x0002).byte = 0xA1;

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
    addressBus.get(0x0000).byte = 0xA2;
    addressBus.get(0x0001).byte = 0xA2;
    addressBus.get(0x0002).byte = 0xA2;

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
    addressBus.get(0x0000).byte = 0xA3;
    addressBus.get(0x0001).byte = 0xA3;
    addressBus.get(0x0002).byte = 0xA3;

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
    addressBus.get(0x0000).byte = 0xA4;
    addressBus.get(0x0001).byte = 0xA4;
    addressBus.get(0x0002).byte = 0xA4;

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
    addressBus.get(0x0000).byte = 0xA5;
    addressBus.get(0x0001).byte = 0xA5;
    addressBus.get(0x0002).byte = 0xA5;

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
    addressBus.get(0x0000).byte = 0xA6;
    addressBus.get(0x0001).byte = 0xA6;
    addressBus.get(0x0002).byte = 0xA6;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x12;
    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    addressBus.get(0xC000).byte = 0x00;
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 1, C: 0 });
  });

  it('0xA7 - AND A', () => {
    addressBus.get(0x0000).byte = 0xA7;
    addressBus.get(0x0001).byte = 0xA7;
    addressBus.get(0x0002).byte = 0xA7;

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
    addressBus.get(0x0000).byte = 0xA8;
    addressBus.get(0x0001).byte = 0xA8;

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
    addressBus.get(0x0000).byte = 0xA9;
    addressBus.get(0x0001).byte = 0xA9;

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
    addressBus.get(0x0000).byte = 0xAA;
    addressBus.get(0x0001).byte = 0xAA;

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
    addressBus.get(0x0000).byte = 0xAB;
    addressBus.get(0x0001).byte = 0xAB;

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
    addressBus.get(0x0000).byte = 0xAC;
    addressBus.get(0x0001).byte = 0xAC;

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
    addressBus.get(0x0000).byte = 0xAD;
    addressBus.get(0x0001).byte = 0xAD;

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
    addressBus.get(0x0000).byte = 0xAE;
    addressBus.get(0x0001).byte = 0xAE;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0001 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ A: 0x26, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });
  });

  it('0xAF - XOR A', () => {
    addressBus.get(0x0000).byte = 0xAF;
    addressBus.get(0x0001).byte = 0xAF;

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
    addressBus.get(0x0000).byte = 0xB0;
    addressBus.get(0x0001).byte = 0xB0;
    addressBus.get(0x0002).byte = 0xB0;

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
    addressBus.get(0x0000).byte = 0xB1;
    addressBus.get(0x0001).byte = 0xB1;
    addressBus.get(0x0002).byte = 0xB1;

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
    addressBus.get(0x0000).byte = 0xB2;
    addressBus.get(0x0001).byte = 0xB2;
    addressBus.get(0x0002).byte = 0xB2;

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
    addressBus.get(0x0000).byte = 0xB3;
    addressBus.get(0x0001).byte = 0xB3;
    addressBus.get(0x0002).byte = 0xB3;

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
    addressBus.get(0x0000).byte = 0xB4;
    addressBus.get(0x0001).byte = 0xB4;
    addressBus.get(0x0002).byte = 0xB4;

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
    addressBus.get(0x0000).byte = 0xB5;
    addressBus.get(0x0001).byte = 0xB5;
    addressBus.get(0x0002).byte = 0xB5;

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
    addressBus.get(0x0000).byte = 0xB6;
    addressBus.get(0x0001).byte = 0xB6;
    addressBus.get(0x0002).byte = 0xB6;

    cpuRegisters.HL = 0xC000;

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.A = 0x12;
    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(2);
    checkRegisters({ A: 0x12, PC: 0x0001 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x12;
    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ A: 0x36, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 0, C: 0 });

    cpuRegisters.A = 0x00;
    addressBus.get(0xC000).byte = 0x00;
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0003 });
    checkFlags({ Z: 1, N: 0, H: 0, C: 0 });
  });

  it('0xB7 - OR A', () => {
    addressBus.get(0x0000).byte = 0xB7;
    addressBus.get(0x0001).byte = 0xB7;
    addressBus.get(0x0002).byte = 0xB7;

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
    addressBus.get(0x0000).byte = 0xB8;
    addressBus.get(0x0001).byte = 0xB8;

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
    addressBus.get(0x0000).byte = 0xB9;
    addressBus.get(0x0001).byte = 0xB9;

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
    addressBus.get(0x0000).byte = 0xBA;
    addressBus.get(0x0001).byte = 0xBA;

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
    addressBus.get(0x0000).byte = 0xBB;
    addressBus.get(0x0001).byte = 0xBB;

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
    addressBus.get(0x0000).byte = 0xBC;
    addressBus.get(0x0001).byte = 0xBC;

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
    addressBus.get(0x0000).byte = 0xBD;
    addressBus.get(0x0001).byte = 0xBD;

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
    addressBus.get(0x0000).byte = 0xBE;
    addressBus.get(0x0001).byte = 0xBE;

    cpuRegisters.A = 0x10;
    cpuRegisters.HL = 0xC000;
    addressBus.get(0xC000).byte = 0x01;
    executeNextOpcode(2);
    checkRegisters({ A: 0x10, PC: 0x0001 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 0 });

    cpuRegisters.A = 0x00;
    cpuRegisters.HL = 0xC000;
    addressBus.get(0xC000).byte = 0x01;
    executeNextOpcode(2);
    checkRegisters({ A: 0x00, PC: 0x0002 });
    checkFlags({ Z: 0, N: 1, H: 1, C: 1 });
  });

  it('0xBF - CP A', () => {
    addressBus.get(0x0000).byte = 0xBF;
    addressBus.get(0x0001).byte = 0xBF;

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
    addressBus.get(0x0000).byte = 0xC0;
    addressBus.get(0x0001).byte = 0xC0;

    cpuRegisters.SP = 0xFFFC;
    addressBus.get(0xFFFC).word = 0x1234;

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(5);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
  });

  it('0xC1 - POP BC', () => {
    addressBus.get(0x0000).byte = 0xC1;
    addressBus.get(0x0001).byte = 0xC1;

    cpuRegisters.SP = 0xFFFA;
    addressBus.get(0xFFFA).word = 0x1234;
    addressBus.get(0xFFFC).word = 0x5678;

    executeNextOpcode(3);
    checkRegisters({ BC: 0x1234, SP: 0xFFFC, PC: 0x0001 });

    executeNextOpcode(3);
    checkRegisters({ BC: 0x5678, SP: 0xFFFE, PC: 0x0002 });
  });

  it('0xC2 - JP NZ,a16', () => {
    addressBus.get(0x0000).byte = 0xC2;
    addressBus.get(0x0001).word = 0x0012;
    addressBus.get(0x0003).byte = 0xC2;
    addressBus.get(0x0004).word = 0x0034;

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xC3 - JP a16', () => {
    addressBus.get(0x0000).byte = 0xC3;
    addressBus.get(0x0001).word = 0x0012;
    addressBus.get(0x0012).byte = 0xC3;
    addressBus.get(0x0013).word = 0x0034;

    executeNextOpcode(4);
    checkRegisters({ PC: 0x0012 });

    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xC4 - CALL NZ,a16', () => {
    addressBus.get(0x1111).byte = 0xC4;
    addressBus.get(0x1112).word = 0x1234;
    addressBus.get(0x1114).byte = 0xC4;
    addressBus.get(0x1115).word = 0x1345;

    cpuRegisters.PC = 0x1111;
    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x1114, SP: 0xFFFE });

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(6);
    checkRegisters({ PC: 0x1345, SP: 0xFFFC });
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x1117);
  });

  it('0xC5 - PUSH BC', () => {
    addressBus.get(0x0000).byte = 0xC5;
    addressBus.get(0x0001).byte = 0xC5;

    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.BC = 0x1234;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });
    addressBus.get(cpuRegisters.SP).word = 0x1234;

    cpuRegisters.BC = 0x5678;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFA, PC: 0x0002 });
    addressBus.get(cpuRegisters.SP).word = 0x5678;
  });

  it('0xC6 - ADD A,d8', () => {
    addressBus.get(0x0000).byte = 0xC6;
    addressBus.get(0x0001).byte = 0x01;
    addressBus.get(0x0002).byte = 0xC6;
    addressBus.get(0x0003).byte = 0x01;

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
    addressBus.get(0x0123).byte = 0xC7;
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x0124);
    checkRegisters({ PC: 0x0000, SP: 0xFFFC });
  });

  it('0xC8 - RET Z', () => {
    addressBus.get(0x0000).byte = 0xC8;
    addressBus.get(0x0001).byte = 0xC8;

    cpuRegisters.SP = 0xFFFC;
    addressBus.get(0xFFFC).word = 0x1234;

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(5);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
  });

  it('0xC9 - RET', () => {
    addressBus.get(0x0000).byte = 0xC9;

    cpuRegisters.SP = 0xFFFC;
    addressBus.get(0xFFFC).word = 0x1234;

    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
  });

  it('0xCA - JP Z,a16', () => {
    addressBus.get(0x0000).byte = 0xCA;
    addressBus.get(0x0001).word = 0x0012;
    addressBus.get(0x0003).byte = 0xCA;
    addressBus.get(0x0004).word = 0x0034;

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xCC - CALL Z,a16', () => {
    addressBus.get(0x1111).byte = 0xCC;
    addressBus.get(0x1112).word = 0x1234;
    addressBus.get(0x1114).byte = 0xCC;
    addressBus.get(0x1115).word = 0x1345;

    cpuRegisters.PC = 0x1111;
    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.flags.Z = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x1114, SP: 0xFFFE });

    cpuRegisters.flags.Z = 1;
    executeNextOpcode(6);
    checkRegisters({ PC: 0x1345, SP: 0xFFFC });
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x1117);
  });

  it('0xCD - CALL a16', () => {
    addressBus.get(0x1111).byte = 0xCD;
    addressBus.get(0x1112).word = 0x1234;

    cpuRegisters.PC = 0x1111;
    cpuRegisters.SP = 0xFFFE;

    executeNextOpcode(6);
    checkRegisters({ PC: 0x1234, SP: 0xFFFC });
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x1114);
  });

  it('0xCE - ADC A,d8', () => {
    addressBus.get(0x0000).byte = 0xCE;
    addressBus.get(0x0001).byte = 0x01;
    addressBus.get(0x0002).byte = 0xCE;
    addressBus.get(0x0003).byte = 0x01;

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
    addressBus.get(0x0123).byte = 0xCF;
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x0124);
    checkRegisters({ PC: 0x0008, SP: 0xFFFC });
  });

  it('0xD0 - RET NC', () => {
    addressBus.get(0x0000).byte = 0xD0;
    addressBus.get(0x0001).byte = 0xD0;

    cpuRegisters.SP = 0xFFFC;
    addressBus.get(0xFFFC).word = 0x1234;

    cpuRegisters.flags.C = 1;
    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(5);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
  });

  it('0xD1 - POP DE', () => {
    addressBus.get(0x0000).byte = 0xD1;
    addressBus.get(0x0001).byte = 0xD1;

    cpuRegisters.SP = 0xFFFA;
    addressBus.get(0xFFFA).word = 0x1234;
    addressBus.get(0xFFFC).word = 0x5678;

    executeNextOpcode(3);
    checkRegisters({ DE: 0x1234, SP: 0xFFFC, PC: 0x0001 });

    executeNextOpcode(3);
    checkRegisters({ DE: 0x5678, SP: 0xFFFE, PC: 0x0002 });
  });

  it('0xD2 - JP NC,a16', () => {
    addressBus.get(0x0000).byte = 0xD2;
    addressBus.get(0x0001).word = 0x0012;
    addressBus.get(0x0003).byte = 0xD2;
    addressBus.get(0x0004).word = 0x0034;

    cpuRegisters.flags.C = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xD4 - CALL NC,a16', () => {
    addressBus.get(0x1111).byte = 0xD4;
    addressBus.get(0x1112).word = 0x1234;
    addressBus.get(0x1114).byte = 0xD4;
    addressBus.get(0x1115).word = 0x1345;

    cpuRegisters.PC = 0x1111;
    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.flags.C = 1;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x1114, SP: 0xFFFE });

    cpuRegisters.flags.C = 0;
    executeNextOpcode(6);
    checkRegisters({ PC: 0x1345, SP: 0xFFFC });
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x1117);
  });

  it('0xD5 - PUSH DE', () => {
    addressBus.get(0x0000).byte = 0xD5;
    addressBus.get(0x0001).byte = 0xD5;

    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.DE = 0x1234;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });
    addressBus.get(cpuRegisters.SP).word = 0x1234;

    cpuRegisters.DE = 0x5678;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFA, PC: 0x0002 });
    addressBus.get(cpuRegisters.SP).word = 0x5678;
  });

  it('0xD6 - SUB d8', () => {
    addressBus.get(0x0000).byte = 0xD6;
    addressBus.get(0x0001).byte = 0x01;
    addressBus.get(0x0002).byte = 0xD6;
    addressBus.get(0x0003).byte = 0x01;

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
    addressBus.get(0x0123).byte = 0xD7;
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x0124);
    checkRegisters({ PC: 0x0010, SP: 0xFFFC });
  });

  it('0xD8 - RET C', () => {
    addressBus.get(0x0000).byte = 0xD8;
    addressBus.get(0x0001).byte = 0xD8;

    cpuRegisters.SP = 0xFFFC;
    addressBus.get(0xFFFC).word = 0x1234;

    cpuRegisters.flags.C = 0;
    executeNextOpcode(2);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(5);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
  });

  it('0xD9 - RETI', () => {
    addressBus.get(0x0000).byte = 0xD9;

    cpuRegisters.SP = 0xFFFC;
    addressBus.get(0xFFFC).word = 0x1234;

    const spy = sinon.spy(cpuCallbacks, 'enableInterrupts');
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFE, PC: 0x1234 });
    expect(spy.calledOnce).to.equal(true);
  });

  it('0xDA - JP C,a16', () => {
    addressBus.get(0x0000).byte = 0xDA;
    addressBus.get(0x0001).word = 0x0012;
    addressBus.get(0x0003).byte = 0xDA;
    addressBus.get(0x0004).word = 0x0034;

    cpuRegisters.flags.C = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(4);
    checkRegisters({ PC: 0x0034 });
  });

  it('0xDC - CALL C,a16', () => {
    addressBus.get(0x1111).byte = 0xDC;
    addressBus.get(0x1112).word = 0x1234;
    addressBus.get(0x1114).byte = 0xDC;
    addressBus.get(0x1115).word = 0x1345;

    cpuRegisters.PC = 0x1111;
    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.flags.C = 0;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x1114, SP: 0xFFFE });

    cpuRegisters.flags.C = 1;
    executeNextOpcode(6);
    checkRegisters({ PC: 0x1345, SP: 0xFFFC });
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x1117);
  });

  it('0xDE - SBC A,d8', () => {
    addressBus.get(0x0000).byte = 0xDE;
    addressBus.get(0x0001).byte = 0x01;
    addressBus.get(0x0002).byte = 0xDE;
    addressBus.get(0x0003).byte = 0x01;

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
    addressBus.get(0x0123).byte = 0xDF;
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x0124);
    checkRegisters({ PC: 0x0018, SP: 0xFFFC });
  });

  it('0xE0 - LDH (a8),A', () => {
    addressBus.get(0x0000).byte = 0xE0;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0xE0;
    addressBus.get(0x0003).byte = 0x34;

    cpuRegisters.A = 0x56;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0002 });
    expect(addressBus.get(0xFF12).byte).to.equal(0x56);

    cpuRegisters.A = 0x78;
    executeNextOpcode(3);
    checkRegisters({ PC: 0x0004 });
    expect(addressBus.get(0xFF34).byte).to.equal(0x78);
  });

  it('0xE1 - POP HL', () => {
    addressBus.get(0x0000).byte = 0xE1;
    addressBus.get(0x0001).byte = 0xE1;

    cpuRegisters.SP = 0xFFFA;
    addressBus.get(0xFFFA).word = 0x1234;
    addressBus.get(0xFFFC).word = 0x5678;

    executeNextOpcode(3);
    checkRegisters({ HL: 0x1234, SP: 0xFFFC, PC: 0x0001 });

    executeNextOpcode(3);
    checkRegisters({ HL: 0x5678, SP: 0xFFFE, PC: 0x0002 });
  });

  it('0xE2 - LD (C),A', () => {
    addressBus.get(0x0000).byte = 0xE2;
    addressBus.get(0x0001).byte = 0xE2;

    cpuRegisters.C = 0x12;
    cpuRegisters.A = 0x34;
    executeNextOpcode(2);
    expect(addressBus.get(0xFF12).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0001 });

    cpuRegisters.C = 0x13;
    cpuRegisters.A = 0x56;
    executeNextOpcode(2);
    expect(addressBus.get(0xFF13).byte).to.equal(0x56);
    checkRegisters({ PC: 0x0002 });
  });

  it('0xE5 - PUSH HL', () => {
    addressBus.get(0x0000).byte = 0xE5;
    addressBus.get(0x0001).byte = 0xE5;

    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.HL = 0x1234;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });
    addressBus.get(cpuRegisters.SP).word = 0x1234;

    cpuRegisters.HL = 0x5678;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFA, PC: 0x0002 });
    addressBus.get(cpuRegisters.SP).word = 0x5678;
  });

  it('0xE6 - AND d8', () => {
    addressBus.get(0x0000).byte = 0xE6;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0xE6;
    addressBus.get(0x0003).byte = 0x34;
    addressBus.get(0x0004).byte = 0xE6;
    addressBus.get(0x0005).byte = 0x00;

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
    addressBus.get(0x0123).byte = 0xE7;
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x0124);
    checkRegisters({ PC: 0x0020, SP: 0xFFFC });
  });

  it('0xE8 - ADD SP,r8', () => {
    addressBus.get(0x0000).byte = 0xE8;
    addressBus.get(0x0001).byte = 0x03;
    addressBus.get(0x0002).byte = 0xE8;
    addressBus.get(0x0003).byte = 0xFD;

    cpuRegisters.flags.Z = 1;
    cpuRegisters.flags.N = 1;
    cpuRegisters.flags.H = 1;
    cpuRegisters.flags.C = 1;

    cpuRegisters.SP = 0x0FFE;
    executeNextOpcode(4);
    checkRegisters({ SP: 0x1001, PC: 0x0002 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });

    cpuRegisters.SP = 0x0FFE;
    executeNextOpcode(4);
    checkRegisters({ SP: 0x0FFB, PC: 0x0004 });
    checkFlags({ Z: 0, N: 0, H: 1, C: 0 });
  });

  it('0xE9 - JP HL', () => {
    addressBus.get(0x0000).byte = 0xE9;
    addressBus.get(0x0012).byte = 0xE9;

    cpuRegisters.HL = 0x0012;
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0012 });

    cpuRegisters.HL = 0xC123;
    executeNextOpcode(1);
    checkRegisters({ PC: 0xC123 });
  });

  it('0xEA - LD (a16),A', () => {
    addressBus.get(0x0000).byte = 0xEA;
    addressBus.get(0x0001).word = 0xC000;
    addressBus.get(0x0003).byte = 0xEA;
    addressBus.get(0x0004).word = 0xC001;

    cpuRegisters.A = 0x12;
    executeNextOpcode(4);
    expect(addressBus.get(0xC000).byte).to.equal(0x12);
    checkRegisters({ PC: 0x0003 });

    cpuRegisters.A = 0x34;
    executeNextOpcode(4);
    expect(addressBus.get(0xC001).byte).to.equal(0x34);
    checkRegisters({ PC: 0x0006 });
  });

  it('0xEE - XOR d8', () => {
    addressBus.get(0x0000).byte = 0xEE;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0xEE;
    addressBus.get(0x0003).byte = 0x34;

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
    addressBus.get(0x0123).byte = 0xEF;
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x0124);
    checkRegisters({ PC: 0x0028, SP: 0xFFFC });
  });

  it('0xF0 - LDH A,(a8)', () => {
    addressBus.get(0x0000).byte = 0xF0;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0xF0;
    addressBus.get(0x0003).byte = 0x34;

    addressBus.get(0xFF12).byte = 0x56;
    addressBus.get(0xFF34).byte = 0x78;

    executeNextOpcode(3);
    checkRegisters({ A: 0x56, PC: 0x0002 });

    executeNextOpcode(3);
    checkRegisters({ A: 0x78, PC: 0x0004 });
  });

  it('0xF1 - POP AF', () => {
    addressBus.get(0x0000).byte = 0xF1;
    addressBus.get(0x0001).byte = 0xF1;

    cpuRegisters.SP = 0xFFFA;
    addressBus.get(0xFFFA).word = 0x1234;
    addressBus.get(0xFFFC).word = 0x5678;

    executeNextOpcode(3);
    checkRegisters({ AF: (0x1234 & ~0b1111), SP: 0xFFFC, PC: 0x0001 });

    executeNextOpcode(3);
    checkRegisters({ AF: (0x5678 & ~0b1111), SP: 0xFFFE, PC: 0x0002 });
  });

  it('0xF2 - LD A,(C)', () => {
    addressBus.get(0x0000).byte = 0xF2;
    addressBus.get(0x0001).byte = 0xF2;

    cpuRegisters.C = 0x12;
    addressBus.get(0xFF12).byte = 0x34;
    executeNextOpcode(2);
    checkRegisters({ A: 0x34, PC: 0x0001 });

    cpuRegisters.C = 0x13;
    addressBus.get(0xFF13).byte = 0x56;
    executeNextOpcode(2);
    checkRegisters({ A: 0x56, PC: 0x0002 });
  });

  it('0xF3 - DI', () => {
    addressBus.get(0x0000).byte = 0xF3;

    const spy = sinon.spy(cpuCallbacks, 'disableInterrupts');
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0001 });
    expect(spy.calledOnce).to.equal(true);
  });

  it('0xF5 - PUSH AF', () => {
    addressBus.get(0x0000).byte = 0xF5;
    addressBus.get(0x0001).byte = 0xF5;

    cpuRegisters.SP = 0xFFFE;

    cpuRegisters.AF = 0x1234;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFC, PC: 0x0001 });
    addressBus.get(cpuRegisters.SP).word = 0x1234;

    cpuRegisters.AF = 0x5678;
    executeNextOpcode(4);
    checkRegisters({ SP: 0xFFFA, PC: 0x0002 });
    addressBus.get(cpuRegisters.SP).word = 0x5678;
  });

  it('0xF6 - OR d8', () => {
    addressBus.get(0x0000).byte = 0xF6;
    addressBus.get(0x0001).byte = 0x12;
    addressBus.get(0x0002).byte = 0xF6;
    addressBus.get(0x0003).byte = 0x34;
    addressBus.get(0x0004).byte = 0xF6;
    addressBus.get(0x0005).byte = 0x00;

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
    addressBus.get(0x0123).byte = 0xF7;
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x0124);
    checkRegisters({ PC: 0x0030, SP: 0xFFFC });
  });

  it('0xF8 - LD HL,SP+r8', () => {
    addressBus.get(0x0000).byte = 0xF8;
    addressBus.get(0x0001).byte = 0x03;
    addressBus.get(0x0002).byte = 0xF8;
    addressBus.get(0x0003).byte = 0xFD;

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
    addressBus.get(0x0000).byte = 0xF9;
    addressBus.get(0x0001).byte = 0xF9;

    cpuRegisters.HL = 0x1234;
    executeNextOpcode(2);
    checkRegisters({ SP: 0x1234, PC: 0x0001 });

    cpuRegisters.HL = 0x5678;
    executeNextOpcode(2);
    checkRegisters({ HL: 0x5678, PC: 0x0002 });
  });

  it('0xFA - LD A,(a16)', () => {
    addressBus.get(0x0000).byte = 0xFA;
    addressBus.get(0x0001).word = 0xC000;
    addressBus.get(0x0003).byte = 0xFA;
    addressBus.get(0x0004).word = 0xC000;

    addressBus.get(0xC000).byte = 0x12;
    executeNextOpcode(4);
    checkRegisters({ A: 0x12, PC: 0x0003 });

    addressBus.get(0xC000).byte = 0x34;
    executeNextOpcode(4);
    checkRegisters({ A: 0x34, PC: 0x0006 });
  });

  it('0xFB - EI', () => {
    addressBus.get(0x0000).byte = 0xFB;

    const spy = sinon.spy(cpuCallbacks, 'enableInterrupts');
    executeNextOpcode(1);
    checkRegisters({ PC: 0x0001 });
    expect(spy.calledOnce).to.equal(true);
  });

  it('0xFE - CP d8', () => {
    addressBus.get(0x0000).byte = 0xFE;
    addressBus.get(0x0001).byte = 0x01;
    addressBus.get(0x0002).byte = 0xFE;
    addressBus.get(0x0003).byte = 0x01;

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
    addressBus.get(0x0123).byte = 0xFF;
    cpuRegisters.PC = 0x0123;

    executeNextOpcode(4);
    expect(addressBus.get(cpuRegisters.SP).word).to.equal(0x0124);
    checkRegisters({ PC: 0x0038, SP: 0xFFFC });
  });
});
