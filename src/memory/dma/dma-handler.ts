import { AddressBus } from '../address-bus';
import { OAMTransfer } from './oam-transfer';
import { HDMATransfer, HDMA_TRANSFER_MODE } from './hdma-transfer';

/**
 * This class allows to control both OAM and
 * HDMA transfers.
 */
export class DMAHandler {
  private oamTransfer: OAMTransfer | null;
  private hdmaTransfer: HDMATransfer | null;

  public constructor() {
    this.reset();
  }

  /**
   * Start a new OAM transfer.
   *
   * @param addressBus The memory unit
   * @param fromAddress Starting address for the copy (minus 0xFE00)
   */
  public startOamTransfer(addressBus: AddressBus, fromAddress: number) {
    this.oamTransfer = new OAMTransfer(addressBus, fromAddress);
  }

  /**
   * Start a new HDMA transfer.
   *
   * @param addressBus The memory unit
   * @param mode Which mode the HDMA transfer should use
   * @param length Amount of data that should be copied
   */
  public startHdmaTransfer(addressBus: AddressBus, mode: HDMA_TRANSFER_MODE, length: number) {
    let fromAddress = (addressBus.getByte(0xFF51) << 8) | addressBus.getByte(0xFF52);
    fromAddress &= ~0b1111;

    // Source address must be in the 0x0000-0x7FF0 or 0xA000-0xDFF0 range
    if ((fromAddress > 0x7FF0) && (fromAddress < 0xA000 || fromAddress > 0xDFF0)) {
      throw new Error(`Invalid source address for HDMA transfer: 0x${fromAddress.toString(16)}`);
    }

    let toAddress = (addressBus.getByte(0xFF53) << 8) | addressBus.getByte(0xFF54);
    toAddress &= ~0b1111;
    toAddress &= ~(0b111 << (8 + 5));
    toAddress += 0x8000;

    // Destination address must be in the 8000-9FF0 range
    if ((toAddress < 0x8000 || toAddress > 0x9FF0)) {
      throw new Error(`Invalid dest address for HDMA transfer: 0x${fromAddress.toString(16)}`);
    }

    this.hdmaTransfer = new HDMATransfer(addressBus, mode, fromAddress, toAddress, length);
  }

  /**
   * Return the current HDMA transfer if there
   * is one.
   */
  public getHdmaTransfer(): HDMATransfer | null {
    return this.hdmaTransfer;
  }

  /**
   * Check if there is a HDMA transfer and if is
   * still active.
   */
  public isHdmaTransferActive(): boolean {
    return (this.hdmaTransfer !== null) && this.hdmaTransfer.isActive();
  }

  /**
   * Execute a single tick of the current OAM or
   * HDMA transfer if there is one.
   *
   * It must be called once every cycle (1MHz frequency)
   * regardless of CPU double speed activation.
   */
  public tick(): void {
    // HDMA Transfer
    if (this.hdmaTransfer && this.hdmaTransfer.isActive()) {
      this.hdmaTransfer.tick();
      return;
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
