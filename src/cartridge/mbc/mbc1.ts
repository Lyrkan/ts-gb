import { IGameCartridgeMBC, CARTRIDGE_ROM_BANK_LENGTH } from '../game-cartridge';
import { IMemorySegment } from '../../memory/memory-segment';
import { MemorySegmentDecorator } from '../../memory/memory-segment-decorator';
import { isIntegerPropertyKey } from '../../memory/utils';

export class MBC1 implements IGameCartridgeMBC {
  private romBanks: IMemorySegment[];
  private ramBanks: IMemorySegment[];

  private currentRomBank: number;
  private currentRamBank: number;

  private enabledRam: boolean;
  private romMode: boolean;

  public constructor(romBanks: IMemorySegment[], ramBanks: IMemorySegment[]) {
    this.currentRomBank = 1;
    this.currentRamBank = 0;

    this.enabledRam = true;
    this.romMode = true;

    // Create a trap that will be called when something
    // tries to write into the ROM banks.
    const romWriteTrap = (bankIndex: number, offset: number, value: number) => {
      // Only keep the 8 lower bits so we have the
      // same behavior between .byte and .word
      value = value & 0xFF;

      // Change the behavior based on whether the
      // write occurs on the static or the switchable
      // banks.
      if (bankIndex === 0) {
        if (offset < 0x2000) {
          // Enable/disable RAM
          this.enabledRam = (value & 0b1111) === 0x0A;
        } else if (offset < 0x4000) {
          // ROM Bank switch (lower 5 bits)
          // If the value is equal to 0x00 it is changed
          // to 0x01.
          this.currentRomBank = (this.currentRomBank & ~0b11111) | ((value || 1) & 0b11111);
        }
      } else {
        if (offset < 0x2000) {
          // RAM Bank switch / bits 6 and 7 of ROM bank
          if (this.enabledRam) {
            this.currentRamBank = (value & 0b11);
          } else {
            this.currentRomBank = (this.currentRomBank & ~(0b11 << 5)) | ((value & 0b11) << 5);
          }
        } else if (offset < 0x4000) {
          // Enable/disable ROM mode
          this.romMode = !(value & 1);

          // If we are in RAM mode, remove bits 6 and 7
          // of the current ROM bank.
          if (!this.romMode) {
            this.currentRomBank = this.currentRomBank & ~(0b11 << 5);
          }
        }
      }
    };

    this.romBanks = romBanks.map((bank, index) => new MemorySegmentDecorator(bank, (obj, prop) => {
      if (isIntegerPropertyKey(prop)) {
        const offset = parseInt(prop as string, 10);

        if (offset < 0 || offset >= CARTRIDGE_ROM_BANK_LENGTH) {
          throw new TypeError(`Invalid address "${prop}"`);
        }

        return {
          // Get operations stay the same
          get byte() { return obj[prop as any].byte; },
          get word() { return obj[prop as any].word; },

          // Set operations are trapped
          set byte(value: number) {
            romWriteTrap(index, offset, value);
          },

          set word(value: number) {
            romWriteTrap(index, offset, value);
          },
        };
      }

      return obj[prop as any];
    }));

    this.ramBanks = ramBanks.map(bank => new MemorySegmentDecorator(bank, (obj, prop) => {
      if (isIntegerPropertyKey(prop)) {
        // If RAM is not enabled return a static accessor
        if (!this.enabledRam) {
          return { byte: 0xFF, word: 0xFFFF };
        }
      }

      return obj[prop as any];
    }));
  }

  public get staticRomBank() {
    // Static ROM bank always targets bank #0
    return this.romBanks[0];
  }

  public get switchableRomBank() {
    // Bank #0 cannot be accessed using the switchable bank
    // addresses since it is always available from 0x0000 to
    // 0x3FFF.
    const index = (this.currentRomBank > 0) ? this.currentRomBank : 1;
    return this.romBanks[index];
  }

  public get ramBank() {
    // Return the current RAM bank no matter what (disabled RAM
    // is handled by a MemorySegmentDecorator).
    return this.ramBanks[this.currentRamBank];
  }
}
