import { AddressBus } from '../address-bus';
import { OAMTransfer } from './oam-transfer';

export class DMAHandler {
  private oamTransfer: OAMTransfer | null;

  public constructor() {
    this.reset();
  }

  public startOamTransfer(addressBus: AddressBus, fromAddress: number) {
    this.oamTransfer = new OAMTransfer(addressBus, fromAddress);
  }

  public tick() {
    if (this.oamTransfer) {
      if (this.oamTransfer.hasTransferEnded()) {
        this.oamTransfer = null;
      } else {
        this.oamTransfer.tick();
      }
    }
  }

  public reset() {
    this.oamTransfer = null;
  }
}
