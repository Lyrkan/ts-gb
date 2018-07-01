import { IMemorySegment } from '../../memory/segments/memory-segment';
import { MemorySegmentDecorator } from '../../memory/segments/memory-segment-decorator';
import { AbstractMBC } from './abstract-mbc';
import { CARTRIDGE_ROM_BANK_LENGTH, CARTRIDGE_RAM_BANK_LENGTH } from '../game-cartridge';
import { IGameCartridgeInfo } from '../game-cartridge-info';

export class MBC5 extends AbstractMBC {
  private decoratedStaticRomBank: IMemorySegment;
  private decoratedRomBanks: IMemorySegment[];
  private decoratedRamBanks: IMemorySegment[];

  private currentRomBank: number;
  private currentRamBank: number;

  private enabledRam: boolean;

  public constructor(
    cartridgeInfo: IGameCartridgeInfo,
    romBanks: IMemorySegment[],
    ramBanks: IMemorySegment[]
  ) {
    super(cartridgeInfo, romBanks, ramBanks);

    this.currentRomBank = 0;
    this.currentRamBank = 0;
    this.enabledRam = false;

    this.decoratedStaticRomBank = new MemorySegmentDecorator(this.romBanks[0], {
      setByte: (decorated, offset, value) => {
        if (offset < 0 || offset >= CARTRIDGE_ROM_BANK_LENGTH) {
          throw new RangeError(`Invalid address "${offset}"`);
        }

        if (offset < 0x2000) {
          // Enable/disable RAM
          this.enabledRam = (value === 0x0A);
        } else if (offset < 0x3000) {
          // ROM Bank switch (lower 8 bits)
          this.currentRomBank = (this.currentRomBank & (~0xFF)) | (value & 0xFF);
        } else if (offset < 0x4000) {
          // ROM Bank switch (9th bith)
          this.currentRomBank = (this.currentRomBank & 0xFF) | (value & 1) << 7;
        }
      }
    });

    this.decoratedRomBanks = this.romBanks.map(bank => new MemorySegmentDecorator(bank, {
      setByte: (decorated, offset, value) => {
        if (offset < 0 || offset >= CARTRIDGE_ROM_BANK_LENGTH) {
          throw new RangeError(`Invalid address "${offset}"`);
        }

        if (offset < 0x2000) {
          // RAM Bank switch
          if (value <= 0x0F) {
            this.currentRamBank = value;
          }
        }
      }
    }));

    this.decoratedRamBanks = this.ramBanks.map((bank, index) => new MemorySegmentDecorator(bank, {
      getByte: (decorated, offset) => {
        if (offset < 0 || offset >= CARTRIDGE_RAM_BANK_LENGTH) {
          throw new RangeError(`Invalid address "${offset}"`);
        }

        // Always return 0xFF if RAM isn't enabled
        if (!this.enabledRam) {
          return 0xFF;
        }

        return decorated.getByte(offset);
      },
      setByte: (decorated, offset, value) => {
        if (offset < 0 || offset >= CARTRIDGE_RAM_BANK_LENGTH) {
          throw new RangeError(`Invalid address "${offset}"`);
        }

        // Don't write anything if RAM isn't enabled
        if (!this.enabledRam) {
          return;
        }

        this.notifyRamChanged(index, offset, value);
        return decorated.setByte(offset, value);
      },
    }));
  }

  public get staticRomBank() {
    return this.decoratedStaticRomBank;
  }

  public get switchableRomBank() {
    return this.decoratedRomBanks[this.currentRomBank];
  }

  public get ramBank() {
    return this.decoratedRamBanks[this.currentRamBank];
  }
}
