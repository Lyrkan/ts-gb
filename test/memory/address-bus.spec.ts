import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { AddressBus } from '../../src/memory/address-bus';
import { GameCartridge } from '../../src/cartridge/game-cartridge';

describe('AddressBus', () => {
  let addressBus: AddressBus;

  beforeEach(() => {
    addressBus = new AddressBus();
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
      expect(addressBus.get(0x0000).byte).to.equal(0x00);
      expect(addressBus.get(0x0000).byte).to.equal(0x00);
      expect(addressBus.get(0x00FE).byte).to.equal(0x00);
      expect(addressBus.get(0x00FF).byte).to.equal(0x00);

      addressBus.reset();

      expect(addressBus.get(0x0000).byte).to.equal(0x12);
      expect(addressBus.get(0x0001).byte).to.equal(0x34);
      expect(addressBus.get(0x00FE).byte).to.equal(0x56);
      expect(addressBus.get(0x00FF).byte).to.equal(0x78);
    });

    it('should disable the boot ROM if a write occurs on 0xFF50', () => {
      const bootRomBuffer = new ArrayBuffer(256);
      const bootRomView = new DataView(bootRomBuffer);
      bootRomView.setUint8(0x00, 0x12);
      bootRomView.setUint8(0x01, 0x34);

      addressBus.loadBootRom(bootRomBuffer);
      addressBus.reset();

      expect(addressBus.get(0x0000).byte).to.equal(0x12);
      expect(addressBus.get(0x0001).byte).to.equal(0x34);

      addressBus.get(0xFF50).byte = 0x01;

      expect(addressBus.get(0x0000).byte).to.equal(0x00);
      expect(addressBus.get(0x0001).byte).to.equal(0x00);
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
      addressBus.get(0x0000); // tslint:disable-line:no-unused-expression
      addressBus.get(0x2000); // tslint:disable-line:no-unused-expression
      addressBus.get(0x3FFF); // tslint:disable-line:no-unused-expression

      expect(staticRomBankSpy.get.callCount).to.equal(3);
      expect(switchableRomBankSpy.get.callCount).to.equal(0);
      expect(ramBankSpy.get.callCount).to.equal(0);
    });

    it('should be able to access cartridge switchable ROM bank', () => {
      addressBus.get(0x4000); // tslint:disable-line:no-unused-expression
      addressBus.get(0x6000); // tslint:disable-line:no-unused-expression
      addressBus.get(0x7FFF); // tslint:disable-line:no-unused-expression

      expect(staticRomBankSpy.get.callCount).to.equal(0);
      expect(switchableRomBankSpy.get.callCount).to.equal(3);
      expect(ramBankSpy.get.callCount).to.equal(0);
    });

    it('should be able to access cartridge RAM bank', () => {
      addressBus.get(0xA000); // tslint:disable-line:no-unused-expression
      addressBus.get(0xB000); // tslint:disable-line:no-unused-expression
      addressBus.get(0xBFFF); // tslint:disable-line:no-unused-expression

      expect(staticRomBankSpy.get.callCount).to.equal(0);
      expect(switchableRomBankSpy.get.callCount).to.equal(0);
      expect(ramBankSpy.get.callCount).to.equal(3);
    });
  });

  describe('Video RAM', () => {
    it('should be able to read/write from/into Video RAM', () => {
      addressBus.get(0x8000).byte = 0x12;
      addressBus.get(0x8ABC).word = 0x5678;
      addressBus.get(0x9FFF).byte = 0x9A;

      expect(addressBus.get(0x8000).byte).to.equal(0x12);
      expect(addressBus.get(0x8ABC).byte).to.equal(0x78);
      expect(addressBus.get(0x8ABD).byte).to.equal(0x56);
      expect(addressBus.get(0x8ABC).word).to.equal(0x5678);
      expect(addressBus.get(0x9FFF).byte).to.equal(0x9A);
    });
  });

  describe('Internal RAM', () => {
    it('should be able to read/write from/into internal RAM', () => {
      addressBus.get(0xC000).byte = 0x12;
      addressBus.get(0xCDD2).word = 0x5678;
      addressBus.get(0xDFFF).byte = 0x9A;

      expect(addressBus.get(0xC000).byte).to.equal(0x12);
      expect(addressBus.get(0xCDD2).byte).to.equal(0x78);
      expect(addressBus.get(0xCDD3).byte).to.equal(0x56);
      expect(addressBus.get(0xCDD2).word).to.equal(0x5678);
      expect(addressBus.get(0xDFFF).byte).to.equal(0x9A);
    });
  });

  describe('Echo of internal RAM', () => {
    it('should be able to read/write from/into echo of internal RAM', () => {
      addressBus.get(0xE000).byte = 0x12;
      addressBus.get(0xEDD2).word = 0x5678;
      addressBus.get(0xFDFF).byte = 0x9A;

      expect(addressBus.get(0xE000).byte).to.equal(0x12);
      expect(addressBus.get(0xEDD2).byte).to.equal(0x78);
      expect(addressBus.get(0xEDD3).byte).to.equal(0x56);
      expect(addressBus.get(0xeDD2).word).to.equal(0x5678);
      expect(addressBus.get(0xFDFF).byte).to.equal(0x9A);
    });

    it('should be able to write into RAM and retrieve the value from the echo', () => {
      addressBus.get(0xC000).byte = 0x12;
      addressBus.get(0xCDD2).word = 0x5678;
      addressBus.get(0xDDFF).byte = 0x9A;

      expect(addressBus.get(0xE000).byte).to.equal(0x12);
      expect(addressBus.get(0xEDD2).byte).to.equal(0x78);
      expect(addressBus.get(0xEDD3).byte).to.equal(0x56);
      expect(addressBus.get(0xeDD2).word).to.equal(0x5678);
      expect(addressBus.get(0xFDFF).byte).to.equal(0x9A);
    });

    it('should be able to write into the echo and retrieve the value from the RAM', () => {
      addressBus.get(0xE000).byte = 0x12;
      addressBus.get(0xEDD2).word = 0x5678;
      addressBus.get(0xFDFF).byte = 0x9A;

      expect(addressBus.get(0xC000).byte).to.equal(0x12);
      expect(addressBus.get(0xCDD2).byte).to.equal(0x78);
      expect(addressBus.get(0xCDD3).byte).to.equal(0x56);
      expect(addressBus.get(0xCDD2).word).to.equal(0x5678);
      expect(addressBus.get(0xDDFF).byte).to.equal(0x9A);
    });
  });

  describe('Sprite attribute table (OAM)', () => {
    it('should be able to read/write from/into OAM', () => {
      addressBus.get(0xFE00).byte = 0x12;
      addressBus.get(0xFE34).word = 0x5678;
      addressBus.get(0xFE9F).byte = 0x9A;

      expect(addressBus.get(0xFE00).byte).to.equal(0x12);
      expect(addressBus.get(0xFE34).byte).to.equal(0x78);
      expect(addressBus.get(0xFE35).byte).to.equal(0x56);
      expect(addressBus.get(0xFE34).word).to.equal(0x5678);
      expect(addressBus.get(0xFE9F).byte).to.equal(0x9A);
    });
  });

  describe('Reserved memory', () => {
    it('should not be able to use addresses from 0xFEA0 to 0xFEFF', () => {
      addressBus.get(0xFEA0).byte = 0x12;
      addressBus.get(0xFECD).byte = 0x34;
      addressBus.get(0xFEFF).byte = 0x56;

      expect(addressBus.get(0xFEA0).byte).to.equal(0x00);
      expect(addressBus.get(0xFEA0).word).to.equal(0x00);

      expect(addressBus.get(0xFECD).byte).to.equal(0x00);
      expect(addressBus.get(0xFECD).word).to.equal(0x00);

      expect(addressBus.get(0xFEFF).byte).to.equal(0x00);
      expect(addressBus.get(0xFEFF).word).to.equal(0x00);
    });
  });

  describe('High RAM', () => {
    it('should be able to read/write from/into HRAM', () => {
      addressBus.get(0xFF80).byte = 0x12;
      addressBus.get(0xFFAB).word = 0x5678;
      addressBus.get(0xFFFE).byte = 0x9A;

      expect(addressBus.get(0xFF80).byte).to.equal(0x12);
      expect(addressBus.get(0xFFAB).byte).to.equal(0x78);
      expect(addressBus.get(0xFFAC).byte).to.equal(0x56);
      expect(addressBus.get(0xFFAB).word).to.equal(0x5678);
      expect(addressBus.get(0xFFFE).byte).to.equal(0x9A);
    });
  });

  describe('Interrupts Enable Registers', () => {
    it('should be able to read/write from/into Interrupts Enable Registers', () => {
      addressBus.get(0xFFFF).byte = 0x12;
      expect(addressBus.get(0xFFFF).byte).to.equal(0x12);
    });
  });

  describe('Reset', () => {
    it('should empty all segments on reset', () => {
      const cartridge = new GameCartridge(new ArrayBuffer(32 * 1024));
      const cartridgeResetSpy = sinon.spy(cartridge, 'reset');
      addressBus.loadCartridge(cartridge);

      addressBus.get(0x8000).byte = 0x12;
      addressBus.get(0xC000).byte = 0x12;
      addressBus.get(0xFE00).byte = 0x12;
      addressBus.get(0xFF80).byte = 0x12;
      addressBus.get(0xFFFF).byte = 0x12;

      addressBus.reset();

      expect(addressBus.get(0x8000).byte).to.equal(0x00);
      expect(addressBus.get(0xC000).byte).to.equal(0x00);
      expect(addressBus.get(0xFE00).byte).to.equal(0x00);
      expect(addressBus.get(0xFF80).byte).to.equal(0x00);
      expect(addressBus.get(0xFFFF).byte).to.equal(0x00);

      expect(cartridgeResetSpy.calledOnce).to.equal(true);
    });
  });

  describe('Errors handling', () => {
    it('should not allow to access invalid addresses', () => {
      expect(() => {
        addressBus.get(-1); // tslint:disable-line:no-unused-expression
      }).to.throw('Invalid address');

      expect(() => {
        addressBus.get(0x10000); // tslint:disable-line:no-unused-expression
      }).to.throw('Invalid address');
    });
  });
});
