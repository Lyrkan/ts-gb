import { MemorySegment, IMemorySegment } from '../memory/memory-segment';
import { STATIC_FFFF_SEGMENT } from '../memory/static-memory-segment';
import { NoMBC } from './mbc/no-mbc';
import { MBC1 } from './mbc/mbc1';
import { MBC2 } from './mbc/mbc2';
import { IGameCartridgeInfo, CARTRIDGE_INFO_MAP, MBC_TYPE } from './game-cartridge-info';

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

        banks[i].get(j).byte = dataView.getUint8((i * CARTRIDGE_ROM_BANK_LENGTH) + j);
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
      // If there is no MBC, directly use all the
      // banks created above
      case MBC_TYPE.NONE:
        return new NoMBC(romBanks, ramBanks);
      case MBC_TYPE.MBC1:
        return new MBC1(romBanks, ramBanks);
      case MBC_TYPE.MBC2:
        return new MBC2(romBanks, ramBanks);
      case MBC_TYPE.MBC3:
        throw new Error('MBC Type 3 is not implemented yet');
      case MBC_TYPE.MBC5:
        throw new Error('MBC Type 5 is not implemented yet');
    }

    throw new Error(`MBC type ${cartridgeInfo.mbcType} is not implemented yet`);
  }

  public readonly cartridgeInfo: IGameCartridgeInfo;
  private data: ArrayBuffer;
  private mbc: IGameCartridgeMBC;

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
    // Initialize a new MBC
    this.mbc = GameCartridge.createMBC(
      this.cartridgeInfo,
      GameCartridge.createRomBanks(this.cartridgeInfo, this.data),
      GameCartridge.createRamBanks(this.cartridgeInfo)
    );
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
}

export interface IGameCartridgeMBC {
  staticRomBank: IMemorySegment;
  switchableRomBank: IMemorySegment;
  ramBank: IMemorySegment;
}
