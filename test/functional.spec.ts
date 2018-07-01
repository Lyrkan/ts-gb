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
      checkScreenBuffer('a7823c5f1f05baea6395a90b897b8fba6fbcc139');
    });

    it('02-interrupts.gb', () => {
      loadGame('../roms/02-interrupts.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('0499a68f7a9f955645db29df654f5d076e6e65a4');
    });

    it('03-op sp,hl.gb', () => {
      loadGame('../roms/03-op sp,hl.gb');
      runTicks(3 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('8a16da152273daf881f204b81c82fdb073ffd4a2');
    });

    it('04-op r,imm.gb', () => {
      loadGame('../roms/04-op r,imm.gb');
      runTicks(3 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('0f0c7d823e445198654e274ce90dfe227bf59796');
    });

    it('05-op rp.gb', () => {
      loadGame('../roms/05-op rp.gb');
      runTicks(4 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('6aa4735df6cc21747e30bb9a35b2c96be702e3c6');
    });

    it('06-ld r,r.gb', () => {
      loadGame('../roms/06-ld r,r.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('c4ed5f344be1d718bada6cc6291b409460ecd609');
    });

    it('07-jr,jp,call,ret,rst.gb', () => {
      loadGame('../roms/07-jr,jp,call,ret,rst.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('1be58decbc2c6085b4e5cbba9f25b74ff873ea04');
    });

    it('08-misc instrs.gb', () => {
      loadGame('../roms/08-misc instrs.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('1a11b7f4c6065af0901620119869a241dac907a4');
    });

    it('09-op r,r.gb', () => {
      loadGame('../roms/09-op r,r.gb');
      runTicks(10 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('befaea6c341a6c9779dfc07587216b173285d7e0');
    });

    it('10-bit ops.gb', () => {
      loadGame('../roms/10-bit ops.gb');
      runTicks(14 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('73f23088b3ca9ce74c18a71b05560cb83b902dd8');
    });

    it('11-op a,(hl).gb', () => {
      loadGame('../roms/11-op a,(hl).gb');
      runTicks(18 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('7ade30acc5ebce74ddc124bd96ae15d259369bb4');
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
