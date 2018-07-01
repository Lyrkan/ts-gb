import { AddressBus, OAM_LENGTH } from '../address-bus';

export class OAMTransfer {
  private addressBus: AddressBus;
  private fromAddress: number;
  private currentByte: number;
  private transferEnded: boolean;

  constructor(addressBus: AddressBus, fromAddress: number) {
    this.addressBus = addressBus;
    this.fromAddress = fromAddress;
    this.currentByte = 0;
    this.transferEnded = false;
  }

  public tick() {
    if (!this.transferEnded) {
      this.addressBus.setByte(
        0xFE00 + this.currentByte,
        this.addressBus.getByte(this.fromAddress + this.currentByte)
      );

      this.currentByte++;
      if (this.currentByte > OAM_LENGTH) {
        this.transferEnded = true;
      }
    }
  }

  public hasTransferEnded() {
    return this.transferEnded;
  }
}
