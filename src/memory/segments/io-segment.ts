import { MemorySegment } from './memory-segment';
import { IOREGISTERS_LENGTH, EMULATION_MODE, AddressBus } from '../address-bus';
import { checkBit } from '../../utils';
import { Joypad, BUTTON } from '../../controls/joypad';
import { Display } from '../../display/display';
import { CPUTimer } from '../../cpu/cpu-timer';
import { Audio } from '../../audio/audio';
import { DMAHandler } from '../dma/dma-handler';
import { CPUInterrupt } from '../../cpu/cpu';
import { HDMA_TRANSFER_MODE } from '../dma/hdma-transfer';
import { TILE_MAP, TILE_AREA } from '../../display/ppu';

/**
 * This class handles the IO registers' segment.
 * These registers allows to read or change the
 * state of various components (timers, display,
 * audio, ...).
 */
export class IOSegment extends MemorySegment {
  private addressBus: AddressBus;
  private display: Display;
  private audio: Audio;
  private joypad: Joypad;
  private cpuTimer: CPUTimer;
  private dmaHandler: DMAHandler;

  public constructor(
    addressBus: AddressBus,
    display: Display,
    audio: Audio,
    joypad: Joypad,
    cpuTimer: CPUTimer,
    dmaHandler: DMAHandler,
  ) {
    super(IOREGISTERS_LENGTH);

    this.addressBus = addressBus;
    this.display = display;
    this.audio = audio;
    this.joypad = joypad;
    this.cpuTimer = cpuTimer;
    this.dmaHandler = dmaHandler;
  }

  public getByte(offset: number) {
    let value = super.getByte(offset);

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
      // LCD Control
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
    } else if (offset === 0x0041) {
      // LCD Status: bit 7 is always set to 1
      value |= 1 << 7;
    } else if (offset === 0x004D) {
      // Double speed mode flag (CGB mode only)
      if (this.addressBus.getEmulationMode() === EMULATION_MODE.CGB) {
        value |= 0x7E;

        if (this.addressBus.isDoubleSpeedModeEnabled()) {
          value |= 1 << 7;
        } else {
          value &= ~(1 << 7);
        }
      }
    } else if (offset === 0x0055) {
      // HDMA transfer status (CGB mode only)
      if (this.addressBus.getEmulationMode() === EMULATION_MODE.CGB) {
        const transfer = this.dmaHandler.getHdmaTransfer();
        const isInProgress = transfer && !transfer.hasEnded() && !transfer.isStopped();
        const remainingLength = transfer ? transfer.getRemainingLength() : 0;

        value = (isInProgress ? 1 : 0) << 7;
        value |= (remainingLength > 0) ? ((remainingLength >> 4) - 1) : 0xFF;
      }
    } else if (offset === 0x0068) {
      // BG Palette index (CGB mode only)
      // Bit 6 is always set to 1.
      if (this.addressBus.getEmulationMode() === EMULATION_MODE.CGB) {
        value |= 1 << 6;
      }
    } else if (offset === 0x0069) {
      // Background palette data (CGB mode only)
      if (this.addressBus.getEmulationMode() === EMULATION_MODE.CGB) {
        const paletteIndex = (super.getByte(0x0068) & 0b111111);
        value = this.display.getCgbBackgroundPalettes()[paletteIndex];
      }
    } else if (offset === 0x006B) {
      // Sprite palette data (CGB mode only)
      if (this.addressBus.getEmulationMode() === EMULATION_MODE.CGB) {
        const paletteIndex = (super.getByte(0x006A) & 0b11111);
        value = this.display.getCgbSpritePalettes()[paletteIndex];
      }
    }

