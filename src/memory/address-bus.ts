import { MemorySegment, IMemorySegment } from './memory-segment';
import { IGameCartridge } from '../cartridge/game-cartridge';
import { STATIC_0000_SEGMENT } from './static-memory-segment';
import { MemorySegmentDecorator } from './memory-segment-decorator';
import { IGameCartridgeInfo } from '../cartridge/game-cartridge-info';
import { Joypad, BUTTON } from '../controls/joypad';

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
 *   addressBus.setByte(0xC000, 0x12);
 *   addressBus.setWord(0xC001, 0x3456);
 *
 *   // Read values
 *   const bC000 = addressBus.getByte(0xC000);
 *   const wC001 = addressBus.getWord(0xC001);
 */
export class AddressBus {
  // Segment that contains the boot ROM
  // It can be accessed from 0x0000 to 0x00FE
  // when the enableBootRom flag is set to true.
  private bootRom?: MemorySegment;
  private bootRomEnabled: boolean;

  // Game cartridge
  // First ROM bank: 0x0000 to 0x3FFF
  // Switchable ROM bank: 0x4000 to 0x7FFF
  // Switchable RAM bank: 0xA000 to 0xBFFF
  private gameCartridge: IGameCartridge;

  // Video RAM
  // 0x8000 to 0x9FFF
  private videoRam: MemorySegment;

  // Internal RAM
  // Real: 0xC000 to 0xDFFF
  // Echo: 0xE000 to 0xFDFF
  private internalRam: MemorySegment;

  // Sprite attribute table (OAM)
  // 0xFE00 to 0xFE9F
  private oam: MemorySegment;

  // I/O Registers
  // 0xFF00 to 0xFF7F
  private ioRegisters: MemorySegmentDecorator;

  // High RAM
  // 0xFF80 to 0xFFFE
  private hram: MemorySegment;

  // Interrupts Enable Registers
  // 0xFFFF
  private ieRegister: MemorySegment;

  // Joypad (used by the I/O Register)
  private joypad: Joypad;

  /**
   * Initialize a new empty memory layout.
   */
  public constructor(joypad: Joypad) {
    this.joypad = joypad;
    this.reset();
  }

  /**
   * Get the byte stored at the given address
   *
   * @param address Address
   */
  public getByte(address: number): number {
    const { segment, offset } = this.getSegment(address);
    return segment.getByte(address - offset);
  }

  /**
   * Set the value of the byte stored at the given address
   *
   * @param address Address
   */
  public setByte(address: number, value: number): void {
    const { segment, offset } = this.getSegment(address);
    segment.setByte(address - offset, value);
  }

  /**
   * Get the word stored at the given address
   *
   * @param address Address
   */
  public getWord(address: number): number {
    const { segment, offset } = this.getSegment(address);
    return segment.getWord(address - offset);
  }

  /**
   * Set the value of the word stored at the given address
   *
   * @param address Address
   */
  public setWord(address: number, value: number): void {
    const { segment, offset } = this.getSegment(address);
    segment.setWord(address - offset, value);
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
    let joypadMode = JOYPAD_MODE.DIRECTIONS;
    this.ioRegisters = new MemorySegmentDecorator(new MemorySegment(IOREGISTERS_LENGTH), {
      getByte: (decorated, offset) => {
        if (offset === 0x0000) {
          let value = 0xFF;

          if (joypadMode === JOYPAD_MODE.BUTTONS) {
            value &= ~0x10;
            value &= this.joypad.isPressed(BUTTON.START) ? ~0x08 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.SELECT) ? ~0x04 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.B) ? ~0x02 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.A) ? ~0x01 : 0xFF;
          } else {
            value &= ~0x20;
            value &= this.joypad.isPressed(BUTTON.DOWN) ? ~0x08 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.UP) ? ~0x04 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.LEFT) ? ~0x02 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.RIGHT) ? ~0x01 : 0xFF;
          }

          return value;
        }

        return decorated.getByte(offset);
      },
      setByte: (decorated, offset, value) => {
        // Joypad update
        // Mostly used to switch between directions and buttons modes.
        if (offset === 0x0000) {
          if ((value & 0x10) === 0) {
            joypadMode = JOYPAD_MODE.DIRECTIONS;
          } else if ((value & 0x20) === 0) {
            joypadMode = JOYPAD_MODE.BUTTONS;
          }
        }

        // LY update.
        // When that happens it should also change the value of LYC
        // and eventually trigger an interrupt.
        if (offset === 0x0044) {
          const lcdsRegister = decorated.getByte(0x0041);
          const ly = decorated.getByte(0x0044);
          const lyc =  decorated.getByte(0x0045);

          if (ly === lyc) {
            decorated.setByte(0x0041, lcdsRegister | (1 << 2));

            // Check if we should trigger the LCDC Status Interrupt
            if ((lcdsRegister & 0x40) > 0) {
              this.setByte(0xFF0F, this.getByte(0xFF0F) | 2);
            }
          } else {
            decorated.setByte(0x0041, lcdsRegister & ~(1 << 2));
          }
        }

        // OAM DMA Transfer triggered by a write on 0x0046 (=0xFF46)
        // Note that this is really inaccurate since it should
        // normally take 160 * 4 + 4 cycles to complete.
        if (offset === 0x0046) {
          const fromAddress = (value & 0xFF) << 8;
          for (let i = 0; i < OAM_LENGTH; i++) {
            this.setByte(0xFE00 + i, this.getByte(fromAddress + i));
          }
        }

        // Writes on 0x0050 (=0xFF50) disable the boot rom
        if (offset === 0x0050) {
          this.bootRomEnabled = false;
        }

        // Still update the value stored in memory
        decorated.setByte(offset, value);
      }
    });

    // Empty HRAM (127B)
    this.hram = new MemorySegment(HRAM_LENGTH);

    // Empty Interrupts Enable Register (1B)
    this.ieRegister = new MemorySegment(IEREGISTER_LENGTH);

    // Set the interrupt callback on the joypad
    // to catch button presses
    this.joypad.setInterruptCallback(() => {
      this.ioRegisters.setByte(0x000F, this.ioRegisters.getByte(0x000F) | 0x10);
    });
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
      this.bootRom.setByte(i, bootRomView.getUint8(i));
    }
  }

  /**
   * Load the given cartridge ROM banks into memory.
   * Note that this will NOT reset the address bus.
   *
   * @param banks Cartridge ROM banks
   */
  public loadCartridge(gameCartridge: IGameCartridge): void {
    this.gameCartridge = gameCartridge;
  }

  /**
   * Return some info about the currently loaded cartridge.
   */
  public getCartridgeInfo(): IGameCartridgeInfo {
    if (!this.gameCartridge) {
      throw new Error('Game cartridge is not available');
    }

    return this.gameCartridge.cartridgeInfo;
  }

  /**
   * Check if there is a boot ROM associated
   * to the address bus.
   */
  public hasBootRom(): boolean {
    return Boolean(this.bootRom);
  }

  /**
   * Return the memory segment associated to the
   * video RAM. It avoids doing many calls to
   * getByte/getWord and unecessary lookups during
   * video rendering.
   */
  public getVideoRamSegment(): MemorySegment {
    return this.videoRam;
  }

  /**
   * Return the memory segment associated to the
   * OAM. It avoids doing many calls to getByte/getWord
   * and unecessary lookups during video rendering.
   */
  public getOamSegment(): MemorySegment {
    return this.oam;
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

enum JOYPAD_MODE {
  DIRECTIONS,
  BUTTONS
}
