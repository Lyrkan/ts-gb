import { MemorySegment, IMemorySegment } from './segments/memory-segment';
import { IGameCartridge } from '../cartridge/game-cartridge';
import { STATIC_0000_SEGMENT } from './segments/static-memory-segment';
import { MemorySegmentDecorator } from './segments/memory-segment-decorator';
import { IGameCartridgeInfo } from '../cartridge/game-cartridge-info';
import { Joypad, BUTTON } from '../controls/joypad';
import { DMAHandler } from './dma/dma-handler';
import { HDMA_TRANSFER_MODE } from './dma/hdma-transfer';
import { Display } from '../display/display';
import { TILE_MAP, TILE_AREA } from '../display/ppu';
import { checkBit } from '../utils';
import { CPUTimer } from '../cpu/cpu-timer';
import { CPUInterrupt } from '../cpu/cpu';
import { Audio, DEFAULT_WAVE_DATA_DMG, DEFAULT_WAVE_DATA_CGB } from '../audio/audio';

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
  private ioRegisters: MemorySegmentDecorator;

  // High RAM
  // 0xFF80 to 0xFFFE
  private hram: MemorySegment;

  // Interrupts Enable Registers
  // 0xFFFF
  private ieRegister: MemorySegment;

  // Color game-boy background palettes data
  private cgbBackgroundPalettes: number[];

  // Color game-boy sprites palettes data
  private cgbSpritePalettes: number[];

  // Joypad (used by the I/O Register)
  private joypad: Joypad;

  // Display unit
  private display: Display | null;

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
  ) {
    this.joypad = joypad;
    this.dmaHandler = dmaHandler;
    this.audio = audio;

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

    // Reset CGB palettes
    // 8 * 4 colors * 2 bytes/color
    this.cgbBackgroundPalettes = [];
    this.cgbSpritePalettes = [];
    for (let i = 0; i <= 64; i++) {
      this.cgbBackgroundPalettes.push(0xFF);
      this.cgbSpritePalettes.push(0xFF);
    }

    // Empty I/O Registers (128B)
    this.ioRegisters = new MemorySegmentDecorator(new MemorySegment(IOREGISTERS_LENGTH), {
      getByte: (decorated, offset) => {
        let value = decorated.getByte(offset);

        if (offset === 0x0000) {
          // Joypad status
          value |= 0xF;

          if (!checkBit(4, value)) {
            value &= this.joypad.isPressed(BUTTON.DOWN) ? ~0x08 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.UP) ? ~0x04 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.LEFT) ? ~0x02 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.RIGHT) ? ~0x01 : 0xFF;
          }

          if (!checkBit(5, value)) {
            value &= this.joypad.isPressed(BUTTON.START) ? ~0x08 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.SELECT) ? ~0x04 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.B) ? ~0x02 : 0xFF;
            value &= this.joypad.isPressed(BUTTON.A) ? ~0x01 : 0xFF;
          }
        } else if (offset === 0x0004) {
          // Timer - DIV Register
          value = (this.cpuTimer.getCounter() >> 8) & 0xFF;
        } else if (offset === 0x0005) {
          // Timer - TIMA
          value = this.cpuTimer.getTima() & 0xFF;
        } else if (offset === 0x0006) {
          // Timer - TMA
          value = this.cpuTimer.getTma() & 0xFF;
        } else if (offset === 0x0007) {
          // Timer - TAC
          value = 0xF8;
          value |= this.cpuTimer.isRunning() ? (1 << 2) : 0;
          value |= this.cpuTimer.getMode() & 0b11;
        } else if (offset === 0x000F) {
          // Interrupt flags: Unused bits are always set to 1
          value |= 0xE0;
        } else if (offset === 0x0010) {
          // Audio - NR10 - CH1 Frequency Sweep
          value = this.audio.ch1.nrx0;
        } else if (offset === 0x0011) {
          // Audio - NR11 - CH1 Sound length / Duty
          value = this.audio.ch1.nrx1;
        } else if (offset === 0x0012) {
          // Audio - NR12 - CH1 Volume envelope
          value = this.audio.ch1.nrx2;
        } else if (offset === 0x0013) {
          // Audio - NR13 - CH1 Frequency (low)
          value = this.audio.ch1.nrx3;
        } else if (offset === 0x0014) {
          // Audio - NR14 - CH1 Trigger / Frequency (high)
          value = this.audio.ch1.nrx4;
        } else if (offset === 0x0015) {
          // Audio - NR20 - CH2 Unused register
          value = this.audio.ch2.nrx0;
        } else if (offset === 0x0016) {
          // Audio - NR21 - CH2 Sound length / Duty
          value = this.audio.ch2.nrx1;
        } else if (offset === 0x0017) {
          // Audio - NR22 - CH2 Volume envelope
          value = this.audio.ch2.nrx2;
        } else if (offset === 0x0018) {
          // Audio - NR23 - CH2 Frequency (low)
          value = this.audio.ch2.nrx3;
        } else if (offset === 0x0019) {
          // Audio - NR24 - CH2 Trigger / Frequency (high)
          value = this.audio.ch2.nrx4;
        } else if (offset === 0x001A) {
          // Audio - NR30 - CH3 On/Off
          value = this.audio.ch3.nrx0;
        } else if (offset === 0x001B) {
          // Audio - NR31 - CH3 Sound length
          value = this.audio.ch3.nrx1;
        } else if (offset === 0x001C) {
          // Audio - NR32 - CH3 Output level
          value = this.audio.ch3.nrx2;
        } else if (offset === 0x001D) {
          // Audio - NR33 - CH3 Frequency (low)
          value = this.audio.ch3.nrx3;
        } else if (offset === 0x001E) {
          // Audio - NR34 - CH3 Trigger / Frequency (high)
          value = this.audio.ch3.nrx4;
        } else if (offset === 0x001F) {
          // Audio - NR40 - CH4 Unused register
          value = this.audio.ch4.nrx0;
        } else if (offset === 0x0020) {
          // Audio - NR41 - CH4 Sound length
          value = this.audio.ch4.nrx1;
        } else if (offset === 0x0021) {
          // Audio - NR42 - CH4 Volume envelope
          value = this.audio.ch4.nrx2;
        } else if (offset === 0x0022) {
          // Audio - NR43 - CH4 Polynomial counter
          value = this.audio.ch4.nrx3;
        } else if (offset === 0x0023) {
          // Audio - NR44 - CH4 Trigger / Counter
          value = this.audio.ch4.nrx4;
        } else if (offset === 0x0024) {
          // Audio - NR50 - Left/right volume / Vin output
          value = this.audio.nr50;
        } else if (offset === 0x0025) {
          // Audio - NR51 - Channel left/right outputs
          value = this.audio.nr51;
        } else if (offset === 0x0026) {
          // Audio - NR52 - Sound on/off
          value = this.audio.nr52;
        } else if ((offset >= 0x0027) && (offset < 0x0030)) {
          // Audio - Unused registers
          value = 0xFF;
        } else if ((offset >= 0x0030) && (offset < 0x0040)) {
          // Audio - Waveform RAM
          value = this.audio.ch3.waveform[offset - 0x0030];
        } else if (offset === 0x0040) {
          if (this.display) {
            const lcdControl = this.display.getLcdControl();
            value = 0;
            value |= lcdControl.backgroundEnabled ? 1 : 0;
            value |= lcdControl.spritesEnabled ? (1 << 1) : 0;
            value |= (lcdControl.spritesHeight === 16) ? (1 << 2) : 0;
            value |= (lcdControl.backgroundTileMap === TILE_MAP.MAP_2) ? (1 << 3) : 0;
            value |= (lcdControl.backgroundTileArea === TILE_AREA.AREA_2) ? (1 << 4) : 0;
            value |= lcdControl.windowEnabled ? (1 << 5) : 0;
            value |= (lcdControl.windowTileMap === TILE_MAP.MAP_2) ? (1 << 6) : 0;
            value |= lcdControl.lcdEnabled ? (1 << 7) : 0;
          }
        } else if (offset === 0x0041) {
          // LCD Status: bit 7 is always set to 1
          value |= 1 << 7;
        } else if (offset === 0x004D) {
          // Double speed mode flag (CGB mode only)
          if (this.emulationMode === EMULATION_MODE.CGB) {
            value |= 0x7E;

            if (this.doubleSpeedModeEnabled) {
              value |= 1 << 7;
            } else {
              value &= ~(1 << 7);
            }
          }
        } else if (offset === 0x0055) {
          // HDMA transfer status (CGB mode only)
          if (this.emulationMode === EMULATION_MODE.CGB) {
            const transfer = this.dmaHandler.getHdmaTransfer();
            const isInProgress = transfer && !transfer.hasEnded() && !transfer.isStopped();
            const remainingLength = transfer ? transfer.getRemainingLength() : 0;

            value = (isInProgress ? 1 : 0) << 7;
            value |= (remainingLength > 0) ? ((remainingLength >> 4) - 1) : 0xFF;
          }
        } else if (offset === 0x0068) {
          // BG Palette index (CGB mode only)
          // Bit 6 is always set to 1.
          if (this.emulationMode === EMULATION_MODE.CGB) {
            value |= 1 << 6;
          }
        } else if (offset === 0x0069) {
          // Background palette data (CGB mode only)
          if (this.emulationMode === EMULATION_MODE.CGB) {
            const paletteIndex = (decorated.getByte(0x0068) & 0b111111);
            value = this.cgbBackgroundPalettes[paletteIndex];
          }
        } else if (offset === 0x006B) {
          // Sprite palette data (CGB mode only)
          if (this.emulationMode === EMULATION_MODE.CGB) {
            const paletteIndex = (decorated.getByte(0x006A) & 0b11111);
            value = this.cgbSpritePalettes[paletteIndex];
          }
        }

        return value;
      },
      setByte: (decorated, offset, value) => {
        if (offset === 0x0000) {
          // Joypad update
          // Bits 0 to 3 are read-only
          value = value & 0xF0;
        } else if (offset === 0x0004) {
          // Timer - DIV Register
          // Any write to that register resets the timer.
          this.cpuTimer.reset();
        } else if (offset === 0x0005) {
          // Timer - TIMA
          this.cpuTimer.setTima(value & 0xFF);
        } else if (offset === 0x0006) {
          // Timer - TMA
          this.cpuTimer.setTma(value & 0xFF);
        } else if (offset === 0x0007) {
          // Timer - TAC
          if (((value >> 2) & 1) === 1) {
            this.cpuTimer.start();
          } else {
            this.cpuTimer.stop();
          }

          this.cpuTimer.setMode(value & 0b11);
        } else if (offset === 0x0010) {
          // Audio - NR10 - CH1 Frequency Sweep
          this.audio.ch1.nrx0 = value;
        } else if (offset === 0x0011) {
          // Audio - NR11 - CH1 Sound length / Duty
          this.audio.ch1.nrx1 = value;
        } else if (offset === 0x0012) {
          // Audio - NR12 - CH1 Volume envelope
          this.audio.ch1.nrx2 = value;
        } else if (offset === 0x0013) {
          // Audio - NR13 - CH1 Frequency (low)
          this.audio.ch1.nrx3 = value;
        } else if (offset === 0x0014) {
          // Audio - NR14 - CH1 Trigger / Frequency (high)
          this.audio.ch1.nrx4 = value;
        } else if (offset === 0x0016) {
          // Audio - NR21 - CH2 Sound length / Duty
          this.audio.ch2.nrx1 = value;
        } else if (offset === 0x0017) {
          // Audio - NR22 - CH2 Volume envelope
          this.audio.ch2.nrx2 = value;
        } else if (offset === 0x0018) {
          // Audio - NR23 - CH2 Frequency (low)
          this.audio.ch2.nrx3 = value;
        } else if (offset === 0x0019) {
          // Audio - NR24 - CH2 Trigger / Frequency (high)
          this.audio.ch2.nrx4 = value;
        } else if (offset === 0x001A) {
          // Audio - NR30 - CH3 On/Off
          this.audio.ch3.nrx0 = value;
        } else if (offset === 0x001B) {
          // Audio - NR31 - CH3 Sound length
          this.audio.ch3.nrx1 = value;
        } else if (offset === 0x001C) {
          // Audio - NR32 - CH3 Output level
          this.audio.ch3.nrx2 = value;
        } else if (offset === 0x001D) {
          // Audio - NR33 - CH3 Frequency (low)
          this.audio.ch3.nrx3 = value;
        } else if (offset === 0x001E) {
          // Audio - NR34 - CH3 Trigger / Frequency (high)
          this.audio.ch3.nrx4 = value;
        } else if (offset === 0x0020) {
          // Audio - NR41 - CH4 Sound length
          this.audio.ch4.nrx1 = value;
        } else if (offset === 0x0021) {
          // Audio - NR42 - CH4 Volume envelope
          this.audio.ch4.nrx2 = value;
        } else if (offset === 0x0022) {
          // Audio - NR43 - CH4 Polynomial counter
          this.audio.ch4.nrx3 = value;
        } else if (offset === 0x0023) {
          // Audio - NR44 - CH4 Trigger / Counter
          this.audio.ch4.nrx4 = value;
        } else if (offset === 0x0024) {
          // Audio - NR50 - Left/right volume / Vin output
          this.audio.nr50 = value;
        } else if (offset === 0x0025) {
          // Audio - NR51 - Channel left/right outputs
          this.audio.nr51 = value;
        } else if (offset === 0x0026) {
          // Audio - NR52 - Sound on/off
          this.audio.nr52 = value;
        } else if ((offset >= 0x0030) && (offset < 0x0040)) {
          // Audio - Waveform RAM
          this.audio.ch3.updateWaveform(offset - 0x0030, value);
        } else if (offset === 0x0040) {
          // LCDC Control Register update
          // If a display unit is set, notify it.
          if (this.display) {
            this.display.setLcdControl({
              backgroundEnabled: checkBit(0, value),
              spritesEnabled: checkBit(1, value),
              spritesHeight: checkBit(2, value) ? 16 : 8,
              backgroundTileMap: checkBit(3, value) ? TILE_MAP.MAP_2 : TILE_MAP.MAP_1,
              backgroundTileArea: checkBit(4, value) ? TILE_AREA.AREA_2 : TILE_AREA.AREA_1,
              windowEnabled: checkBit(5, value),
              windowTileMap: checkBit(6, value) ? TILE_MAP.MAP_2 : TILE_MAP.MAP_1,
              lcdEnabled: checkBit(7, value),
            });
          }
        } else if (offset === 0x0044) {
          // LY update.
          // When that happens it should also change the value of LYC
          // and eventually trigger an interrupt.
          const lcdsRegister = decorated.getByte(0x0041);
          const ly = value;
          const lyc =  decorated.getByte(0x0045);

          if (ly === lyc) {
            decorated.setByte(0x0041, lcdsRegister | (1 << 2));

            // Check if we should trigger the LCDC Status Interrupt
            const lcdEnabled = !this.display || this.display.getLcdControl().lcdEnabled;
            if (lcdEnabled && checkBit(6, lcdsRegister)) {
              this.triggerInterrupt(CPUInterrupt.LCDSTAT);
            }
          } else {
            decorated.setByte(0x0041, lcdsRegister & ~(1 << 2));
          }
        } else if (offset === 0x0046) {
          // OAM DMA Transfer triggered by a write on 0x0046 (=0xFF46)
          const fromAddress = (value & 0xFF) << 8;

          // Start the DMA transfer using the DMAHandler if one
          // was provided to the AddressBus.
          this.dmaHandler.startOamTransfer(this, fromAddress);
          return;
        } else if (offset === 0x004F) {
          // Writes on 0x004F (=0xFF4F) in CGB mode select
          // a new VRAM bank.
          if (this.emulationMode === EMULATION_MODE.CGB) {
            this.currentVideoRamBank = value & 1;
          }
        } else if (offset === 0x0050) {
          // Writes on 0x0050 (=0xFF50) disable the boot rom
          this.bootRomEnabled = false;
        } else if (offset === 0x0055) {
          // Writes on 0x0055 (=0xFF55) starts a new HDMA DMA
          // in CGB mode.
          if (this.emulationMode === EMULATION_MODE.CGB) {
            const transfer = this.dmaHandler.getHdmaTransfer();
            const mode = (value >> 7) & 1;
            const length = ((value & 0x7F) + 1) << 4;

            if (transfer && !transfer.hasEnded() && (mode === 0)) {
              // If there is a transfer in progress, try to stop it.
              // This does not work for general purpose DMA.
              transfer.stop();
            } else {
              // If no transfer is in progress, start a new one.
              this.dmaHandler.startHdmaTransfer(
                this,
                (mode === 0) ? HDMA_TRANSFER_MODE.GENERAL_PURPOSE : HDMA_TRANSFER_MODE.HBLANK,
                length
              );
            }

            return;
          }
        } else if (offset === 0x0069) {
          if (this.emulationMode === EMULATION_MODE.CGB) {
            // Writes on 0x0069 (=0xFF69) in CGB mode allows
            // to change the background palette data using
            // the index provided by 0xFF68.
            const bgPalette = decorated.getByte(0x0068);
            const bgPaletteAutoIncrement = !!((bgPalette >> 7) & 1);
            const bgPaletteIndex = (bgPalette & 0b111111);

            this.cgbBackgroundPalettes[bgPaletteIndex] = value;

            // If autoincrement is enabled, change the index
            // stored in 0xFF68.
            if (bgPaletteAutoIncrement) {
              decorated.setByte(0x0068, (1 << 7) | ((bgPalette + 1) & 0b111111));
            }
          }
        } else if (offset === 0x006B) {
          if (this.emulationMode === EMULATION_MODE.CGB) {
            // Writes on 0x006B (=0xFF6B) in CGB mode allows
            // to change the sprite palette data using
            // the index provided by 0xFF6A.
            const spritePalette = decorated.getByte(0x006A);
            const spritePaletteAutoIncrement = !!((spritePalette >> 7) & 1);
            const spritePaletteIndex = (spritePalette & 0b111111);

            this.cgbSpritePalettes[spritePaletteIndex] = value;

            // If autoincrement is enabled, change the index
            // stored in 0xFF68.
            if (spritePaletteAutoIncrement) {
              decorated.setByte(0x006A, (1 << 7) | ((spritePalette + 1) & 0b111111));
            }
          }
        } else if (offset === 0x0070) {
          // Writes on 0x0070 (=0xFF70) in CGB mode select
          // a new RAM bank. Bank #0 cannot be selected and
          // is replaced by Bank #1 instead.
          if (this.emulationMode === EMULATION_MODE.CGB) {
            this.currentRamBank = (value & 0b111) || 1;
          }
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
   * Return the memory segments associated to the
   * video RAM. It avoids doing many calls to
   * getByte/getWord and unecessary lookups during
   * video rendering.
   */
  public getVideoRamBanks(): MemorySegment[] {
    return this.videoRamBanks;
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
   * Return the Color Game-Boy background palettes.
   */
  public getCgbBackgroundPalettes(): number[] {
    return this.cgbBackgroundPalettes;
  }

  /**
   * Return the Color Game-Boy sprite palettes.
   */
  public getCgbSpritePalettes(): number[] {
    return this.cgbSpritePalettes;
  }

  /**
   * Set the current display unit.
   *
   * @param display Display
   */
  public setDisplay(display: Display): void {
    this.display = display;
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
