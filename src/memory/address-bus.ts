import { MemorySegment, IMemorySegment } from './segments/memory-segment';
import { IGameCartridge } from '../cartridge/game-cartridge';
import { STATIC_0000_SEGMENT } from './segments/static-memory-segment';
import { IGameCartridgeInfo } from '../cartridge/game-cartridge-info';
import { Joypad } from '../controls/joypad';
import { DMAHandler } from './dma/dma-handler';
import { Display } from '../display/display';
import { CPUTimer } from '../cpu/cpu-timer';
import { CPUInterrupt } from '../cpu/cpu';
import { Audio, DEFAULT_WAVE_DATA_DMG, DEFAULT_WAVE_DATA_CGB } from '../audio/audio';
import { IOSegment } from './segments/io-segment';

export const VRAM_LENGTH = 8 * 1024;
export const INTERNAL_RAM_LENGTH = 4 * 1024;
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
  private videoRamBanks: MemorySegment[];
  private currentVideoRamBank: number;

  // Internal RAM
  // Real: 0xC000 to 0xDFFF
  // Echo: 0xE000 to 0xFDFF
  private internalRamBanks: MemorySegment[];
  private currentRamBank: number;

  // Sprite attribute table (OAM)
  // 0xFE00 to 0xFE9F
  private oam: MemorySegment;

  // I/O Registers
  // 0xFF00 to 0xFF7F
  private ioRegisters: IMemorySegment;

  // High RAM
  // 0xFF80 to 0xFFFE
  private hram: MemorySegment;

  // Interrupts Enable Registers
  // 0xFFFF
  private ieRegister: MemorySegment;

  // Joypad (used by the I/O Register)
  private joypad: Joypad;

  // Display unit
  private display: Display;

  // CPU internal timer
  private cpuTimer: CPUTimer;

  // Handles DMA transfers.
  // This is not required but if missing an
  // OAM DMA transfer will be completed in a
  // single cycle instead of 161.
  private dmaHandler: DMAHandler;

  // Audio Processing Unit
  private audio: Audio;

  // Emulation mode (DMG, CGB with/without DMG compatibility mode)
  // This is set when a ROM is loaded.
  private emulationMode: EMULATION_MODE;

  // Double speed mode (available in CGB mode only)
  private doubleSpeedModeEnabled: boolean;

  /**
   * Initialize a new empty memory layout.
   */
  public constructor(
    joypad: Joypad,
    dmaHandler: DMAHandler,
    cpuTimer: CPUTimer,
    audio: Audio,
    display: Display,
  ) {
    this.joypad = joypad;
    this.dmaHandler = dmaHandler;
    this.audio = audio;

    this.display = display;
    this.display.setAddressBus(this);

    this.cpuTimer = cpuTimer;
    this.cpuTimer.setAddressBus(this);

    this.emulationMode = EMULATION_MODE.DMG;

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
   * Toggle the double speed status flag.
   */
  public toggleDoubleSpeedMode() {
    this.doubleSpeedModeEnabled = !this.doubleSpeedModeEnabled;
  }

  /**
   * Return the current value of the double
   * speed status flag.
   */
  public isDoubleSpeedModeEnabled() {
    return this.doubleSpeedModeEnabled;
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
    // Only bank #0 is available in DMG mode
    this.videoRamBanks = [
      new MemorySegment(VRAM_LENGTH),
      new MemorySegment(VRAM_LENGTH),
    ];

    this.currentVideoRamBank = 0;

    // Empty RAM (8 * 4kB)
    // Only banks #0 and #1 are available in DMG mode
    this.internalRamBanks = [];
    for (let i = 0; i < 8; i++) {
      this.internalRamBanks.push(new MemorySegment(INTERNAL_RAM_LENGTH));
    }

    this.currentRamBank = 1;

    // Empty OAM (160B)
    this.oam = new MemorySegment(OAM_LENGTH);

    // Double speed mode is not enabled by default
    this.doubleSpeedModeEnabled = false;

    // Empty I/O Registers (128B)
    this.ioRegisters = new IOSegment(
      this,
      this.display,
      this.audio,
      this.joypad,
      this.cpuTimer,
      this.dmaHandler
    );

    // Empty HRAM (127B)
    this.hram = new MemorySegment(HRAM_LENGTH);

    // Empty Interrupts Enable Register (1B)
    this.ieRegister = new MemorySegment(IEREGISTER_LENGTH);

    // Set the interrupt callback on the joypad
    // to catch button presses
    this.joypad.setInterruptCallback(() => {
      this.triggerInterrupt(CPUInterrupt.JOYPAD);
    });
  }

  /**
   * Initialize registers to the state they
   * they are supposed to be in after the power
   * up sequence.
   *
   * This is called by the CPU before the first
   * instruction when no bootstrap ROM is available.
   */
  public initDefaultRegisterValues(): void {
    // Audio registers
    this.ioRegisters.setByte(0x0010, 0x80); // NR10
    this.ioRegisters.setByte(0x0011, 0xBF); // NR11
    this.ioRegisters.setByte(0x0012, 0xF3); // NR12
    this.ioRegisters.setByte(0x0014, 0xBF); // NR14
    this.ioRegisters.setByte(0x0016, 0x3F); // NR21
    this.ioRegisters.setByte(0x0019, 0xBF); // NR24
    this.ioRegisters.setByte(0x001A, 0x7F); // NR30
    this.ioRegisters.setByte(0x001B, 0xFF); // NR31
    this.ioRegisters.setByte(0x001C, 0x9F); // NR32
    this.ioRegisters.setByte(0x001E, 0xBF); // NR33
    this.ioRegisters.setByte(0x0020, 0xFF); // NR41
    this.ioRegisters.setByte(0x0023, 0xBF); // NR30
    this.ioRegisters.setByte(0x0024, 0x77); // NR50
    this.ioRegisters.setByte(0x0025, 0xF3); // NR51
    this.ioRegisters.setByte(0x0026, 0xF1); // NR52

    const waveData = (this.emulationMode === EMULATION_MODE.DMG) ?
      DEFAULT_WAVE_DATA_DMG :
      DEFAULT_WAVE_DATA_CGB;

    for (let i = 0; i < waveData.length; i++) {
      this.ioRegisters.setByte(0x0030 + i, waveData[i]);
    }

    // Display registers
    this.ioRegisters.setByte(0x0040, 0x91); // LCDC
    this.ioRegisters.setByte(0x0047, 0xFC); // BGP
    this.ioRegisters.setByte(0x0048, 0xFF); // OBP0
    this.ioRegisters.setByte(0x0049, 0xFF); // OBP1
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
   * Also sets the emulation mode.
   * Note that this will NOT reset the address bus.
   *
   * @param banks Cartridge ROM banks
   */
  public loadCartridge(gameCartridge: IGameCartridge, preferredMode?: EMULATION_MODE): void {
    this.gameCartridge = gameCartridge;

    if (gameCartridge.cartridgeInfo.cgbFlag === 0xC0) {
      this.emulationMode = EMULATION_MODE.CGB;
    } else if (gameCartridge.cartridgeInfo.cgbFlag === 0x80) {
      this.emulationMode = preferredMode ? preferredMode : EMULATION_MODE.CGB;
    } else {
      this.emulationMode = EMULATION_MODE.DMG;
    }
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
   * Disable the boot ROM.
   * It must be called when something is written
   * to the 0xFF50 address.
   */
  public disableBootRom(): void {
    this.bootRomEnabled = false;
  }

  /**
   * Return the memory segments associated to the
   * video RAM. It avoids doing many calls to
   * getByte/getWord and unecessary lookups during
   * video rendering.
   */
  public getVideoRamBanks(): MemorySegment[] {
    return this.videoRamBanks;
  }

  /**
   * Set the current index for the VRAM bank.
   *
   * @param index New index
   */
  public setCurrentVideoRamBank(index: number) {
    this.currentVideoRamBank = index & 1;
  }

  /**
   * Set the current index for the switchable RAM bank.
   * Index #0 is always replaced by #1.
   *
   * @param index New index
   */
  public setCurrentRamBank(index: number) {
    this.currentRamBank = (index & 0b111) || 1;
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
   * Return the current emulation mode.
   */
  public getEmulationMode(): EMULATION_MODE {
    return this.emulationMode;
  }

  /**
   * Set the bit matching the given interrupt in
   * the IF register to 1.
   *
   * @param interrupt
   */
  public triggerInterrupt(interrupt: CPUInterrupt): void {
    this.ioRegisters.setByte(0x000F, this.ioRegisters.getByte(0x000F) | (1 << interrupt));
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
        segment: this.videoRamBanks[this.currentVideoRamBank],
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

    // Internal RAM (bank #0)
    if (address < 0xD000) {
      return {
        segment: this.internalRamBanks[0],
        offset: 0xC000
      };
    }

    // Internal RAM (bank #1 to #7)
    if (address < 0xE000) {
      return {
        segment: this.internalRamBanks[this.currentRamBank],
        offset: 0xD000
      };
    }

    // Internal RAM (mirror of bank #0)
    if (address < 0xF000) {
      return {
        segment: this.internalRamBanks[0],
        offset: 0xE000
      };
    }

    // Internal RAM (mirror of banks #1 to #7)
    if (address < 0xFE00) {
      return {
        segment: this.internalRamBanks[this.currentRamBank],
        offset: 0xF000
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

export enum EMULATION_MODE {
  DMG,
  CGB,
}
