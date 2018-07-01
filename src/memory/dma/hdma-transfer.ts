import { AddressBus } from '../address-bus';

export class HDMATransfer {
  private addressBus: AddressBus;
  private mode: HDMA_TRANSFER_MODE;
  private fromAddress: number;
  private toAddress: number;
  private length: number;
  private currentByte: number;
  private ended: boolean;
  private ticks: number;

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
    this.ended = false;
    this.ticks = 0;
  }

  public tick(): void {
    // TODO Not sure about timings there...
    if (this.isActive() && ((this.ticks % 2) === 0)) {
      this.addressBus.setByte(
        this.toAddress + this.currentByte,
        this.addressBus.getByte(this.fromAddress + this.currentByte)
      );

      this.currentByte++;

      if (this.currentByte > length) {
        this.ended = true;
      }
    }

    this.ticks++;
  }

  public isActive(): boolean {
    if (this.ended) {
      return false;
    }

    if (this.mode === HDMA_TRANSFER_MODE.GENERAL_PURPOSE) {
      return true;
    }

    const lcdStatusRegister = this.addressBus.getByte(0xFF41);
    return (lcdStatusRegister & 0b11) === 0;
  }

  public hasEnded(): boolean {
    return this.ended;
  }

  public getRemainingLength(): number {
    return this.length - this.currentByte;
  }

  public getMode(): HDMA_TRANSFER_MODE {
    return this.mode;
  }

  public restart(): void {
    this.currentByte = 0;
    this.ended = false;
    this.ticks = 0;
  }
}

export enum HDMA_TRANSFER_MODE {
  GENERAL_PURPOSE,
  HBLANK,
}
