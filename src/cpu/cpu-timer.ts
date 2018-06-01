import { AddressBus } from '../memory/address-bus';

export class CpuTimer {
  private addressBus: AddressBus;
  private ticksCount: number;

  public constructor(addressBus: AddressBus) {
    this.addressBus = addressBus;
    this.ticksCount = 0;
  }

  public tick(): void {
    // Increment ticks count
    // There is no need to keep track over 1024
    this.ticksCount = (this.ticksCount + 1) & 0x400;

    // We don't need to check anything if the current
    // count isn't a multiple of 16.
    if ((this.ticksCount % 16) !== 0) {
      return;
    }

    // Divider counts up at 16384Hz (= every 256 ticks)
    if ((this.ticksCount % 256) === 0) {
      this.incrementDivider();
    }

    const control = this.addressBus.get(0xFF07).byte;
    const running = (control & 0b100) !== 0;

    if (running) {
      const speed = control & 0b11;

      let shouldIncrementCounter = false;

      switch (speed) {
        case 0: // 4096Hz (= every 1024 ticks)
          shouldIncrementCounter = (this.ticksCount % 1024) === 0;
          break;
        case 1: // 262144Hz (= every 16 ticks, already checked before)
          shouldIncrementCounter = true;
          break;
        case 2: // 65536Hz (= every 64 ticks)
          shouldIncrementCounter = (this.ticksCount % 64) === 0;
          break;
        case 3: // 16384Hz (= every 256 ticks)
          shouldIncrementCounter = (this.ticksCount % 256) === 0;
          break;
      }

      if (shouldIncrementCounter) {
        this.incrementCounter();
      }
    }
  }

  public reset(): void {
    this.ticksCount = 0;
  }

  private incrementDivider(): void {
    this.addressBus.get(0xFF04).byte = (this.addressBus.get(0xFF04).byte + 1) & 0xFF;
  }

  private incrementCounter(): void {
    let newValue = (this.addressBus.get(0xFF05).byte + 1) & 0xFF;

    // Triggers interrupt and reset to modulo in case of an overflow
    if (newValue === 0) {
      this.addressBus.get(0xFF0F).byte = this.addressBus.get(0xFF0F).byte | 0b100;
      newValue = this.addressBus.get(0xFF06).byte;
    }

    this.addressBus.get(0xFF05).byte = newValue;
  }
}
