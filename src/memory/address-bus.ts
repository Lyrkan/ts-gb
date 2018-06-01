import { MemorySegment, IMemorySegment } from './memory-segment';
import { IMemoryAccessor } from './memory-accessor';
import { GameCartridge } from '../cartridge/game-cartridge';
import { STATIC_0000_SEGMENT } from './static-memory-segment';
import { MemorySegmentDecorator } from './memory-segment-decorator';
import { MemoryAccessorDecorator } from './memory-accessor-decorator';

export const VRAM_LENGTH = 8 * 1024;
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
  // Segment that contains the boot ROM
  // It can be accessed from 0x0000 to 0x00FE
  // when the enableBootRom flag is set to true.
  private bootRom?: IMemorySegment;
  private bootRomEnabled: boolean;

  // Game cartridge
  // First ROM bank: 0x0000 to 0x3FFF
  // Switchable ROM bank: 0x4000 to 0x7FFF
  // Switchable RAM bank: 0xA000 to 0xBFFF
  private gameCartridge: GameCartridge;

  // Video RAM
  // 0x8000 to 0x9FFF
  private videoRam: IMemorySegment;

  // Internal RAM
  // Real: 0xC000 to 0xDFFF
  // Echo: 0xE000 to 0xFDFF
  private internalRam: IMemorySegment;

  // Sprite attribute table (OAM)
  // 0xFE00 to 0xFE9F
  private oam: IMemorySegment;

  // I/O Registers
  // 0xFF00 to 0xFF7F
  private ioRegisters: IMemorySegment;

  // High RAM
  // 0xFF80 to 0xFFFE
  private hram: IMemorySegment;

  // Interrupts Enable Registers
  // 0xFFFF
  private ieRegister: IMemorySegment;

  /**
   * Initialize a new empty memory layout.
   */
  public constructor() {
    this.reset();
  }

  public get(address: number): IMemoryAccessor {
    const { segment, offset } = this.getSegment(address);
    return segment.get(address - offset);
  }

  /**
   * Empty the whole memory.
   */
  public reset(): void {
    // If we have a boot ROM use it, otherwise
    // boot the system directly.
    if (this.bootRom) {
      this.bootRomEnabled = true;
    }

    // Empty cartridge RAM if there is one
    if (this.gameCartridge) {
      this.gameCartridge.reset();
    }

    // Empty video RAM (8kB)
    this.videoRam = new MemorySegment(VRAM_LENGTH);

    // Empty RAM (8kB)
    this.internalRam = new MemorySegment(INTERNAL_RAM_LENGTH);

    // Empty OAM (160B)
    this.oam = new MemorySegment(OAM_LENGTH);

    // Empty I/O Registers (128B)
    this.ioRegisters = new MemorySegmentDecorator(
      new MemorySegment(IOREGISTERS_LENGTH),
      (obj, offset)  => {
        // OAM DMA Transfer triggered by a write on 0x0046 (=0xFF46)
        // Note that this is really inaccurate since it should
        // normally take 160 * 4 + 4 cycles to complete.
        if (offset === 0x0046) {
          const copyData = (value: number) => {
            const fromAddress = (value & 0b11) << 2;
            for (let i = 0; i < OAM_LENGTH; i++) {
              this.get(0xFE00 + i).byte = this.get(fromAddress + i).byte;
            }
          };

          const setByte = (decorated: IMemoryAccessor, value: number) => {
            copyData(value);
            decorated.byte = value;
          };

          const setWord = (decorated: IMemoryAccessor, value: number) => {
            copyData(value);
            decorated.word = value;
          };

          return new MemoryAccessorDecorator(obj.get(0x0046), { setByte, setWord });
        }

        // Writes on 0x0050 (=0xFF50) disable the boot rom
        if (offset === 0x0050) {
          const setByte = (decorated: IMemoryAccessor, value: number) => {
            this.bootRomEnabled = false;
            decorated.byte = value;
          };

          const setWord = (decorated: IMemoryAccessor, value: number) => {
            this.bootRomEnabled = false;
            decorated.word = value;
          };

          return new MemoryAccessorDecorator(obj.get(0x0050), { setByte, setWord });
        }

        return null;
      }
    );

    // Empty HRAM (127B)
    this.hram = new MemorySegment(HRAM_LENGTH);

    // Empty Interrupts Enable Register (1B)
    this.ieRegister = new MemorySegment(IEREGISTER_LENGTH);
  }

  /**
   * Load boostrap ROM.
   * Note that this will NOT reset the address bus.
   *
   * @param bootRom Boot ROM content
   */
  public loadBootRom(bootRom: ArrayBuffer): void {
    // If a boot rom has been passed, create
    // the memory segment that will hold it
    this.bootRom = new MemorySegment(bootRom.byteLength);
    const bootRomView = new DataView(bootRom);
    for (let i = 0; i < bootRom.byteLength; i++) {
      this.bootRom.get(i).byte = bootRomView.getUint8(i);
    }
  }

  /**
   * Load the given cartridge ROM banks into memory.
   * Note that this will NOT reset the address bus.
   *
   * @param banks Cartridge ROM banks
   */
  public loadCartridge(gameCartridge: GameCartridge): void {
    this.gameCartridge = gameCartridge;
  }

  /**
   * Check if there is a boot ROM associated
   * to the address bus.
   */
  public hasBootRom(): boolean {
    return Boolean(this.bootRom);
  }

  /**
   * Retrieve the segment and relative offset for
   * the given address.
   *
   * @param address Memory address
   */
  private getSegment(address: number): {segment: IMemorySegment, offset: number} {
    if (address < 0) {
      throw new RangeError(
        // tslint:disable-next-line:max-line-length
        `Invalid address 0x${address.toString(16).toUpperCase()}: Memory addresses must be superior or equal to 0x0000`
      );
    }

    // ROM bank #0
    if (address < 0x4000) {
      if (!this.gameCartridge) {
        throw new Error('Game cartridge is not available');
      }

      // If the system boot sequence isn't over yet
      // return the boot ROM segment from 0x0000 to 0x00EF.
      if (this.bootRom && this.bootRomEnabled && address < 0x0100) {
        return {
          segment: this.bootRom,
          offset: 0
        };
      }

      return {
        segment: this.gameCartridge.staticRomBank,
        offset: 0
      };
    }

    // Switchable ROM bank
    if (address < 0x8000) {
      if (!this.gameCartridge) {
        throw new Error('Game cartridge is not available');
      }

      return {
        segment: this.gameCartridge.switchableRomBank,
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
      if (!this.gameCartridge) {
        throw new Error('Game cartridge is not available');
      }

      return {
        segment: this.gameCartridge.ramBank,
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
      return {
        segment: STATIC_0000_SEGMENT,
        offset: 0xFEA0
      };
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

    throw new RangeError(
      // tslint:disable-next-line:max-line-length
      `Invalid address 0x${address.toString(16).toUpperCase()}: Memory addresses must not exceed 0xFFFF`
    );
  }
}
