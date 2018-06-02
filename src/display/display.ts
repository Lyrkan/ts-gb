import { AddressBus } from '../memory/address-bus';
import { PPU } from './ppu';

export const SCREEN_WIDTH = 160;
export const SCREEN_HEIGHT = 144;

export class Display {
  private addressBus: AddressBus;
  private buffers: Uint8Array[];
  private currentBuffer: number;
  private currentMode: GPU_MODE;
  private currentLine: number;
  private clock: number;

  public constructor(addressBus: AddressBus) {
    this.addressBus = addressBus;
    this.reset();
  }

  public reset(): void {
    this.buffers = [
      new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT),
      new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT),
    ];
    this.currentBuffer = 0;
    this.currentMode = GPU_MODE.OAM_SEARCH;
    this.currentLine = 0;
    this.clock = 0;
  }

  public getFrontBuffer(): Uint8Array {
    return this.buffers[this.currentBuffer];
  }

  public getBackBuffer(): Uint8Array {
    return this.buffers[~this.currentBuffer & 1];
  }

  public tick(): void {
    // Scanline (access to OAM) in progress
    if ((this.currentMode === GPU_MODE.OAM_SEARCH)
      && (this.clock >= (this.currentLine + 20))) {
      this.setMode(GPU_MODE.PIXEL_TRANSFER);
    }

    // Scanline (access to VRM) in progress
    if ((this.currentMode === GPU_MODE.PIXEL_TRANSFER)
      && (this.clock >= (this.currentLine + 63))) {
      this.setMode(GPU_MODE.HBLANK);
      PPU.renderLine(this.addressBus, this.getBackBuffer(), this.currentLine);
    }

    // HBLANK in progress
    if ((this.currentMode === GPU_MODE.HBLANK)
      && (this.clock === (this.currentLine + 114))) {
      this.currentLine++;

      if (this.currentLine < SCREEN_HEIGHT) {
        this.setMode(GPU_MODE.OAM_SEARCH);
        this.updateLy();
      } else {
        // Last line, swtich to VBLANK
        this.setMode(GPU_MODE.VBLANK);
      }
    }

    // Check for the end of VBLANK
    if (this.clock >= 17556) {
      this.clock = 0;
      this.currentLine = 0;
      this.setMode(GPU_MODE.OAM_SEARCH);
      this.switchBuffers();
      this.updateLy();
      return;
    }

    this.clock++;
  }

  private switchBuffers(): void {
    // Blank has happened, trigger interrupt
    this.addressBus.get(0xFF0F).byte |= 1;

    // Switch the current buffer
    this.currentBuffer = ~this.currentBuffer & 1;
  }

  private setMode(mode: GPU_MODE) {
    this.currentMode = mode;

    // Switch mode in LCD Status Register
    const lcdsRegister = this.addressBus.get(0xFF41);
    lcdsRegister.byte = (lcdsRegister.byte & 0xFC) | mode;

    // Check if the LCDC Status Interrupt should be triggered:
    // H-Blank Interrupt (Mode 0) = bit 3
    // V-Blank Interrupt (Mode 1) = bit 4
    // OAM Interrupt (Mode 2) = bit 5
    if ((mode !== GPU_MODE.PIXEL_TRANSFER) && (lcdsRegister.byte & (1 << (3 + mode))) > 0) {
      this.triggerStatusInterrupt();
    }
  }

  private updateLy() {
    // Update LY (0xFF44)
    this.addressBus.get(0xFF44).byte = this.currentLine;

    // LYC=LY Coincidence (2nd bit of 0xFF41)
    const lcdsRegister = this.addressBus.get(0xFF41);
    if (this.addressBus.get(0xFF45).byte === this.currentLine) {
      lcdsRegister.byte |= 1 << 2;

      // Check if we should trigger the LCDC Status Interrupt
      if ((lcdsRegister.byte & 0x40) > 0) {
        this.triggerStatusInterrupt();
      }
    } else {
      lcdsRegister.byte &= ~(1 << 2);
    }
  }

  private triggerStatusInterrupt() {
    this.addressBus.get(0xFF0F).byte |= 2;
  }
}

enum GPU_MODE {
  HBLANK = 0,
  VBLANK = 1,
  OAM_SEARCH = 2,
  PIXEL_TRANSFER = 3,
}
