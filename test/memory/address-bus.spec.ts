import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { AddressBus } from '../../src/memory/address-bus';
import { GameCartridge } from '../../src/cartridge/game-cartridge';
import { Joypad, BUTTON } from '../../src/controls/joypad';
import { DMAHandler } from '../../src/memory/dma/dma-handler';
import { CPUTimer } from '../../src/cpu/cpu-timer';
import { Audio } from '../../src/audio/audio';
import { Display } from '../../src/display/display';

describe('AddressBus', () => {
  let addressBus: AddressBus;
  let joypad: Joypad;

  beforeEach(() => {
    joypad = new Joypad();
    addressBus = new AddressBus(
      joypad,
      new DMAHandler(),
      new CPUTimer(),
      new Audio(),
      new Display(),
    );
  });

  describe('Bootstrap ROM', () => {
    beforeEach(() => {
      const cartridge = new GameCartridge(new ArrayBuffer(32 * 1024));
      addressBus.loadCartridge(cartridge);
    });

    it('should be able to load a boot ROM', () => {
      // Should not have any boot rom loaded by default
      expect(addressBus.hasBootRom()).to.equal(false);

      // Load an empty boot rom
      addressBus.loadBootRom(new ArrayBuffer(256));
      expect(addressBus.hasBootRom()).to.equal(true);
    });

    it('should use the boot ROM if enabled', () => {
      const bootRomBuffer = new ArrayBuffer(256);
      const bootRomView = new DataView(bootRomBuffer);
      bootRomView.setUint8(0x00, 0x12);
      bootRomView.setUint8(0x01, 0x34);
      bootRomView.setUint8(0xFE, 0x56);
      bootRomView.setUint8(0XFF, 0x78);

      addressBus.loadBootRom(bootRomBuffer);

      // Not effective until address bus reset
      expect(addressBus.getByte(0x0000)).to.equal(0x00);
      expect(addressBus.getByte(0x0000)).to.equal(0x00);
      expect(addressBus.getByte(0x00FE)).to.equal(0x00);
      expect(addressBus.getByte(0x00FF)).to.equal(0x00);

      addressBus.reset();

      expect(addressBus.getByte(0x0000)).to.equal(0x12);
      expect(addressBus.getByte(0x0001)).to.equal(0x34);
      expect(addressBus.getByte(0x00FE)).to.equal(0x56);
      expect(addressBus.getByte(0x00FF)).to.equal(0x78);
    });

    it('should disable the boot ROM if a write occurs on 0xFF50', () => {
      const bootRomBuffer = new ArrayBuffer(256);
      const bootRomView = new DataView(bootRomBuffer);
      bootRomView.setUint8(0x00, 0x12);
      bootRomView.setUint8(0x01, 0x34);

      addressBus.loadBootRom(bootRomBuffer);
      addressBus.reset();

      expect(addressBus.getByte(0x0000)).to.equal(0x12);
      expect(addressBus.getByte(0x0001)).to.equal(0x34);

      addressBus.setByte(0xFF50, 0x01);

      expect(addressBus.getByte(0x0000)).to.equal(0x00);
      expect(addressBus.getByte(0x0001)).to.equal(0x00);
    });
  });

  describe('Cartridge', () => {
    let staticRomBankSpy: any;
    let switchableRomBankSpy: any;
    let ramBankSpy: any;

    beforeEach(() => {
      const cartridge = new GameCartridge(new ArrayBuffer(32 * 1024));

      // Current SinonJS's DefinitelyTyped definition
      // does not support spying on properties.
      staticRomBankSpy = (sinon.spy as any)(cartridge, 'staticRomBank', ['get']);
      switchableRomBankSpy = (sinon.spy as any)(cartridge, 'switchableRomBank', ['get']);
      ramBankSpy = (sinon.spy as any)(cartridge, 'ramBank', ['get']);

      addressBus.loadCartridge(cartridge);
    });

    it('should be able to access cartridge static ROM bank', () => {
      addressBus.getByte(0x0000);
      addressBus.getByte(0x2000);
      addressBus.getByte(0x3FFF);

      expect(staticRomBankSpy.get.callCount).to.equal(3);
      expect(switchableRomBankSpy.get.callCount).to.equal(0);
      expect(ramBankSpy.get.callCount).to.equal(0);
    });

    it('should be able to access cartridge switchable ROM bank', () => {
      addressBus.getByte(0x4000);
      addressBus.getByte(0x6000);
      addressBus.getByte(0x7FFF);

      expect(staticRomBankSpy.get.callCount).to.equal(0);
      expect(switchableRomBankSpy.get.callCount).to.equal(3);
      expect(ramBankSpy.get.callCount).to.equal(0);
    });

    it('should be able to access cartridge RAM bank', () => {
      addressBus.getByte(0xA000);
      addressBus.getByte(0xB000);
      addressBus.getByte(0xBFFF);

      expect(staticRomBankSpy.get.callCount).to.equal(0);
      expect(switchableRomBankSpy.get.callCount).to.equal(0);
      expect(ramBankSpy.get.callCount).to.equal(3);
    });
  });

  describe('Video RAM', () => {
    it('should be able to read/write from/into Video RAM', () => {
      addressBus.setByte(0x8000, 0x12);
      addressBus.setWord(0x8ABC, 0x5678);
      addressBus.setByte(0x9FFF, 0x9A);

      expect(addressBus.getByte(0x8000)).to.equal(0x12);
      expect(addressBus.getByte(0x8ABC)).to.equal(0x78);
      expect(addressBus.getByte(0x8ABD)).to.equal(0x56);
      expect(addressBus.getWord(0x8ABC)).to.equal(0x5678);
      expect(addressBus.getByte(0x9FFF)).to.equal(0x9A);
    });
  });

  describe('Internal RAM', () => {
    it('should be able to read/write from/into internal RAM', () => {
      addressBus.setByte(0xC000, 0x12);
      addressBus.setWord(0xCDD2, 0x5678);
      addressBus.setByte(0xDFFF, 0x9A);

      expect(addressBus.getByte(0xC000)).to.equal(0x12);
      expect(addressBus.getByte(0xCDD2)).to.equal(0x78);
      expect(addressBus.getByte(0xCDD3)).to.equal(0x56);
      expect(addressBus.getWord(0xCDD2)).to.equal(0x5678);
      expect(addressBus.getByte(0xDFFF)).to.equal(0x9A);
    });
  });

  describe('Echo of internal RAM', () => {
    it('should be able to read/write from/into echo of internal RAM', () => {
      addressBus.setByte(0xE000, 0x12);
      addressBus.setWord(0xEDD2, 0x5678);
      addressBus.setByte(0xFDFF, 0x9A);

      expect(addressBus.getByte(0xE000)).to.equal(0x12);
      expect(addressBus.getByte(0xEDD2)).to.equal(0x78);
      expect(addressBus.getByte(0xEDD3)).to.equal(0x56);
      expect(addressBus.getWord(0xeDD2)).to.equal(0x5678);
      expect(addressBus.getByte(0xFDFF)).to.equal(0x9A);
    });

    it('should be able to write into RAM and retrieve the value from the echo', () => {
      addressBus.setByte(0xC000, 0x12);
      addressBus.setWord(0xCDD2, 0x5678);
      addressBus.setByte(0xDDFF, 0x9A);

      expect(addressBus.getByte(0xE000)).to.equal(0x12);
      expect(addressBus.getByte(0xEDD2)).to.equal(0x78);
      expect(addressBus.getByte(0xEDD3)).to.equal(0x56);
      expect(addressBus.getWord(0xeDD2)).to.equal(0x5678);
      expect(addressBus.getByte(0xFDFF)).to.equal(0x9A);
    });

    it('should be able to write into the echo and retrieve the value from the RAM', () => {
      addressBus.setByte(0xE000, 0x12);
      addressBus.setWord(0xEDD2, 0x5678);
      addressBus.setByte(0xFDFF, 0x9A);

      expect(addressBus.getByte(0xC000)).to.equal(0x12);
      expect(addressBus.getByte(0xCDD2)).to.equal(0x78);
      expect(addressBus.getByte(0xCDD3)).to.equal(0x56);
      expect(addressBus.getWord(0xCDD2)).to.equal(0x5678);
      expect(addressBus.getByte(0xDDFF)).to.equal(0x9A);
    });
  });

  describe('Sprite attribute table (OAM)', () => {
    it('should be able to read/write from/into OAM', () => {
      addressBus.setByte(0xFE00, 0x12);
      addressBus.setWord(0xFE34, 0x5678);
      addressBus.setByte(0xFE9F, 0x9A);

      expect(addressBus.getByte(0xFE00)).to.equal(0x12);
      expect(addressBus.getByte(0xFE34)).to.equal(0x78);
      expect(addressBus.getByte(0xFE35)).to.equal(0x56);
      expect(addressBus.getWord(0xFE34)).to.equal(0x5678);
      expect(addressBus.getByte(0xFE9F)).to.equal(0x9A);
    });
  });

  describe('Reserved memory', () => {
    it('should not be able to use addresses from 0xFEA0 to 0xFEFF', () => {
      addressBus.setByte(0xFEA0, 0x12);
      addressBus.setByte(0xFECD, 0x34);
      addressBus.setByte(0xFEFF, 0x56);

      expect(addressBus.getByte(0xFEA0)).to.equal(0x00);
      expect(addressBus.getWord(0xFEA0)).to.equal(0x00);

      expect(addressBus.getByte(0xFECD)).to.equal(0x00);
      expect(addressBus.getWord(0xFECD)).to.equal(0x00);

      expect(addressBus.getByte(0xFEFF)).to.equal(0x00);
      expect(addressBus.getWord(0xFEFF)).to.equal(0x00);
    });
  });

  describe('High RAM', () => {
    it('should be able to read/write from/into HRAM', () => {
      addressBus.setByte(0xFF80, 0x12);
      addressBus.setWord(0xFFAB, 0x5678);
      addressBus.setByte(0xFFFE, 0x9A);

      expect(addressBus.getByte(0xFF80)).to.equal(0x12);
      expect(addressBus.getByte(0xFFAB)).to.equal(0x78);
      expect(addressBus.getByte(0xFFAC)).to.equal(0x56);
      expect(addressBus.getWord(0xFFAB)).to.equal(0x5678);
      expect(addressBus.getByte(0xFFFE)).to.equal(0x9A);
    });
  });

  describe('Interrupts Enable Registers', () => {
    it('should be able to read/write from/into Interrupts Enable Registers', () => {
      addressBus.setByte(0xFFFF, 0x12);
      expect(addressBus.getByte(0xFFFF)).to.equal(0x12);
    });
  });

  describe('Reset', () => {
    it('should empty all segments on reset', () => {
      const cartridge = new GameCartridge(new ArrayBuffer(32 * 1024));
      const cartridgeResetSpy = sinon.spy(cartridge, 'reset');
      addressBus.loadCartridge(cartridge);

      addressBus.setByte(0x8000, 0x12);
      addressBus.setByte(0xC000, 0x12);
      addressBus.setByte(0xFE00, 0x12);
      addressBus.setByte(0xFF80, 0x12);
      addressBus.setByte(0xFFFF, 0x12);

      addressBus.reset();

      expect(addressBus.getByte(0x8000)).to.equal(0x00);
      expect(addressBus.getByte(0xC000)).to.equal(0x00);
      expect(addressBus.getByte(0xFE00)).to.equal(0x00);
      expect(addressBus.getByte(0xFF80)).to.equal(0x00);
      expect(addressBus.getByte(0xFFFF)).to.equal(0x00);

      expect(cartridgeResetSpy.calledOnce).to.equal(true);
    });
  });

  describe('Joypad', () => {
    it('should ignore writes to buttons/directions bits', () => {
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      addressBus.setByte(0xFF00, 0x00);

      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);
    });

    it('should return the status of buttons', () => {
      // Select button keys mode
      addressBus.setByte(0xFF00, ~0x20);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      // Test button keys presses
      joypad.down(BUTTON.START);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x7);

      joypad.down(BUTTON.SELECT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x3);

      joypad.down(BUTTON.B);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x1);

      joypad.down(BUTTON.A);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x0);

      // Test buttons keys releases
      joypad.up(BUTTON.START);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x8);

      joypad.up(BUTTON.SELECT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xC);

      joypad.up(BUTTON.B);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xE);

      joypad.up(BUTTON.A);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      // Check that direction keys have no effect
      joypad.down(BUTTON.RIGHT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      joypad.down(BUTTON.LEFT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      joypad.down(BUTTON.UP);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      joypad.down(BUTTON.DOWN);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);
    });

    it('should return the status of direction keys', () => {
      // Select direction keys mode
      addressBus.setByte(0xFF00, ~0x10);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      // Test button keys presses
      joypad.down(BUTTON.DOWN);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x7);

      joypad.down(BUTTON.UP);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x3);

      joypad.down(BUTTON.LEFT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x1);

      joypad.down(BUTTON.RIGHT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x0);

      // Test buttons keys releases
      joypad.up(BUTTON.DOWN);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x8);

      joypad.up(BUTTON.UP);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xC);

      joypad.up(BUTTON.LEFT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xE);

      joypad.up(BUTTON.RIGHT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      // Check that direction keys have no effect
      joypad.down(BUTTON.A);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      joypad.down(BUTTON.B);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      joypad.down(BUTTON.SELECT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      joypad.down(BUTTON.START);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);
    });

    it('should work when both direction and button keys modes are selected', () => {
      // Select both button and direction keys modes
      addressBus.setByte(0xFF00, ~0x30);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);

      // Push Start/Select (button keys) + Down/Up (direction keys)
      // They have the same mapping so it should enable bits 2 and 3.
      joypad.down(BUTTON.START);
      joypad.down(BUTTON.SELECT);
      joypad.down(BUTTON.DOWN);
      joypad.down(BUTTON.UP);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x3);

      // Release Start and Up... it should still give the same
      // enabled bits.
      joypad.up(BUTTON.START);
      joypad.up(BUTTON.UP);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x3);

      // Push B/A (button keys) + Left/Right (direction keys)
      // They have the same mapping so it should enable bits 0 and 1.
      joypad.down(BUTTON.B);
      joypad.down(BUTTON.A);
      joypad.down(BUTTON.LEFT);
      joypad.down(BUTTON.RIGHT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x0);

      // Release B and Right... it should still give the same
      // enabled bits.
      joypad.up(BUTTON.B);
      joypad.up(BUTTON.RIGHT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0x0);

      // Release Select and Down
      joypad.up(BUTTON.SELECT);
      joypad.up(BUTTON.DOWN);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xC);

      // Release A and LEFT
      joypad.up(BUTTON.A);
      joypad.up(BUTTON.LEFT);
      expect(addressBus.getByte(0xFF00) & 0x0F).to.equal(0xF);
    });
  });

  describe('Errors handling', () => {
    it('should not allow to access invalid addresses', () => {
      expect(() => {
        addressBus.getByte(-1);
      }).to.throw('Invalid address');

      expect(() => {
        addressBus.getByte(0x10000);
      }).to.throw('Invalid address');
    });
  });
});
