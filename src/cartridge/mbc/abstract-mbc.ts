import { IMemorySegment } from '../../memory/segments/memory-segment';
import { IGameCartridgeInfo } from '../game-cartridge-info';
import { CARTRIDGE_RAM_BANK_LENGTH, OnRamChangedCallback } from '../game-cartridge';

export abstract class AbstractMBC implements IGameCartridgeMBC {
  protected cartridgeInfo: IGameCartridgeInfo;
  protected romBanks: IMemorySegment[];
  protected ramBanks: IMemorySegment[];
  protected ramChangeListener: OnRamChangedCallback | null;

  public constructor(
    cartridgeInfo: IGameCartridgeInfo,
    romBanks: IMemorySegment[],
    ramBanks: IMemorySegment[]
  ) {
    this.cartridgeInfo = cartridgeInfo;
    this.romBanks = romBanks;
    this.ramBanks = ramBanks;
    this.ramChangeListener = null;
  }

  public getRamContent(): Uint8Array {
    const buffer = new Uint8Array(CARTRIDGE_RAM_BANK_LENGTH * this.ramBanks.length);

    for (let bankIndex = 0; bankIndex < this.ramBanks.length; bankIndex++) {
      for (let offset = 0; offset < CARTRIDGE_RAM_BANK_LENGTH; offset++) {
        // tslint:disable-next-line:max-line-length
        buffer[bankIndex * CARTRIDGE_RAM_BANK_LENGTH + offset] = this.ramBanks[bankIndex].getByte(offset);
      }
    }

    return buffer;
  }

  public loadRamContent(data: Uint8Array) {
    const expectedLength = CARTRIDGE_RAM_BANK_LENGTH * this.ramBanks.length;
    if (data.length !== expectedLength) {
      throw new Error(`Invalid data length: ${data.length} (expected ${expectedLength})`);
    }

    for (let bankIndex = 0; bankIndex < this.ramBanks.length; bankIndex++) {
      for (let offset = 0; offset < CARTRIDGE_RAM_BANK_LENGTH; offset++) {
        // tslint:disable-next-line:max-line-length
        this.ramBanks[bankIndex].setByte(offset, data[bankIndex * CARTRIDGE_RAM_BANK_LENGTH + offset]);
      }
    }
  }

  public setRamChangedListener(ramChangeListener: OnRamChangedCallback | null) {
    this.ramChangeListener = ramChangeListener;
  }

  public abstract get staticRomBank(): IMemorySegment;
  public abstract get switchableRomBank(): IMemorySegment;
  public abstract get ramBank(): IMemorySegment;
}

export interface IGameCartridgeMBC {
  staticRomBank: IMemorySegment;
  switchableRomBank: IMemorySegment;
  ramBank: IMemorySegment;
  getRamContent(): Uint8Array;
  loadRamContent(data: Uint8Array): void;
  setRamChangedListener(callback: OnRamChangedCallback | null): void;
}
