import { AddressBus } from '../memory/address-bus';
import { CPUInterrupt } from './cpu';

export class CPUTimer {
  private addressBus?: AddressBus;
  private counter: number;
  private tima: number;
  private tma: number;
  private mode: CPUTimerMode;
  private running: boolean;

  public constructor() {
    this.counter = 0;
    this.tima = 0;
    this.tma = 0;
    this.mode = CPUTimerMode.HZ_4096;
    this.running = false;
  }

  public setAddressBus(addressBus: AddressBus): void {
    this.addressBus = addressBus;
  }

  public tick(): void {
    // Increment ticks count
    // This is limited to 16 bits.
    this.counter = (this.counter + 1) & 0xFFFF;

    if (this.running) {
      let shouldIncrementTima = false;

      switch (this.mode) {
        case CPUTimerMode.HZ_4096: // 4096Hz (= every 256 ticks)
          shouldIncrementTima = (this.counter % 256) === 0;
          break;
        case CPUTimerMode.HZ_262144: // 262144Hz (= every 4 ticks)
          shouldIncrementTima = (this.counter % 4) === 0;
          break;
        case CPUTimerMode.HZ_65536: // 65536Hz (= every 16 ticks)
          shouldIncrementTima = (this.counter % 16) === 0;
          break;
        case CPUTimerMode.HZ_16384: // 16384Hz (= every 64 ticks)
          shouldIncrementTima = (this.counter % 64) === 0;
          break;
      }

      if (shouldIncrementTima) {
        this.incrementTima();
      }
    }
  }

  public start(): void {
    this.running = true;
  }

  public stop(): void {
    this.running = false;
  }

  public isRunning(): boolean {
    return this.running;
  }

  public reset(): void {
    this.counter = 0;
  }

  public getCounter(): number {
    return this.counter;
  }

  public setCounter(counter: number): void {
    this.counter = counter;
  }

  public getTima(): number {
    return this.tima;
  }

  public setTima(tima: number): void {
    this.tima = tima;
  }

  public getTma(): number {
    return this.tma;
  }

  public setTma(tma: number): void {
    this.tma = tma;
  }

  public getMode(): CPUTimerMode {
    return this.mode;
  }

  public setMode(mode: CPUTimerMode): void {
    this.mode = mode;
  }

  private incrementTima(): void {
    this.tima = (this.tima + 1) & 0xFF;

    // Triggers interrupt and reset to modulo in case of an overflow
    if (this.tima === 0) {
      if (!this.addressBus) {
        throw new Error('Address bus not found');
      }

      this.addressBus.triggerInterrupt(CPUInterrupt.TIMER);
      this.tima = this.tma;
    }
  }
}

export enum CPUTimerMode {
  HZ_4096 = 0,
  HZ_262144 = 1,
  HZ_65536 = 2,
  HZ_16384 = 3,
}
