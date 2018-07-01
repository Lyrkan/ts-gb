import 'mocha';
import { expect } from 'chai';
import { CPU_CLOCK_FREQUENCY } from '../src/cpu/cpu';
import { System } from '../src/system';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

describe('Functional tests', () => {
  let system: System;

  const loadGame = (romPath: string) => {
    const fullPath = path.join(__dirname, romPath);
    const fileBuffer = fs.readFileSync(fullPath);

    if (!fileBuffer) {
      throw new Error(`Could not open ROM file "${fullPath}"`);
    }

    system.loadGame(
      fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      )
    );
  };

  const runTicks = (ticks: number) => {
    for (let i = 0; i < ticks; i++) {
      system.tick();
    }
  };

  const checkScreenBuffer = (hash: string) =>  {
    const buffer = system.display.getFrontBuffer();
    const sha1 = crypto.createHash('sha1');
    sha1.update(buffer);
    expect(sha1.digest('hex')).to.equal(hash);
  };

  beforeEach(() => {
    system = new System();
  });

  describe('Blargg\'s test ROMs', () => {
    it('01-special.gb', () => {
      loadGame('../roms/01-special.gb');
      runTicks(3 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('04b205c35e21532ef79028aa0322688c0ebf99c0');
    });

    it('02-interrupts.gb', () => {
      loadGame('../roms/02-interrupts.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('4436a31dcc3e959e1554b3d82da209419cf5455f');
    });

    it('03-op sp,hl.gb', () => {
      loadGame('../roms/03-op sp,hl.gb');
      runTicks(3 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('e656fda95592f75fab3f31db77d9e0fc93286e7d');
    });

    it('04-op r,imm.gb', () => {
      loadGame('../roms/04-op r,imm.gb');
      runTicks(3 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('a0b87340951b4d34394f2a5c57605eba164961f5');
    });

    it('05-op rp.gb', () => {
      loadGame('../roms/05-op rp.gb');
      runTicks(4 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('8a985cb44540c381aa453d87ee91a0c975e9da0e');
    });

    it('06-ld r,r.gb', () => {
      loadGame('../roms/06-ld r,r.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('634af929cf8434627ff59cac64e43721154d9e4f');
    });

    it('07-jr,jp,call,ret,rst.gb', () => {
      loadGame('../roms/07-jr,jp,call,ret,rst.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('4e0d58e67a374a571df5f11e5fe457b25ad3ec32');
    });

    it('08-misc instrs.gb', () => {
      loadGame('../roms/08-misc instrs.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('99fe8304f58c4740994b3cc60184c676358407a2');
    });

    it('09-op r,r.gb', () => {
      loadGame('../roms/09-op r,r.gb');
      runTicks(10 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('7284d05eb66ed25088171316ec9aa975e4fd5b60');
    });

    it('10-bit ops.gb', () => {
      loadGame('../roms/10-bit ops.gb');
      runTicks(14 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('42470410d08c1811ce1c48ae952a96bf62556319');
    });

    it('11-op a,(hl).gb', () => {
      loadGame('../roms/11-op a,(hl).gb');
      runTicks(18 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('d085eb1221eecdac8736995f39c110a744d431ab');
    });
  });

  describe('Shonumi\'s test ROMs', () => {
    it('lyc.gb (LY=LYC check)', () => {
      loadGame('../roms/lyc.gb');
      runTicks(1 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('e6e5e99fdc74711390c53e9d1c23713bcc448d4f');
    });
  });
});
