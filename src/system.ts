import {
  AddressBus,
  APU,
  CPU,
  CPUTimer,
  Display,
  DMAHandler,
  GameCartridge,
  Joypad
} from './index';

export class System {
  private _apu: APU;
  private _cpu: CPU;
  private _cpuTimer: CPUTimer;
  private _dmaHandler: DMAHandler;
  private _memory: AddressBus;
  private _display: Display;
  private _joypad: Joypad;
  private _cartridge: GameCartridge;

  public constructor() {
    this._joypad = new Joypad();
    this._dmaHandler = new DMAHandler();
    this._cpuTimer = new CPUTimer();
    this._apu = new APU();
    this._memory = new AddressBus(this._joypad, this._dmaHandler, this._cpuTimer, this._apu);
    this._display = new Display(this._memory);
    this._cpu = new CPU(this._memory, this._cpuTimer);
  }

  /**
   * Load an optional boot ROM.
   *
   * @param path Bootstrap ROM path
   */
  public loadBootRom(buffer: ArrayBuffer): void {
    this._memory.loadBootRom(buffer);

    // Reset everything
    this.reset();
  }

  /**
   * Load a game ROM.
   *
   * @param path Game ROM path
   */
  public loadGame(buffer: ArrayBuffer): void {
    this._cartridge = new GameCartridge(buffer);
    this._memory.loadCartridge(this._cartridge);

    // Reset everything
    this.reset();
  }

  /**
   * Reset all components.
   */
  public reset(): void {
    this._apu.reset();
    this._cpu.reset();
    this._cpuTimer.reset();
    this._memory.reset();
    this._display.reset();
    this._dmaHandler.reset();
  }

  /**
   * Run a single CPU cycle.
   */
  public tick(): void {
    this._dmaHandler.tick();
    this._display.tick();

    if (!this._dmaHandler.isHdmaTransferActive()) {
      this._cpu.tick();
    }

    this._apu.tick();
  }

  /**
   * Return the audio processing unit.
   */
  public get apu(): APU {
    return this._apu;
  }

  /**
   * Return the cpu component.
   */
  public get cpu(): CPU {
    return this._cpu;
  }

  /**
   * Return the cpu internal timer.
   */
  public get cpuTimer(): CPUTimer {
    return this._cpuTimer;
  }

  /**
   * Return the memory component.
   */
  public get memory(): AddressBus {
    return this._memory;
  }

  /**
   * Return the display component.
   */
  public get display(): Display {
    return this._display;
  }

  /**
   * Return the joypad component.
   */
  public get joypad(): Joypad {
    return this._joypad;
  }

  /**
   * Return the current cartridge.
   */
  public get cartridge(): GameCartridge {
    return this._cartridge;
  }
}
