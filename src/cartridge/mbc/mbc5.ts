import { IMemorySegment } from '../../memory/memory-segment';
import { MemorySegmentDecorator } from '../../memory/memory-segment-decorator';
import {
  IGameCartridgeMBC,
  CARTRIDGE_ROM_BANK_LENGTH,
  CARTRIDGE_RAM_BANK_LENGTH
} from '../game-cartridge';

export class MBC5 implements IGameCartridgeMBC {
  private romBanks: IMemorySegment[];
  private ramBanks: IMemorySegment[];

  private currentRomBank: number;
  private currentRamBank: number;

  private enabledRam: boolean;

  public constructor(romBanks: IMemorySegment[], ramBanks: IMemorySegment[]) {
    this.currentRomBank = 0;
    this.currentRamBank = 0;

    this.enabledRam = false;

    this.romBanks = romBanks.map((bank, bankIndex) => new MemorySegmentDecorator(bank, {
      setByte: (decorated, offset, value) => {
        if (offset < 0 || offset >= CARTRIDGE_ROM_BANK_LENGTH) {
          throw new RangeError(`Invalid address "${offset}"`);
        }

        // Change the behavior based on whether the
        // write occurs on the static or the switchable
        // banks.
        if (bankIndex === 0) {
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
        } else {
          if (offset < 0x2000) {
            // RAM Bank switch
            if (value <= 0x0F) {
              this.currentRamBank = value;
            }
          }
        }
      }
    }));

    this.ramBanks = ramBanks.map(bank => new MemorySegmentDecorator(bank, {
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

        return decorated.setByte(offset, value);
      },
    }));
  }

  public get staticRomBank() {
    // Static ROM bank always targets bank #0
    return this.romBanks[0];
  }

  public get switchableRomBank() {
    return this.romBanks[this.currentRomBank];
  }

  public get ramBank() {
    return this.ramBanks[this.currentRamBank];
  }
}
