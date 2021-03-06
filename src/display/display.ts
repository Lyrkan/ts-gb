import { AddressBus } from '../memory/address-bus';
import { PPU, TILE_MAP, TILE_AREA } from './ppu';
import { checkBit } from '../utils';
import { CPUInterrupt } from '../cpu/cpu';

export const SCREEN_WIDTH = 160;
export const SCREEN_HEIGHT = 144;

const LINE_RENDERING_DURATION = 114;
const FRAME_RENDERING_DURATION = LINE_RENDERING_DURATION * 154;

export class Display {
  // Memory unit
  private addressBus?: AddressBus;

  // Rendering buffers (front + back).
  private buffers: Uint8Array[];
  private currentBuffer: number;

  // Current GPU mode (HBLANK, VBLANK, OAM search,
  // pixels transfer).
  private currentMode: GPU_MODE;

  // Current line being rendered.
  // Note that even if the LCD only displays
  // 144 lines, that variable can go up to
  // 153 because it keeps being incremented
  // during the VBLANK state.
  private currentLine: number;

  // Internal clock
  private clock: number;

  // Holds various information about the
  // current state of the LCD.
  private lcdControl: ILCDControl;

  // Holds current LCD palettes
  private lcdPalettes: ILCDPalettes;

  //  Holds current LCD positions
  private lcdPositions: ILCDPositions;

  // There is a slight delay (61 ticks) between
  // the moment the LCD is enabled and the first
  // frame is actually rendered. This variable keeps
  // track of how much time is left before the
  // rendering starts.
  private lcdEnablingDelay: number;

  // Color game-boy background palettes data
  private cgbBackgroundPalettes: number[];

  // Color game-boy sprites palettes data
  private cgbSpritePalettes: number[];

  public constructor() {
    this.reset();
  }

  public setAddressBus(addressBus: AddressBus) {
    this.addressBus = addressBus;
  }

