import {
  AddressBus,
  CPU,
  Display,
  GameCartridge,
  Joypad
} from './index';

export class System {
  public readonly cpu: CPU;
  public readonly memory: AddressBus;
  public readonly display: Display;
  public readonly joypad: Joypad;

  public constructor() {
    this.joypad = new Joypad();
    this.memory = new AddressBus(this.joypad);
    this.display = new Display(this.memory);
    this.cpu = new CPU(this.memory, this.display);
  }

  /**
   * Load an optional boot ROM.
   *
   * @param path Bootstrap ROM path
   */
  public loadBootRom(buffer: ArrayBuffer): void {
    this.memory.loadBootRom(buffer);

    // Reset everything
    this.reset();
  }

  /**
   * Load a game ROM.
   *
   * @param path Game ROM path
   */
  public loadGame(buffer: ArrayBuffer): void {
    const cartridge = new GameCartridge(buffer);
    this.memory.loadCartridge(cartridge);

    // Reset everything
    this.reset();
  }

  /**
   * Reset all components.
   */
  public reset(): void {
    this.cpu.reset();
    this.memory.reset();
    this.display.reset();
  }

  /**
   * Run a single CPU cycle.
   */
  public tick(): void {
    this.cpu.tick();
  }
}
