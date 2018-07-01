import { AddressBus } from '../address-bus';
import { OAMTransfer } from './oam-transfer';
import { HDMATransfer } from './hdma-transfer';

export class DMAHandler {
  private oamTransfer: OAMTransfer | null;
  private hdmaTransfer: HDMATransfer | null;

  public constructor() {
    this.reset();
  }

  public startOamTransfer(addressBus: AddressBus, fromAddress: number) {
    this.oamTransfer = new OAMTransfer(addressBus, fromAddress);
  }

  public startHdmaTransfer(addressBus: AddressBus, mode: number, length: number) {
    let fromAddress = (addressBus.getByte(0xFF51) << 8) + addressBus.getByte(0xFF52);
    fromAddress &= ~0b1111;

    // Source address must be in the 0x0000-0x7FF0 or 0xA000-0xDFF0 range
    if ((fromAddress > 0x7FF0) && (fromAddress < 0xA000 || fromAddress > 0xDFF0)) {
      throw new Error(`Invalid source address for HDMA transfer: 0x${fromAddress.toString(16)}`);
    }

    let toAddress = (addressBus.getByte(0xFF53) << 8) + addressBus.getByte(0xFF54);
    toAddress &= ~0b1111;
    toAddress &= ~(0b111 << (8 + 5));
    toAddress |= 0x8000;

    // Destination address must be in the 8000-9FF0 range
    if ((toAddress < 0x8000 || toAddress > 0x9FF0)) {
      throw new Error(`Invalid dest address for HDMA transfer: 0x${fromAddress.toString(16)}`);
    }

    // TODO If source/destination addresses are the same than the last call
    // the copy should continue from the last address instead of starting
    // from the source one.

    this.hdmaTransfer = new HDMATransfer(addressBus, mode, fromAddress, toAddress, length);
  }

  public isHdmaTransferActive() {
    return this.hdmaTransfer && this.hdmaTransfer.isActive();
  }

  public getHdmaTransfer() {
    return this.hdmaTransfer;
  }

  public stopHdmaTransfer() {
    this.hdmaTransfer = null;
  }

  public tick() {
    // HDMA Transfer
    if (this.hdmaTransfer) {
      if (this.hdmaTransfer.hasEnded()) {
        this.hdmaTransfer = null;
      } else {
        this.hdmaTransfer.tick();
        return;
      }
    }

    // OAM DMA transfer
    if (this.oamTransfer) {
      if (this.oamTransfer.hasEnded()) {
        this.oamTransfer = null;
      } else {
        this.oamTransfer.tick();
      }
    }
  }

  public reset() {
    this.oamTransfer = null;
    this.hdmaTransfer = null;
  }
}
