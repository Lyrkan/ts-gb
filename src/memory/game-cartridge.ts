import { MemorySegment, IMemorySegment } from './memory-segment';

export const CARTRIDGE_ROM_BANK_LENGTH = 16 * 1024;
export const CARTRIDGE_RAM_BANK_LENGTH = 8 * 1024;

export class GameCartridge {
  public readonly cartridgeHeader: GameCartridgeHeader;

  private romBanks: IMemorySegment[];
  private currentRomBank: number;

  private ramBanks: IMemorySegment[];
  private currentRamBank: number;

  public constructor(data: ArrayBuffer) {
    this.romBanks = [];
    this.ramBanks = [];
    this.currentRomBank = 0;
    this.currentRamBank = 0;

    // TODO Load header
    this.cartridgeHeader = {
      gameTitle: 'Foo',
      mbcType: MBC_TYPE.NONE,
      hasRam: true,
      hasTimer: false,
      romSize: 0x00,
      ramSize: 0x02,
    };

    // TODO Create ROM segments and add traps based on MBC
    this.romBanks.push(
      new MemorySegment(CARTRIDGE_ROM_BANK_LENGTH),
      new MemorySegment(CARTRIDGE_ROM_BANK_LENGTH)
    );

    // TODO Create RAM segments based on MBC and add traps if
    // needed(for instance NO_MBC, write = NOP, read = 0xFF)
    this.ramBanks.push(
      new MemorySegment(CARTRIDGE_RAM_BANK_LENGTH)
    );
  }

  public get staticRomBank(): IMemorySegment {
    return this.romBanks[0];
  }

  public get switchableRomBank(): IMemorySegment {
    // The switchable ROM bank never target bank #0 since
    // it is always available from 0x0000 to 0x3FFF.
    const bankIndex = (this.currentRomBank <= 0) ? 1 : this.currentRomBank;
    return this.romBanks[bankIndex];
  }

  public get ramBank(): IMemorySegment {
    return this.ramBanks[this.currentRamBank];
  }

  public reset() {
    for (const bank of this.ramBanks) {
      for (let i = 0; i < CARTRIDGE_RAM_BANK_LENGTH; i++) {
        bank[i].byte = 0x00;
      }
    }
  }
}

enum MBC_TYPE {
  NONE,
  MBC1,
  MBC2,
  MBC3,
  MBC5
}

interface GameCartridgeHeader {
  gameTitle: string;
  mbcType: MBC_TYPE;
  hasRam: boolean;
  hasTimer: boolean;
  romSize: number;
  ramSize: number;
}
