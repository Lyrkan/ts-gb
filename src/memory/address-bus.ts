import { MemorySegment } from './memory-segment';
import { MemoryAccessor } from './memory-accessor';

export const CARTRIDGE_ROM_BANK_LENGTH = 16 * 1024;
export const VRAM_LENGTH = 8 * 1024;
export const CARTRIDGE_RAM_BANK_LENGTH = 8 * 1024;
export const INTERNAL_RAM_LENGTH = 8 * 1024;
export const OAM_LENGTH = 160;
export const IOREGISTERS_LENGTH = 128;
export const HRAM_LENGTH = 127;
export const IEREGISTER_LENGTH = 1;

/**
 * Usage:
 *
 *   const addressBus = new AddressBus();
 *
 *   // Write values
 *   addressBus[0xC000].byte = 0x12;
 *   addressBus[0xC001].word = 0x3456;
 *
 *   // Read values
 *   const bC000 = addressBus[0xC000].byte;
 *   const wC001 = addressBus[0xC001].word;
 */
export class AddressBus {
  [index: number]: MemoryAccessor;

  // Cartridge ROM
  // First bank: 0x0000 to 0x3FFF
  // Switchable bank: 0x4000 to 0x7FFF
  private cartridgeRomBanks: MemorySegment[];
  private currentCartridgeRomBank: number;

  // Video RAM
  // 0x8000 to 0x9FFF
  private videoRam: MemorySegment;

  // Switchable cartridge RAM bank
  // 0xA000 to 0xBFFF
  private cartridgeRamBanks: MemorySegment[];
  private currentCartridgeRamBank: number;

  // Internal RAM
  // Real: 0xC000 to 0xDFFF
  // Echo: 0xE000 to 0xFDFF
  private internalRam: MemorySegment;

  // Sprite attribute table (OAM)
  // 0xFE00 to 0xFE9F
  private oam: MemorySegment;

  // I/O Registers
  // 0xFF00 to 0xFF7F
  private ioRegisters: MemorySegment;

  // High RAM
  // 0xFF80 to 0xFFFE
  private hram: MemorySegment;

  // Interrupts Enable Registers
  // 0xFFFF
  private ieRegister: MemorySegment;

