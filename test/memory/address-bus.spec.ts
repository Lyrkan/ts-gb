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
    it('should be able to load a boot ROM');
    it('should use the boot ROM if enabled');
    it('should disable the boot ROM if a write occurs on 0xFF50');
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

    it('should be able to load a cartridge');

    it('should be able to access cartridge static ROM bank', () => {
      addressBus[0x0000]; // tslint:disable-line:no-unused-expression
      addressBus[0x2000]; // tslint:disable-line:no-unused-expression
      addressBus[0x3FFF]; // tslint:disable-line:no-unused-expression

      expect(staticRomBankSpy.get.callCount).to.equal(3);
      expect(switchableRomBankSpy.get.callCount).to.equal(0);
      expect(ramBankSpy.get.callCount).to.equal(0);
    });

    it('should be able to access cartridge switchable ROM bank', () => {
      addressBus[0x4000]; // tslint:disable-line:no-unused-expression
      addressBus[0x6000]; // tslint:disable-line:no-unused-expression
      addressBus[0x7FFF]; // tslint:disable-line:no-unused-expression

      expect(staticRomBankSpy.get.callCount).to.equal(0);
      expect(switchableRomBankSpy.get.callCount).to.equal(3);
      expect(ramBankSpy.get.callCount).to.equal(0);
    });

    it('should be able to access cartridge RAM bank', () => {
      addressBus[0xA000]; // tslint:disable-line:no-unused-expression
      addressBus[0xB000]; // tslint:disable-line:no-unused-expression
      addressBus[0xBFFF]; // tslint:disable-line:no-unused-expression

      expect(staticRomBankSpy.get.callCount).to.equal(0);
      expect(switchableRomBankSpy.get.callCount).to.equal(0);
      expect(ramBankSpy.get.callCount).to.equal(3);
    });
  });

  describe('Video RAM', () => {
    it('should be able to read/write from/into Video RAM', () => {
      addressBus[0x8000].byte = 0x12;
      addressBus[0x8ABC].word = 0x5678;
      addressBus[0x9FFF].byte = 0x9A;

      expect(addressBus[0x8000].byte).to.equal(0x12);
      expect(addressBus[0x8ABC].byte).to.equal(0x78);
      expect(addressBus[0x8ABD].byte).to.equal(0x56);
      expect(addressBus[0x8ABC].word).to.equal(0x5678);
      expect(addressBus[0x9FFF].byte).to.equal(0x9A);
    });
  });

  describe('Internal RAM', () => {
    it('should be able to read/write from/into internal RAM', () => {
      addressBus[0xC000].byte = 0x12;
      addressBus[0xCDD2].word = 0x5678;
      addressBus[0xDFFF].byte = 0x9A;

      expect(addressBus[0xC000].byte).to.equal(0x12);
      expect(addressBus[0xCDD2].byte).to.equal(0x78);
      expect(addressBus[0xCDD3].byte).to.equal(0x56);
      expect(addressBus[0xCDD2].word).to.equal(0x5678);
      expect(addressBus[0xDFFF].byte).to.equal(0x9A);
    });
  });

  describe('Echo of internal RAM', () => {
    it('should be able to read/write from/into echo of internal RAM', () => {
      addressBus[0xE000].byte = 0x12;
      addressBus[0xEDD2].word = 0x5678;
      addressBus[0xFDFF].byte = 0x9A;

      expect(addressBus[0xE000].byte).to.equal(0x12);
      expect(addressBus[0xEDD2].byte).to.equal(0x78);
      expect(addressBus[0xEDD3].byte).to.equal(0x56);
      expect(addressBus[0xeDD2].word).to.equal(0x5678);
      expect(addressBus[0xFDFF].byte).to.equal(0x9A);
    });

    it('should be able to write into RAM and retrieve the value from the echo', () => {
      addressBus[0xC000].byte = 0x12;
      addressBus[0xCDD2].word = 0x5678;
      addressBus[0xDDFF].byte = 0x9A;

      expect(addressBus[0xE000].byte).to.equal(0x12);
      expect(addressBus[0xEDD2].byte).to.equal(0x78);
      expect(addressBus[0xEDD3].byte).to.equal(0x56);
      expect(addressBus[0xeDD2].word).to.equal(0x5678);
      expect(addressBus[0xFDFF].byte).to.equal(0x9A);
    });

    it('should be able to write into the echo and retrieve the value from the RAM', () => {
      addressBus[0xE000].byte = 0x12;
      addressBus[0xEDD2].word = 0x5678;
      addressBus[0xFDFF].byte = 0x9A;

      expect(addressBus[0xC000].byte).to.equal(0x12);
      expect(addressBus[0xCDD2].byte).to.equal(0x78);
      expect(addressBus[0xCDD3].byte).to.equal(0x56);
      expect(addressBus[0xCDD2].word).to.equal(0x5678);
      expect(addressBus[0xDDFF].byte).to.equal(0x9A);
    });
  });

  describe('Sprite attribute table (OAM)', () => {
    it('should be able to read/write from/into OAM', () => {
      addressBus[0xFE00].byte = 0x12;
      addressBus[0xFE34].word = 0x5678;
      addressBus[0xFE9F].byte = 0x9A;

      expect(addressBus[0xFE00].byte).to.equal(0x12);
      expect(addressBus[0xFE34].byte).to.equal(0x78);
      expect(addressBus[0xFE35].byte).to.equal(0x56);
      expect(addressBus[0xFE34].word).to.equal(0x5678);
      expect(addressBus[0xFE9F].byte).to.equal(0x9A);
    });
  });

  describe('Reserved memory', () => {
    it('should not be able to use addresses from 0xFEA0 to 0xFEFF', () => {
      addressBus[0xFEA0].byte = 0x12;
      addressBus[0xFECD].byte = 0x34;
      addressBus[0xFEFF].byte = 0x56;

      expect(addressBus[0xFEA0].byte).to.equal(0x00);
      expect(addressBus[0xFEA0].word).to.equal(0x00);

      expect(addressBus[0xFECD].byte).to.equal(0x00);
      expect(addressBus[0xFECD].word).to.equal(0x00);

      expect(addressBus[0xFEFF].byte).to.equal(0x00);
      expect(addressBus[0xFEFF].word).to.equal(0x00);
    });
  });

  describe('I/O Registers', () => {
    it('should be able to read/write from/into I/O Registers', () => {
      addressBus[0xFF00].byte = 0x12;
      addressBus[0xFF12].word = 0x5678;
      addressBus[0xFF7F].byte = 0x9A;

      expect(addressBus[0xFF00].byte).to.equal(0x12);
      expect(addressBus[0xFF12].byte).to.equal(0x78);
      expect(addressBus[0xFF13].byte).to.equal(0x56);
      expect(addressBus[0xFF12].word).to.equal(0x5678);
      expect(addressBus[0xFF7F].byte).to.equal(0x9A);
    });
  });

  describe('High RAM', () => {
    it('should be able to read/write from/into HRAM', () => {
      addressBus[0xFF80].byte = 0x12;
      addressBus[0xFFAB].word = 0x5678;
      addressBus[0xFFFE].byte = 0x9A;

      expect(addressBus[0xFF80].byte).to.equal(0x12);
      expect(addressBus[0xFFAB].byte).to.equal(0x78);
      expect(addressBus[0xFFAC].byte).to.equal(0x56);
      expect(addressBus[0xFFAB].word).to.equal(0x5678);
      expect(addressBus[0xFFFE].byte).to.equal(0x9A);
    });
  });

  describe('Interrupts Enable Registers', () => {
    it('should be able to read/write from/into Interrupts Enable Registers', () => {
      addressBus[0xFFFF].byte = 0x12;
      expect(addressBus[0xFFFF].byte).to.equal(0x12);
    });
  });

  describe('Reset', () => {
    it('should empty all segments on reset', () => {
      const cartridge = new GameCartridge(new ArrayBuffer(32 * 1024));
      const cartridgeResetSpy = sinon.spy(cartridge, 'reset');
      addressBus.loadCartridge(cartridge);

      addressBus[0x8000].byte = 0x12;
      addressBus[0xC000].byte = 0x12;
      addressBus[0xFE00].byte = 0x12;
      addressBus[0xFF00].byte = 0x12;
      addressBus[0xFF80].byte = 0x12;
      addressBus[0xFFFF].byte = 0x12;

      addressBus.reset();

      expect(addressBus[0x8000].byte).to.equal(0x00);
      expect(addressBus[0xC000].byte).to.equal(0x00);
      expect(addressBus[0xFE00].byte).to.equal(0x00);
      expect(addressBus[0xFF00].byte).to.equal(0x00);
      expect(addressBus[0xFF80].byte).to.equal(0x00);
      expect(addressBus[0xFFFF].byte).to.equal(0x00);

      expect(cartridgeResetSpy.calledOnce).to.equal(true);
    });
  });

  describe('Errors handling', () => {
    it('should not allow to access invalid addresses', () => {
      expect(() => {
        addressBus[-1]; // tslint:disable-line:no-unused-expression
      }).to.throw('Invalid address');

      expect(() => {
        addressBus[0x10000]; // tslint:disable-line:no-unused-expression
      }).to.throw('Invalid address');
    });

    it('should not allow to directly set a value on an address', () => {
      expect(() => {
        (addressBus[0x00] as any) = 1; // tslint:disable-line:no-unused-expression
      }).to.throw('not allowed');
    });
  });
});
