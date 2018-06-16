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
      checkScreenBuffer('21efc7402a70a2f091d9623541ec481f048c4559');
    });

    it('02-interrupts.gb', () => {
      loadGame('../roms/02-interrupts.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('24210fc58676ab499e343ae549655d420c5d4866');
    });

    it('03-op sp,hl.gb', () => {
      loadGame('../roms/03-op sp,hl.gb');
      runTicks(3 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('cb43782004d3cc1448e6c9ffe0acbeeefc4a9065');
    });

    it('04-op r,imm.gb', () => {
      loadGame('../roms/04-op r,imm.gb');
      runTicks(3 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('bf95a77649cc66b16eb8494d7d49e068f7645c8b');
    });

    it('05-op rp.gb', () => {
      loadGame('../roms/05-op rp.gb');
      runTicks(4 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('352e769cadf597211f31e85df53d77698225dd5f');
    });

    it('06-ld r,r.gb', () => {
      loadGame('../roms/06-ld r,r.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('6a46a37c9d6ec7ce8dd7b89ef64546b1c974ca69');
    });

    it('07-jr,jp,call,ret,rst.gb', () => {
      loadGame('../roms/07-jr,jp,call,ret,rst.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('f240334be5418d2de6dc5a09e5a520e3a4d1eb28');
    });

    it('08-misc instrs.gb', () => {
      loadGame('../roms/08-misc instrs.gb');
      runTicks(CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('0e189b3633b0c66ba04a61685b618925510e5bde');
    });

    it('09-op r,r.gb', () => {
      loadGame('../roms/09-op r,r.gb');
      runTicks(10 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('e9ad3ea39e54f9e125a30bece2e3b38ebd9b243a');
    });

    it('10-bit ops.gb', () => {
      loadGame('../roms/10-bit ops.gb');
      runTicks(14 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('4d163c095aa60b92ca94701591fa0dd5928cdf10');
    });

    it('11-op a,(hl).gb', () => {
      loadGame('../roms/11-op a,(hl).gb');
      runTicks(18 * CPU_CLOCK_FREQUENCY);
      checkScreenBuffer('a8e5e245319af47449a8e3bf6a5e06e91a98bb82');
    });
  });
});
