import { AddressBus, OAM_LENGTH } from '../address-bus';

export class OAMTransfer {
  private addressBus: AddressBus;
  private fromAddress: number;
  private currentByte: number;
  private ended: boolean;

  constructor(addressBus: AddressBus, fromAddress: number) {
    this.addressBus = addressBus;
    this.fromAddress = fromAddress;
    this.currentByte = 0;
    this.ended = false;
  }

  public tick(): void {
    this.singleTick();

    // The DMA OAM transfer is affected by
    // the double speed mode.
    if (this.addressBus.isDoubleSpeedModeEnabled()) {
      this.singleTick();
    }
  }

  public hasEnded(): boolean {
    return this.ended;
  }

  private singleTick(): void {
    if (!this.ended) {
      this.addressBus.setByte(
        0xFE00 + this.currentByte,
        this.addressBus.getByte(this.fromAddress + this.currentByte)
      );

      this.currentByte++;
      if (this.currentByte >= OAM_LENGTH) {
        this.ended = true;
      }
    }
  }
}