  public reset(): void {
    // Reset LCD control flags
    this.lcdControl = {
      backgroundEnabled: true,
      spritesEnabled: false,
      spritesHeight: 8,
      backgroundTileMap: TILE_MAP.MAP_1,
      backgroundTileArea: TILE_AREA.AREA_2,
      windowEnabled: false,
      windowTileMap: TILE_MAP.MAP_1,
      lcdEnabled: true,
    };

    // Reset palettes
    this.lcdPalettes = {
      backgroundPalette: [0, 0, 0, 0],
      spritePalette0: [0, 0, 0, 0],
      spritePalette1: [0, 0, 0, 0],
    };

    // Reset background/window positions
    this.lcdPositions = {
      backgroundScrollY: 0,
      backgroundScrollX: 0,
      windowPositionY: 0,
      windowPositionX: 0,
    };

    // Reset CGB palettes
    // 8 * 4 colors * 2 bytes/color
    this.cgbBackgroundPalettes = [];
    this.cgbSpritePalettes = [];
    for (let i = 0; i <= 64; i++) {
      this.cgbBackgroundPalettes.push(0xFF);
      this.cgbSpritePalettes.push(0xFF);
    }

    this.buffers = [
      new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT * 3),
      new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT * 3),
    ];

    this.clearBuffer(0);
    this.clearBuffer(1);

    this.currentBuffer = 0;
    this.clock = 0;
    this.lcdEnablingDelay = 61;
    this.setMode(GPU_MODE.HBLANK);
    this.setCurrentLine(0);
  }

  public getFrontBuffer(): Uint8Array {
    return this.buffers[this.currentBuffer];
  }

  public getBackBuffer(): Uint8Array {
    return this.buffers[~this.currentBuffer & 1];
  }

  public tick(): void {
    if (!this.addressBus) {
      return;
    }

    if (this.lcdControl.lcdEnabled && (this.lcdEnablingDelay <= 0)) {
      const hblankOffset = (this.currentLine * LINE_RENDERING_DURATION);

      // Update current line every 114 ticks
      // Line 0 is a bit special since it is set 112 ticks before
      // the end of VBLANK.
      if (
        (this.clock !== 0)
        && (this.clock < (FRAME_RENDERING_DURATION - 112))
        && ((this.clock % LINE_RENDERING_DURATION) === 0)
      ) {
        this.setCurrentLine(this.currentLine + 1);
      } else if (this.clock === (FRAME_RENDERING_DURATION - 112)) {
        this.setCurrentLine(0);
      }

      // Scanline (access to OAM) in progress
      if ((this.currentMode === GPU_MODE.OAM_SEARCH) && (this.clock >= (hblankOffset +  20))) {
        this.setMode(GPU_MODE.PIXEL_TRANSFER);
      }

      // Scanline (access to VRM) in progress
      if ((this.currentMode === GPU_MODE.PIXEL_TRANSFER) && (this.clock >= (hblankOffset + 63))) {
        this.setMode(GPU_MODE.HBLANK);
        PPU.renderLine(this, this.addressBus, this.currentLine);
      }

      // HBLANK in progress
      if (
        (this.currentMode === GPU_MODE.HBLANK)
        && (this.clock >= (hblankOffset + LINE_RENDERING_DURATION))
      ) {
        if (this.currentLine < SCREEN_HEIGHT) {
          this.setMode(GPU_MODE.OAM_SEARCH);
        } else {
          // Last line, switch to VBLANK
          this.setMode(GPU_MODE.VBLANK);
        }
      }

      // Check for the end of VBLANK
      if (this.clock >= FRAME_RENDERING_DURATION) {
        this.clock = 0;
        this.setMode(GPU_MODE.OAM_SEARCH);
        this.switchBuffers();
      } else {
        this.clock++;
      }
    } else if (this.lcdControl.lcdEnabled) {
      this.lcdEnablingDelay--;

      if (this.lcdEnablingDelay <= 0) {
        this.clock = 0;
        this.setCurrentLine(0);
        this.setMode(GPU_MODE.OAM_SEARCH);
      }
    }
  }

  public setLcdControl(lcdControl: ILCDControl) {
    if (lcdControl.lcdEnabled !== this.lcdControl.lcdEnabled) {
      if (!lcdControl.lcdEnabled) {
        // When the LCD is disabled, empty the current buffer
        // and reset the current line to the top of the screen
        // (it shouldn't trigger the LY=LYC interrupt though)
        this.lcdControl.lcdEnabled = false;
        this.clearBuffer(this.currentBuffer);
        this.setCurrentLine(0);
        this.setMode(GPU_MODE.HBLANK);
      } else {
        // If the LCD is re-enabled, start the 61 ticks
        // delay before the first image is displayed.
        this.lcdControl.lcdEnabled = true;
        this.lcdEnablingDelay = 61;
      }
    }

    this.lcdControl = lcdControl;
  }

  public getLcdControl(): ILCDControl {
    return this.lcdControl;
  }

  public setLcdPalettes(lcdPalettes: ILCDPalettes): void {
    this.lcdPalettes = lcdPalettes;
  }

  public getLcdPalettes(): ILCDPalettes {
    return this.lcdPalettes;
  }

  public setLcdPositions(lcdPositions: ILCDPositions): void {
    this.lcdPositions = lcdPositions;
  }

  public getLcdPosition(): ILCDPositions {
    return this.lcdPositions;
  }

  public getCgbBackgroundPalettes(): number[] {
    return this.cgbBackgroundPalettes;
  }

  public getCgbSpritePalettes(): number[] {
    return this.cgbSpritePalettes;
  }

  private switchBuffers(): void {
    // Switch the current buffer
    this.currentBuffer = ~this.currentBuffer & 1;
  }

  private clearBuffer(bufferIndex: number): void {
    if (bufferIndex > (this.buffers.length - 1)) {
      throw new Error(`Invalid buffer index ${bufferIndex}`);
    }

    for (let i = 0; i < (SCREEN_WIDTH * SCREEN_HEIGHT * 3); i++) {
      this.buffers[bufferIndex][i] = 255;
    }
  }

  private setMode(mode: GPU_MODE): void {
    if (!this.addressBus) {
      return;
    }

    this.currentMode = mode;

    // Switch mode in LCD Status Register
    const lcdsRegister = (this.addressBus.getByte(0xFF41) & 0xFC) | mode;
    this.addressBus.setByte(0xFF41, lcdsRegister);

    // Interrupts are only triggered when the LCD is enabled
    if (this.lcdControl.lcdEnabled) {
      // Trigger VBLANK interrupt if needed
      if (mode === GPU_MODE.VBLANK) {
        this.addressBus.triggerInterrupt(CPUInterrupt.VBLANK);
      }

      // Check if the LCDC Status Interrupt should be triggered:
      // H-Blank Interrupt (Mode 0) = bit 3
      // V-Blank Interrupt (Mode 1) = bit 4
      // OAM Interrupt (Mode 2) = bit 5
      if ((mode !== GPU_MODE.PIXEL_TRANSFER) && checkBit(3 + mode, lcdsRegister)) {
        this.addressBus.triggerInterrupt(CPUInterrupt.LCDSTAT);
      }
    }
  }

  private setCurrentLine(line: number): void {
    if (!this.addressBus) {
      return;
    }

    this.currentLine = line % 154;
    this.addressBus.setByte(0xFF44, this.currentLine);
  }
}

export enum GPU_MODE {
  HBLANK = 0,
  VBLANK = 1,
  OAM_SEARCH = 2,
  PIXEL_TRANSFER = 3,
}

export type LCDPalette = [number, number, number, number];

export interface ILCDPalettes {
  backgroundPalette: LCDPalette;
  spritePalette0: LCDPalette;
  spritePalette1: LCDPalette;
}

export interface ILCDPositions {
  backgroundScrollY: number;
  backgroundScrollX: number;
  windowPositionY: number;
  windowPositionX: number;
}

export interface ILCDControl {
  backgroundEnabled: boolean;
  spritesEnabled: boolean;
  spritesHeight: number;
  backgroundTileMap: TILE_MAP;
  backgroundTileArea: TILE_AREA;
  windowEnabled: boolean;
  windowTileMap: TILE_MAP;
  lcdEnabled: boolean;
}
