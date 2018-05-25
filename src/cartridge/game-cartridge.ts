import { MemorySegment, IMemorySegment } from '../memory/memory-segment';
import { STATIC_FFFF_SEGMENT } from '../memory/static-memory-segment';
import { MBC1 } from './mbc/mbc1';
import { MBC2 } from './mbc/mbc2';

export class GameCartridge {
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

        banks[i][j].byte = dataView.getUint8((i * CARTRIDGE_ROM_BANK_LENGTH) + j);
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
        return {
          staticRomBank: romBanks[0],
          switchableRomBank: romBanks[1],
          ramBank: ramBanks[0],
        };
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
  public readonly mbc: IGameCartridgeMBC;

  public constructor(data: ArrayBuffer) {
    // Load infos from header
    this.cartridgeInfo = GameCartridge.readCartridgeInfo(data);

    // Initialize the MBC if there is one
    this.mbc = GameCartridge.createMBC(
      this.cartridgeInfo,
      GameCartridge.createRomBanks(this.cartridgeInfo, data),
      GameCartridge.createRamBanks(this.cartridgeInfo)
    );
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
    if (this.mbc.reset) {
      this.mbc.reset();
    }
  }
}

enum MBC_TYPE {
  NONE = 'NONE',
  MBC1 = 'MBC1',
  MBC2 = 'MBC2',
  MBC3 = 'MBC3',
  MBC5 = 'MBC5',
}

export const CARTRIDGE_ROM_BANK_LENGTH = 16 * 1024;
export const CARTRIDGE_RAM_BANK_LENGTH = 8 * 1024;

const CARTRIDGE_INFO_MAP: { [index: number]: IPartialCartridgeInfo } = {
  0x00: { mbcType: MBC_TYPE.NONE, hasRam: false, hasTimer: false, hasRumble: false },
  0x01: { mbcType: MBC_TYPE.MBC1, hasRam: false, hasTimer: false, hasRumble: false },
  0x02: { mbcType: MBC_TYPE.MBC1, hasRam: true, hasTimer: false, hasRumble: false },
  0x03: { mbcType: MBC_TYPE.MBC1, hasRam: true, hasTimer: false, hasRumble: false },
  0x05: { mbcType: MBC_TYPE.MBC2, hasRam: false, hasTimer: false, hasRumble: false },
  0x06: { mbcType: MBC_TYPE.MBC2, hasRam: true, hasTimer: false, hasRumble: false },
  0x08: { mbcType: MBC_TYPE.NONE, hasRam: true, hasTimer: false, hasRumble: false },
  0x09: { mbcType: MBC_TYPE.NONE, hasRam: true, hasTimer: false, hasRumble: false },
  0x0F: { mbcType: MBC_TYPE.MBC3, hasRam: false, hasTimer: true, hasRumble: false },
  0x10: { mbcType: MBC_TYPE.MBC3, hasRam: true, hasTimer: true, hasRumble: false },
  0x11: { mbcType: MBC_TYPE.MBC3, hasRam: false, hasTimer: false, hasRumble: false },
  0x12: { mbcType: MBC_TYPE.MBC3, hasRam: true, hasTimer: false, hasRumble: false },
  0x13: { mbcType: MBC_TYPE.MBC3, hasRam: true, hasTimer: false, hasRumble: false },
  0x19: { mbcType: MBC_TYPE.MBC5, hasRam: false, hasTimer: false, hasRumble: false },
  0x1A: { mbcType: MBC_TYPE.MBC5, hasRam: true, hasTimer: false, hasRumble: false },
  0x1B: { mbcType: MBC_TYPE.MBC5, hasRam: true, hasTimer: false, hasRumble: false },
  0x1C: { mbcType: MBC_TYPE.MBC5, hasRam: false, hasTimer: false, hasRumble: false },
  0x1D: { mbcType: MBC_TYPE.MBC5, hasRam: false, hasTimer: false, hasRumble: true },
  0x1E: { mbcType: MBC_TYPE.MBC5, hasRam: false, hasTimer: false, hasRumble: true },
};

const CARTRIDGE_RAM_MAP: { [index: number]: number } = {
  0x00: 0, // No RAM
  0x01: 1024 * 2, // 2KB
  0x02: 1024 * 8, // 8KB
  0x03: 1024 * 32, // 32KB
  0x04: 1024 * 128, // 128KB
  0x05: 1024 * 64, // 64KB
};

interface IPartialCartridgeInfo {
  mbcType: MBC_TYPE;
  hasRam: boolean;
  hasTimer: boolean;
  hasRumble: boolean;
}

interface IGameCartridgeInfo extends IPartialCartridgeInfo {
  gameTitle: string;
  romSize: number;
  ramSize: number;
}

export interface IGameCartridgeMBC {
  staticRomBank: IMemorySegment;
  switchableRomBank: IMemorySegment;
  ramBank: IMemorySegment;
  reset?: () => void;
}
