import { AddressBus } from '../memory/address-bus';
import { PPU, TILE_MAP, TILE_AREA } from './ppu';
import { checkBit } from '../utils';

export const SCREEN_WIDTH = 160;
export const SCREEN_HEIGHT = 144;

export class Display {
  private addressBus: AddressBus;
  private buffers: Uint8ClampedArray[];
  private currentBuffer: number;
  private currentMode: GPU_MODE;
  private currentLine: number;
  private clock: number;
  private lcdControl: ILCDControl;

  public constructor(addressBus: AddressBus) {
    this.addressBus = addressBus;

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

    this.buffers = [
      new Uint8ClampedArray(SCREEN_WIDTH * SCREEN_HEIGHT * 3),
      new Uint8ClampedArray(SCREEN_WIDTH * SCREEN_HEIGHT * 3),
    ];

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < (SCREEN_WIDTH * SCREEN_HEIGHT * 3); j++) {
        this.buffers[i][j] = 255;
      }
    }

    addressBus.setDisplay(this);

    this.reset();
  }

  public reset(): void {
    this.currentBuffer = 0;
    this.currentMode = GPU_MODE.OAM_SEARCH;
    this.currentLine = 0;
    this.clock = 0;
    this.addressBus.setByte(0xFF44, 0);
  }

  public getFrontBuffer(): Uint8ClampedArray {
    return this.buffers[this.currentBuffer];
  }

  public getBackBuffer(): Uint8ClampedArray {
    return this.buffers[~this.currentBuffer & 1];
  }

  public tick(): void {
    const hblankOffset = (this.currentLine * 114);

    // Update current line every 114 ticks
    if ((this.clock > 0) && ((this.clock % 114) === 0)) {
      this.currentLine = (this.currentLine + 1) % 154;
      this.addressBus.setByte(0xFF44, this.currentLine);
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
    if ((this.currentMode === GPU_MODE.HBLANK) && (this.clock === (hblankOffset + 114))) {
      if (this.currentLine < SCREEN_HEIGHT) {
        this.setMode(GPU_MODE.OAM_SEARCH);
      } else {
        // Last line, switch to VBLANK
        this.setMode(GPU_MODE.VBLANK);
      }
    }

    // Check for the end of VBLANK
    if (this.clock >= 17556) {
      this.clock = 0;
      this.setMode(GPU_MODE.OAM_SEARCH);
      this.switchBuffers();
    } else {
      this.clock++;
    }
  }

  public setLcdControl(lcdControl: ILCDControl) {
    if (lcdControl.lcdEnabled !== this.lcdControl.lcdEnabled) {
      if (!lcdControl.lcdEnabled) {
        // If the LCD is shutdown, clear both buffers
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < (SCREEN_WIDTH * SCREEN_HEIGHT * 3); j++) {
            this.buffers[i][j] = 255;
          }
        }
      } else {
        // If the LCD is re-enabled, reset the display unit
        // to the first line.
        this.reset();
      }
    }

    this.lcdControl = lcdControl;
  }

  public getLcdControl() {
    return this.lcdControl;
  }

  private switchBuffers(): void {
    // Switch the current buffer
    this.currentBuffer = ~this.currentBuffer & 1;
  }

  private setMode(mode: GPU_MODE) {
    this.currentMode = mode;

    // Switch mode in LCD Status Register
    const lcdsRegister = (this.addressBus.getByte(0xFF41) & 0xFC) | mode;
    this.addressBus.setByte(0xFF41, lcdsRegister);

    // Interrupts are only triggered when the LCD is enabled
    if (this.lcdControl.lcdEnabled) {
      // Trigger VBLANK interrupt if needed
      if (mode === GPU_MODE.VBLANK) {
        this.addressBus.setByte(0xFF0F, this.addressBus.getByte(0xFF0F) | (1 << 0));
      }

      // Check if the LCDC Status Interrupt should be triggered:
      // H-Blank Interrupt (Mode 0) = bit 3
      // V-Blank Interrupt (Mode 1) = bit 4
      // OAM Interrupt (Mode 2) = bit 5
      if ((mode !== GPU_MODE.PIXEL_TRANSFER) && checkBit(3 + mode, lcdsRegister)) {
        this.addressBus.setByte(0xFF0F, this.addressBus.getByte(0xFF0F) | (1 << 1));
      }
    }
  }
}

export enum GPU_MODE {
  HBLANK = 0,
  VBLANK = 1,
  OAM_SEARCH = 2,
  PIXEL_TRANSFER = 3,
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
