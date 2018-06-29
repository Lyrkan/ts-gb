import { AddressBus, OAM_LENGTH } from './address-bus';

export class DMAHandler {
  private addressBus?: AddressBus;
  private transferInProgress: boolean;
  private fromAddress: number;
  private currentByte: number;

  public startTransfer(addressBus: AddressBus, fromAddress: number) {
    this.addressBus = addressBus;
    this.transferInProgress = true;
    this.fromAddress = fromAddress;
    this.currentByte = 0;
  }

  public tick() {
    if (this.transferInProgress && this.addressBus) {
      this.addressBus.setByte(
        0xFE00 + this.currentByte,
        this.addressBus.getByte(this.fromAddress + this.currentByte)
      );

      this.currentByte++;
      if (this.currentByte > OAM_LENGTH) {
        this.transferInProgress = false;
      }
    }
  }

  public reset() {
    this.addressBus = undefined;
    this.transferInProgress = false;
    this.fromAddress = 0;
    this.currentByte = 0;
  }
}