  /**
   * Initialize a new empty memory layout.
   */
  public constructor() {
      this.reset();

      return new Proxy(this, {
        get: (obj, prop: any) => {
          if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
            const address = parseInt(prop, 10);
            const { segment, offset } = this.getSegment(address);
            return segment[address - offset];
          }

          return obj[prop];
        },

        set: (obj, prop: any, value: any) => {
          if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
            throw new Error('[[Set]] method is not allowed for AddressBus elements');
          }

          obj[prop] = value;
          return true;
        }
      });
  }

  /**
   * Empty the whole memory.
   */
  public reset(): void {
    // Empty cartridge ROM (16kB)
    this.cartridgeRomBanks = [new MemorySegment({
      byteLength: CARTRIDGE_ROM_BANK_LENGTH,
      writable: false,
    })];
    this.currentCartridgeRomBank = 0;

    // Empty video RAM (8kB)
    this.videoRam = new MemorySegment({
      byteLength: VRAM_LENGTH,
    });

    // Empty cartridge RAM (8kB)
    this.cartridgeRamBanks = [new MemorySegment({
      byteLength: CARTRIDGE_RAM_BANK_LENGTH,
    })];
    this.currentCartridgeRamBank = 0;

    // Empty RAM (8kB)
    this.internalRam = new MemorySegment({
      byteLength: INTERNAL_RAM_LENGTH,
    });

    // Empty OAM (160B)
    this.oam = new MemorySegment({
      byteLength: OAM_LENGTH,
    });

    // Empty I/O Registers (128B)
    this.ioRegisters = new MemorySegment({
      byteLength: IOREGISTERS_LENGTH,
    });

    // Empty HRAM (127B)
    this.hram = new MemorySegment({
      byteLength: HRAM_LENGTH,
    });

    // Empty Interrupts Enable Register (1B)
    this.ieRegister = new MemorySegment({
      byteLength: IEREGISTER_LENGTH,
    });
  }

  /**
   * Load the given cartridge ROM banks into memory.
   *
   * @param banks Cartridge ROM banks
   */
  public loadCartridgeRom(banks: ArrayBuffer[]) {
    for (const bank of banks) {
      if (bank.byteLength !== CARTRIDGE_ROM_BANK_LENGTH) {
        throw new Error(`Invalid cartridge ROM bank length: ${bank.byteLength}`);
      }
    }

    this.cartridgeRomBanks = [];
    this.currentCartridgeRomBank = 0;

    for (const bank of banks) {
      const segment = new MemorySegment({
        byteLength: CARTRIDGE_ROM_BANK_LENGTH,
        writable: false,
      });

      segment.loadData(bank);

      this.cartridgeRomBanks.push(segment);
    }
  }

  /**
   * Load the given cartridge RAM banks into memory.
   *
   * @param banks Cartridge RAM banks
   */
  public loadCartridgeRam(banks: ArrayBuffer[]) {
    for (const bank of banks) {
      if (bank.byteLength !== CARTRIDGE_RAM_BANK_LENGTH) {
        throw new Error(`Invalid cartridge RAM bank length`);
      }
    }

    this.cartridgeRamBanks = [];
    this.currentCartridgeRamBank = 0;

    for (const bank of banks) {
      const segment = new MemorySegment({
        byteLength: CARTRIDGE_RAM_BANK_LENGTH,
      });

      segment.loadData(bank);

      this.cartridgeRamBanks.push(segment);
    }
  }

  /**
   * Switch current cartridge ROM bank.
   *
   * @param bank New bank index
   */
  public switchCartridgeRomBank(bank: number): void {
    if (bank < 0 || bank >= this.cartridgeRomBanks.length) {
      throw new RangeError(`Invalid cartridge ROM bank: ${bank}`);
    }

    this.currentCartridgeRomBank = bank;
  }

  /**
   * Switch current cartridge RAM bank.
   *
   * @param bank New bank index
   */
  public switchCartridgeRamBank(bank: number): void {
    if (bank < 0 || bank >= this.cartridgeRamBanks.length) {
      throw new RangeError(`Invalid cartridge RAM bank: ${bank}`);
    }

    this.currentCartridgeRamBank = bank;
  }

  /**
   * Retrieve the segment and relative offset for
   * the given address.
   *
   * @param address Memory address
   */
  private getSegment(address: number): {segment: MemorySegment, offset: number} {
    if (address < 0) {
      throw new RangeError(
        `Invalid address ${address}: Memory addresses must be superior or equal to 0x0000`
      );
    }

    // ROM bank #0
    if (address < 0x4000) {
      return {
        segment: this.cartridgeRomBanks[0],
        offset: 0
      };
    }

    // Switchable ROM bank
    if (address < 0x8000) {
      return {
        segment: this.cartridgeRomBanks[this.currentCartridgeRomBank],
        offset: 0x4000
      };
    }

    // Video RAM
    if (address < 0xA000) {
      return {
        segment: this.videoRam,
        offset: 0x8000
      };
    }

    // Switchable RAM bank
    if (address < 0xC000) {
      return {
        segment: this.cartridgeRamBanks[this.currentCartridgeRamBank],
        offset: 0xA000
      };
    }

    // Internal RAM
    if (address < 0xE000) {
      return {
        segment: this.internalRam,
        offset: 0xC000
      };
    }

    // Internal RAM (mirror)
    if (address < 0xFE00) {
      return {
        segment: this.internalRam,
        offset: 0xE000
      };
    }

    // OAM
    if (address < 0xFEA0) {
      return {
        segment: this.oam,
        offset: 0xFE00
      };
    }

    // Unuseable range
    if (address < 0xFF00) {
      throw new RangeError(
        `Invalid address ${address}: Memory addresses from 0xFEA0 to 0xFEFF are not usable`
      );
    }

    // I/O Registers
    if (address < 0xFF80) {
      return {
        segment: this.ioRegisters,
        offset: 0xFF00
      };
    }

    // HRAM
    if (address < 0xFFFF) {
      return {
        segment: this.hram,
        offset: 0xFF80
      };
    }

    // IE Register
    if (address < 0x10000) {
      return {
        segment: this.ieRegister,
        offset: 0xFFFF
      };
    }

    throw new RangeError(`Invalid address ${address}: Memory addresses must not exceed 0xFFFF`);
  }
}
