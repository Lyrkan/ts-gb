import { AddressBus } from '../memory/address-bus';
import { checkBit } from '../utils';

export class CpuTimer {
  private addressBus: AddressBus;
  private ticksCount: number;

  public constructor(addressBus: AddressBus) {
    this.addressBus = addressBus;
    this.ticksCount = 0;
  }

  public tick(): void {
    const control = this.addressBus.getByte(0xFF07);
    const running = checkBit(2, control);

    // Increment ticks count
    // There is no need to keep track over 255
    this.ticksCount = (this.ticksCount + 1) & 0xFF;

    // We don't need to check anything if the current
    // count isn't a multiple of 4.
    if ((this.ticksCount % 4) !== 0) {
      return;
    }

    // Divider counts up at 16384Hz (= every 64 ticks)
    if ((this.ticksCount % 64) === 0) {
      this.incrementDivider();
    }

    if (running) {
      const speed = control & 0b11;

      let shouldIncrementCounter = false;

      switch (speed) {
        case 0: // 4096Hz (= every 256 ticks)
          shouldIncrementCounter = this.ticksCount === 0;
          break;
        case 1: // 262144Hz (= every 4 ticks, already checked before)
          shouldIncrementCounter = true;
          break;
        case 2: // 65536Hz (= every 16 ticks)
          shouldIncrementCounter = (this.ticksCount % 16) === 0;
          break;
        case 3: // 16384Hz (= every 64 ticks)
          shouldIncrementCounter = (this.ticksCount % 64) === 0;
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
    this.addressBus.setByte(0xFF04, (this.addressBus.getByte(0xFF04) + 1) & 0xFF);
  }

  private incrementCounter(): void {
    let newValue = (this.addressBus.getByte(0xFF05) + 1) & 0xFF;

    // Triggers interrupt and reset to modulo in case of an overflow
    if (newValue === 0) {
      this.addressBus.setByte(0xFF0F, this.addressBus.getByte(0xFF0F) | (1 << 2));
      newValue = this.addressBus.getByte(0xFF06);
    }

    this.addressBus.setByte(0xFF05, newValue);
  }
}