    return value;
  }

  public setByte(offset: number, value: number) {
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
    } else if (offset === 0x0042) {
      // Background scroll Y
      this.display.getLcdPosition().backgroundScrollY = value & 0xFF;
    } else if (offset === 0x0043) {
      // Background scroll X
      this.display.getLcdPosition().backgroundScrollX = value & 0xFF;
    } else if (offset === 0x0044) {
      // LY update.
      // When that happens it should also change the value of LYC
      // and eventually trigger an interrupt.
      const lcdsRegister = super.getByte(0x0041);
      const ly = value;
      const lyc =  super.getByte(0x0045);

      if (ly === lyc) {
        super.setByte(0x0041, lcdsRegister | (1 << 2));

        // Check if we should trigger the LCDC Status Interrupt
        const lcdEnabled = !this.display || this.display.getLcdControl().lcdEnabled;
        if (lcdEnabled && checkBit(6, lcdsRegister)) {
          this.addressBus.triggerInterrupt(CPUInterrupt.LCDSTAT);
        }
      } else {
        super.setByte(0x0041, lcdsRegister & ~(1 << 2));
      }
    } else if (offset === 0x0046) {
      // OAM DMA Transfer triggered by a write on 0x0046 (=0xFF46)
      const fromAddress = (value & 0xFF) << 8;

      // Start the DMA transfer using the DMAHandler if one
      // was provided to the AddressBus.
      this.dmaHandler.startOamTransfer(this.addressBus, fromAddress);
      return;
    } else if (offset === 0x0047) {
      // Background palette
      this.display.getLcdPalettes().backgroundPalette = [
        value & 3,
        (value >> 2) & 3,
        (value >> 4) & 3,
        (value >> 6) & 3,
      ];
    } else if (offset === 0x0048) {
      // Sprite palette #0
      this.display.getLcdPalettes().spritePalette0 = [
        value & 3,
        (value >> 2) & 3,
        (value >> 4) & 3,
        (value >> 6) & 3,
      ];
    } else if (offset === 0x0049) {
      // Sprite palette #1
      this.display.getLcdPalettes().spritePalette1 = [
        value & 3,
        (value >> 2) & 3,
        (value >> 4) & 3,
        (value >> 6) & 3,
      ];
    } else if (offset === 0x004A) {
      // Background position Y
      this.display.getLcdPosition().windowPositionY = value & 0xFF;
    } else if (offset === 0x004B) {
      // Background position X
      this.display.getLcdPosition().windowPositionX = (value & 0xFF) - 7;
    } else if (offset === 0x004F) {
      // Writes on 0x004F (=0xFF4F) in CGB mode select
      // a new VRAM bank.
      if (this.addressBus.getEmulationMode() === EMULATION_MODE.CGB) {
        this.addressBus.setCurrentVideoRamBank(value);
      }
    } else if (offset === 0x0050) {
      // Writes on 0x0050 (=0xFF50) disable the boot rom
      this.addressBus.disableBootRom();
    } else if (offset === 0x0055) {
      // Writes on 0x0055 (=0xFF55) starts a new HDMA DMA
      // in CGB mode.
      if (this.addressBus.getEmulationMode() === EMULATION_MODE.CGB) {
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
            this.addressBus,
            (mode === 0) ? HDMA_TRANSFER_MODE.GENERAL_PURPOSE : HDMA_TRANSFER_MODE.HBLANK,
            length
          );
        }

        return;
      }
    } else if (offset === 0x0069) {
      if (this.addressBus.getEmulationMode() === EMULATION_MODE.CGB) {
        // Writes on 0x0069 (=0xFF69) in CGB mode allows
        // to change the background palette data using
        // the index provided by 0xFF68.
        const bgPalette = super.getByte(0x0068);
        const bgPaletteAutoIncrement = !!((bgPalette >> 7) & 1);
        const bgPaletteIndex = (bgPalette & 0b111111);

        this.display.getCgbBackgroundPalettes()[bgPaletteIndex] = value;

        // If autoincrement is enabled, change the index
        // stored in 0xFF68.
        if (bgPaletteAutoIncrement) {
          super.setByte(0x0068, (1 << 7) | ((bgPalette + 1) & 0b111111));
        }
      }
    } else if (offset === 0x006B) {
      if (this.addressBus.getEmulationMode() === EMULATION_MODE.CGB) {
        // Writes on 0x006B (=0xFF6B) in CGB mode allows
        // to change the sprite palette data using
        // the index provided by 0xFF6A.
        const spritePalette = super.getByte(0x006A);
        const spritePaletteAutoIncrement = !!((spritePalette >> 7) & 1);
        const spritePaletteIndex = (spritePalette & 0b111111);

        this.display.getCgbSpritePalettes()[spritePaletteIndex] = value;

        // If autoincrement is enabled, change the index
        // stored in 0xFF68.
        if (spritePaletteAutoIncrement) {
          super.setByte(0x006A, (1 << 7) | ((spritePalette + 1) & 0b111111));
        }
      }
    } else if (offset === 0x0070) {
      // Writes on 0x0070 (=0xFF70) in CGB mode select
      // a new RAM bank. Bank #0 cannot be selected and
      // is replaced by Bank #1 instead.
      if (this.addressBus.getEmulationMode() === EMULATION_MODE.CGB) {
        this.addressBus.setCurrentRamBank(value);
      }
    }

    // Still update the value stored in memory
    super.setByte(offset, value);
  }
}
