import { CPU } from './cpu/cpu';
import { AddressBus } from './memory/address-bus';
import { GameCartridge } from './cartridge/game-cartridge';

const fs = require('fs');

export class System {
  private cpu: CPU;
  private memory: AddressBus;

  public constructor() {
    this.memory = new AddressBus();
    this.cpu = new CPU(this.memory);
  }

  /**
   * Load an optional boot ROM.
   *
   * @param path Bootstrap ROM path
   */
  public loadBootRom(path: string): void {
    const fileBuffer: Buffer = fs.readFileSync(path);
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    );

    this.memory.loadBootRom(arrayBuffer);

    // Reset everything
    this.reset();
  }

  /**
   * Load a game ROM.
   *
   * @param path Game ROM path
   */
  public loadGame(path: string): void {
    const fileBuffer: Buffer = fs.readFileSync(path);
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    );

    const cartridge = new GameCartridge(arrayBuffer);
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
  }

  /**
   * Run a single CPU cycle.
   */
  public tick(): void {
    this.cpu.tick();
  }
}