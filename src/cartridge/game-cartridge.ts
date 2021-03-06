import { MemorySegment, IMemorySegment } from '../memory/segments/memory-segment';
import { STATIC_FFFF_SEGMENT } from '../memory/segments/static-memory-segment';
import { IGameCartridgeInfo, CARTRIDGE_INFO_MAP, MBC_TYPE } from './game-cartridge-info';
import { IGameCartridgeMBC } from './mbc/abstract-mbc';
import { NoMBC } from './mbc/no-mbc';
import { MBC1 } from './mbc/mbc1';
import { MBC2 } from './mbc/mbc2';
import { MBC3 } from './mbc/mbc3';
import { MBC5 } from './mbc/mbc5';

export class GameCartridge implements IGameCartridge {
  public static readCartridgeInfo(data: ArrayBuffer): IGameCartridgeInfo {
    const dataView = new DataView(data);

    // Retrieve game title
    const titleCodes: number[] = [];
    for (let offset = 0x0134; offset < 0x0144; offset++) {
      const characterCode = dataView.getUint8(offset);
      if (characterCode === 0x00) {
        break;
      }

      titleCodes.push(characterCode);
    }

    // Retrieve MBC type, RAM flag and timer flag
    const cartridgeType = dataView.getUint8(0x0147);
    const partialCartridgeInfo = CARTRIDGE_INFO_MAP[cartridgeType];
    if (!partialCartridgeInfo) {
      throw new Error(`Unsupported cartridge type ${cartridgeType}`);
    }

    // Build info object
    return {
      gameTitle: String.fromCharCode(...titleCodes),
      cgbFlag: dataView.getUint8(0x143),
      romSize: (32 << dataView.getUint8(0x0148)) * 1024,
      ramSize: CARTRIDGE_RAM_MAP[dataView.getUint8(0x0149)],
      ...partialCartridgeInfo,
    };
  }

  public static createRomBanks(
    cartridgeInfo: IGameCartridgeInfo,
    data: ArrayBuffer
  ): IMemorySegment[] {
    const dataView = new DataView(data);
    const banks: IMemorySegment[] = [];
    const banksCount = Math.ceil(cartridgeInfo.romSize / CARTRIDGE_ROM_BANK_LENGTH);

    for (let i = 0; i < banksCount; i++) {
      banks.push(new MemorySegment(CARTRIDGE_ROM_BANK_LENGTH));
    }

    // This should never happen but make sure that we
    // have at least two rom banks...
    while (banks.length < 2) {
      banks.push(STATIC_FFFF_SEGMENT);
    }

    // Load data
    for (let i = 0; i < banks.length; i++) {
      for (let j = 0; j < CARTRIDGE_ROM_BANK_LENGTH; j++) {
        // Should never happen if the ROM has the right size
        if ((i * CARTRIDGE_ROM_BANK_LENGTH) + j >= data.byteLength) {
          break;
        }

        banks[i].setByte(j, dataView.getUint8((i * CARTRIDGE_ROM_BANK_LENGTH) + j));
      }
    }

    return banks;
  }

  public static createRamBanks(cartridgeInfo: IGameCartridgeInfo): IMemorySegment[] {
    const banks: IMemorySegment[] = [];
    const banksCount = Math.ceil(cartridgeInfo.ramSize / CARTRIDGE_RAM_BANK_LENGTH);

    for (let i = 0; i < banksCount; i++) {
      banks.push(new MemorySegment(CARTRIDGE_RAM_BANK_LENGTH));
    }

    // If we don't have any RAM bank, create a static one that
    // always returns 0xFF/0xFFFF
    if (banks.length === 0) {
      banks.push(STATIC_FFFF_SEGMENT);
    }

    return banks;
  }

  public static createMBC(
    cartridgeInfo: IGameCartridgeInfo,
    romBanks: IMemorySegment[],
    ramBanks: IMemorySegment[]
  ): IGameCartridgeMBC {
    switch (cartridgeInfo.mbcType) {
      case MBC_TYPE.NONE:
        return new NoMBC(cartridgeInfo, romBanks, ramBanks);
      case MBC_TYPE.MBC1:
        return new MBC1(cartridgeInfo, romBanks, ramBanks);
      case MBC_TYPE.MBC2:
        return new MBC2(cartridgeInfo, romBanks);
      case MBC_TYPE.MBC3:
        return new MBC3(cartridgeInfo, romBanks, ramBanks);
      case MBC_TYPE.MBC5:
        return new MBC5(cartridgeInfo, romBanks, ramBanks);
    }

    throw new Error(`MBC type ${cartridgeInfo.mbcType} is not implemented yet`);
  }

  public readonly cartridgeInfo: IGameCartridgeInfo;
  private data: ArrayBuffer;
  private mbc: IGameCartridgeMBC;
  private ramChangedListener: OnRamChangedCallback | null;

  public constructor(data: ArrayBuffer) {
    // Save initial data so we can reset te whole thing later on
    this.data = data.slice(0);

    // Load infos from the header
    this.cartridgeInfo = GameCartridge.readCartridgeInfo(data);

    // Load data
    this.reset();
  }

  public get staticRomBank(): IMemorySegment {
    return this.mbc.staticRomBank;
  }

  public get switchableRomBank(): IMemorySegment {
    return this.mbc.switchableRomBank;
  }

  public get ramBank(): IMemorySegment {
    return this.mbc.ramBank;
  }

  public reset(): void {
    // Save previous RAM content if there is
    // a MBC and it has a battery.
    let previousRamContent: Uint8Array | null = null;
    if (this.mbc && this.cartridgeInfo.hasBattery) {
      previousRamContent = this.mbc.getRamContent();
    }

    // Initialize a new MBC
    this.mbc = GameCartridge.createMBC(
      this.cartridgeInfo,
      GameCartridge.createRomBanks(this.cartridgeInfo, this.data),
      GameCartridge.createRamBanks(this.cartridgeInfo)
    );

    // Restore RAM content if available
    if (previousRamContent) {
      this.mbc.loadRamContent(previousRamContent);
    }

    this.mbc.setRamChangedListener(this.ramChangedListener);
  }

  public getRamContent() {
    return this.mbc.getRamContent();
  }

  public loadRamContent(data: Uint8Array) {
    this.mbc.loadRamContent(data);
  }

  public setRamChangedListener(ramChangedListener: OnRamChangedCallback | null) {
    this.ramChangedListener = ramChangedListener;
    this.mbc.setRamChangedListener(ramChangedListener);
  }
}

export const CARTRIDGE_ROM_BANK_LENGTH = 16 * 1024;
export const CARTRIDGE_RAM_BANK_LENGTH = 8 * 1024;

export const CARTRIDGE_RAM_MAP: { [index: number]: number } = {
  0x00: 0, // No RAM
  0x01: 1024 * 2, // 2KB
  0x02: 1024 * 8, // 8KB
  0x03: 1024 * 32, // 32KB
  0x04: 1024 * 128, // 128KB
  0x05: 1024 * 64, // 64KB
};

export interface IGameCartridge {
  cartridgeInfo: IGameCartridgeInfo;
  staticRomBank: IMemorySegment ;
  switchableRomBank: IMemorySegment;
  ramBank: IMemorySegment;
  reset(): void;
  getRamContent(): Uint8Array;
  loadRamContent(data: Uint8Array): void;
  setRamChangedListener(callback: OnRamChangedCallback | null): void;
}

export type OnRamChangedCallback = (bankIndex: number, offset: number, value: number) => void;
