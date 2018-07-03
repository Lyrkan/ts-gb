import { AddressBus } from '../address-bus';

export class HDMATransfer {
  private addressBus: AddressBus;
  private mode: HDMA_TRANSFER_MODE;
  private fromAddress: number;
  private toAddress: number;
  private length: number;
  private currentByte: number;
  private ticks: number;
  private stopped: boolean;

  constructor(
    addressBus: AddressBus,
    mode: HDMA_TRANSFER_MODE,
    fromAddress: number,
    toAddress: number,
    length: number,
  ) {
    this.addressBus = addressBus;
    this.mode = mode;
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.length = length;
    this.currentByte = 0;
    this.ticks = 0;
    this.stopped = false;
  }

  public tick(): void {
    // TODO Not sure about timings there...
    if (this.isActive() && ((this.ticks % 2) === 0)) {
      this.addressBus.setByte(
        this.toAddress + this.currentByte,
        this.addressBus.getByte(this.fromAddress + this.currentByte)
      );

      this.currentByte++;
    }

    this.ticks++;
  }

  public stop(): void {
    if (this.mode === HDMA_TRANSFER_MODE.HBLANK) {
      this.stopped = true;
    }
  }

  public isActive(): boolean {
    if (this.isStopped() || this.hasEnded()) {
      return false;
    }

    if (this.mode === HDMA_TRANSFER_MODE.GENERAL_PURPOSE) {
      return true;
    }

    const lcdStatusRegister = this.addressBus.getByte(0xFF41);
    return (lcdStatusRegister & 0b11) === 0;
  }

  public isStopped(): boolean {
    return this.stopped;
  }

  public hasEnded(): boolean {
    return this.currentByte >= this.length;
  }

  public getRemainingLength(): number {
    return this.length - this.currentByte;
  }
}

export enum HDMA_TRANSFER_MODE {
  GENERAL_PURPOSE,
  HBLANK,
}
