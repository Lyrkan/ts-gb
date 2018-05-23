import 'mocha';
import { expect } from 'chai';
import {
  AddressBus,
  CARTRIDGE_RAM_BANK_LENGTH,
  CARTRIDGE_ROM_BANK_LENGTH
} from '../../src/memory/address-bus';

describe('AddressBus', () => {
  let addressBus: AddressBus;

  beforeEach(() => {
    addressBus = new AddressBus();
  });

  describe('Cartridge ROM', () => {
    it('should be able to load and switch between cartridge ROM banks', () => {
      const bank1Data = new ArrayBuffer(CARTRIDGE_ROM_BANK_LENGTH);
      const bank1View = new DataView(bank1Data);

      const bank2Data = new ArrayBuffer(CARTRIDGE_ROM_BANK_LENGTH);
      const bank2View = new DataView(bank2Data);

      // Initial data
      bank1View.setUint8(0, 0x12);
      bank1View.setUint8(CARTRIDGE_ROM_BANK_LENGTH - 1, 0x34);
      bank2View.setUint8(0, 0x56);
      bank2View.setUint8(CARTRIDGE_ROM_BANK_LENGTH - 1, 0x78);

      // Load banks
      addressBus.loadCartridgeRom([bank1Data, bank2Data]);

      // Bank #0
      expect(addressBus[0x0000].byte).to.equal(0x12);
      expect(addressBus[0x3FFF].byte).to.equal(0x34);

      // Switchable bank (= bank #0)
      expect(addressBus[0x4000].byte).to.equal(0x12);
      expect(addressBus[0x7FFF].byte).to.equal(0x34);

      // Switch to bank #1
      addressBus.switchCartridgeRomBank(1);

      // Bank #0 should be unchanged
      expect(addressBus[0x0000].byte).to.equal(0x12);
      expect(addressBus[0x3FFF].byte).to.equal(0x34);

      // Switchable bank (= bank #1)
      expect(addressBus[0x4000].byte).to.equal(0x56);
      expect(addressBus[0x7FFF].byte).to.equal(0x78);

      // Switch back to bank #0
      addressBus.switchCartridgeRomBank(0);

      // Bank #0
      expect(addressBus[0x0000].byte).to.equal(0x12);
      expect(addressBus[0x3FFF].byte).to.equal(0x34);

      // Switchable bank (= bank #0)
      expect(addressBus[0x4000].byte).to.equal(0x12);
      expect(addressBus[0x7FFF].byte).to.equal(0x34);
    });
  });

  describe('Video RAM', () => {
    it('should be able to read/write from/into Video RAM', () => {
      addressBus[0x8000].byte = 0x12;
      addressBus[0x8ABC].word = 0x5678;
      addressBus[0x9FFF].byte = 0x9A;

      expect(addressBus[0x8000].byte).to.equal(0x12);
      expect(addressBus[0x8ABC].byte).to.equal(0x56);
      expect(addressBus[0x8ABD].byte).to.equal(0x78);
      expect(addressBus[0x8ABC].word).to.equal(0x5678);
      expect(addressBus[0x9FFF].byte).to.equal(0x9A);
    });
  });

  describe('Switchable cartridge RAM bank', () => {
    it('should be able to read/write from/into current cartridge RAM bank', () => {
      addressBus[0xA000].byte = 0x12;
      addressBus[0xB000].word = 0x5678;
      addressBus[0xBFFF].byte = 0x9A;

      expect(addressBus[0xA000].byte).to.equal(0x12);
      expect(addressBus[0xB000].byte).to.equal(0x56);
      expect(addressBus[0xB001].byte).to.equal(0x78);
      expect(addressBus[0xB000].word).to.equal(0x5678);
      expect(addressBus[0xBFFF].byte).to.equal(0x9A);
    });

    it('should be able to load and switch between cartridge RAM banks', () => {
      const bank1Data = new ArrayBuffer(CARTRIDGE_RAM_BANK_LENGTH);
      const bank1View = new DataView(bank1Data);

      const bank2Data = new ArrayBuffer(CARTRIDGE_RAM_BANK_LENGTH);
      const bank2View = new DataView(bank2Data);

      // Initial data
      bank1View.setUint8(0, 0x12);
      bank1View.setUint8(CARTRIDGE_RAM_BANK_LENGTH - 1, 0x34);
      bank2View.setUint8(0, 0x56);
      bank2View.setUint8(CARTRIDGE_RAM_BANK_LENGTH - 1, 0x78);

      // Load banks
      addressBus.loadCartridgeRam([bank1Data, bank2Data]);

      // Read/write from bank #0
      expect(addressBus[0xA000].byte).to.equal(0x12);
      expect(addressBus[0xBFFF].byte).to.equal(0x34);

      addressBus[0xA000].byte = 0x9A;
      addressBus[0xBFFF].byte = 0xBC;

      expect(addressBus[0xA000].byte).to.equal(0x9A);
      expect(addressBus[0xBFFF].byte).to.equal(0xBC);

      // Switch to bank #1
      addressBus.switchCartridgeRamBank(1);

      // Read/write from bank #1
      expect(addressBus[0xA000].byte).to.equal(0x56);
      expect(addressBus[0xBFFF].byte).to.equal(0x78);

      addressBus[0xA000].byte = 0xDE;
      addressBus[0xBFFF].byte = 0xFF;

      expect(addressBus[0xA000].byte).to.equal(0xDE);
      expect(addressBus[0xBFFF].byte).to.equal(0xFF);

      // Switch back to bank #0
      addressBus.switchCartridgeRamBank(0);

      // Check if data is still the same
      expect(addressBus[0xA000].byte).to.equal(0x9A);
      expect(addressBus[0xBFFF].byte).to.equal(0xBC);
    });
  });

  describe('Internal RAM', () => {
    it('should be able to read/write from/into internal RAM', () => {
      addressBus[0xC000].byte = 0x12;
      addressBus[0xCDD2].word = 0x5678;
      addressBus[0xDFFF].byte = 0x9A;

      expect(addressBus[0xC000].byte).to.equal(0x12);
      expect(addressBus[0xCDD2].byte).to.equal(0x56);
      expect(addressBus[0xCDD3].byte).to.equal(0x78);
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
      expect(addressBus[0xEDD2].byte).to.equal(0x56);
      expect(addressBus[0xEDD3].byte).to.equal(0x78);
      expect(addressBus[0xeDD2].word).to.equal(0x5678);
      expect(addressBus[0xFDFF].byte).to.equal(0x9A);
    });

    it('should be able to write into RAM and retrieve the value from the echo', () => {
      addressBus[0xC000].byte = 0x12;
      addressBus[0xCDD2].word = 0x5678;
      addressBus[0xDDFF].byte = 0x9A;

      expect(addressBus[0xE000].byte).to.equal(0x12);
      expect(addressBus[0xEDD2].byte).to.equal(0x56);
      expect(addressBus[0xEDD3].byte).to.equal(0x78);
      expect(addressBus[0xeDD2].word).to.equal(0x5678);
      expect(addressBus[0xFDFF].byte).to.equal(0x9A);
    });

    it('should be able to write into the echo and retrieve the value from the RAM', () => {
      addressBus[0xE000].byte = 0x12;
      addressBus[0xEDD2].word = 0x5678;
      addressBus[0xFDFF].byte = 0x9A;

      expect(addressBus[0xC000].byte).to.equal(0x12);
      expect(addressBus[0xCDD2].byte).to.equal(0x56);
      expect(addressBus[0xCDD3].byte).to.equal(0x78);
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
      expect(addressBus[0xFE34].byte).to.equal(0x56);
      expect(addressBus[0xFE35].byte).to.equal(0x78);
      expect(addressBus[0xFE34].word).to.equal(0x5678);
      expect(addressBus[0xFE9F].byte).to.equal(0x9A);
    });
  });

  describe('Reserved memory', () => {
    it('should not be able to use addresses from 0xFEA0 to 0xFEFF', () => {
      expect(() => {
        addressBus[0xFEA0]; // tslint:disable-line:no-unused-expression
      }).to.throw('not usable');

      expect(() => {
        addressBus[0xFECD]; // tslint:disable-line:no-unused-expression
      }).to.throw('not usable');

      expect(() => {
        addressBus[0xFEFF]; // tslint:disable-line:no-unused-expression
      }).to.throw('not usable');
    });
  });

  describe('I/O Registers', () => {
    it('should be able to read/write from/into I/O Registers', () => {
      addressBus[0xFF00].byte = 0x12;
      addressBus[0xFF12].word = 0x5678;
      addressBus[0xFF7F].byte = 0x9A;

      expect(addressBus[0xFF00].byte).to.equal(0x12);
      expect(addressBus[0xFF12].byte).to.equal(0x56);
      expect(addressBus[0xFF13].byte).to.equal(0x78);
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
      expect(addressBus[0xFFAB].byte).to.equal(0x56);
      expect(addressBus[0xFFAC].byte).to.equal(0x78);
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
      const romBankData = new ArrayBuffer(CARTRIDGE_ROM_BANK_LENGTH);
      const romBankView = new DataView(romBankData);
      romBankView.setUint8(0, 0x12);
      addressBus.loadCartridgeRom([romBankData]);

      addressBus[0x8000].byte = 0x12;
      addressBus[0xA000].byte = 0x12;
      addressBus[0xC000].byte = 0x12;
      addressBus[0xFE00].byte = 0x12;
      addressBus[0xFF00].byte = 0x12;
      addressBus[0xFF80].byte = 0x12;
      addressBus[0xFFFF].byte = 0x12;

      addressBus.reset();

      expect(addressBus[0x0000].byte).to.equal(0x00);
      expect(addressBus[0x8000].byte).to.equal(0x00);
      expect(addressBus[0xA000].byte).to.equal(0x00);
      expect(addressBus[0xC000].byte).to.equal(0x00);
      expect(addressBus[0xFE00].byte).to.equal(0x00);
      expect(addressBus[0xFF00].byte).to.equal(0x00);
      expect(addressBus[0xFF80].byte).to.equal(0x00);
      expect(addressBus[0xFFFF].byte).to.equal(0x00);
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

    it('should not allow to load invalid cartridge ROM banks', () => {
      expect(() => {
        addressBus.loadCartridgeRom([new ArrayBuffer(CARTRIDGE_ROM_BANK_LENGTH - 1)]);
      }).to.throw('Invalid cartridge ROM bank length');

      expect(() => {
        addressBus.loadCartridgeRom([new ArrayBuffer(CARTRIDGE_ROM_BANK_LENGTH + 1)]);
      }).to.throw('Invalid cartridge ROM bank length');
    });

    it('should not allow to load invalid cartridge RAM banks', () => {
      expect(() => {
        addressBus.loadCartridgeRam([new ArrayBuffer(CARTRIDGE_RAM_BANK_LENGTH - 1)]);
      }).to.throw('Invalid cartridge RAM bank length');

      expect(() => {
        addressBus.loadCartridgeRam([new ArrayBuffer(CARTRIDGE_RAM_BANK_LENGTH + 1)]);
      }).to.throw('Invalid cartridge RAM bank length');
    });

    it('should not allow to switch to an invalid cartridge ROM bank', () => {
      expect(() => {
        addressBus.switchCartridgeRomBank(1);
      }).to.throw('Invalid cartridge ROM bank');
    });

    it('should not allow to switch to an invalid cartridge RAM bank', () => {
      expect(() => {
        addressBus.switchCartridgeRamBank(1);
      }).to.throw('Invalid cartridge RAM bank');
    });

    it('should not allow to write into cartridge ROM', () => {
      // Default ROM bank
      expect(() => { addressBus[0x0000].byte = 1; }).to.throw('not writable');
      expect(() => { addressBus[0x4000].byte = 1; }).to.throw('not writable');

      // Loaded ROM banks
      addressBus.loadCartridgeRom([
        new ArrayBuffer(CARTRIDGE_ROM_BANK_LENGTH),
        new ArrayBuffer(CARTRIDGE_ROM_BANK_LENGTH)
      ]);

      expect(() => { addressBus[0x0000].byte = 1; }).to.throw('not writable');
      expect(() => { addressBus[0x4000].byte = 1; }).to.throw('not writable');

      addressBus.switchCartridgeRomBank(1);
      expect(() => { addressBus[0x4000].byte = 1; }).to.throw('not writable');
    });
  });
});
