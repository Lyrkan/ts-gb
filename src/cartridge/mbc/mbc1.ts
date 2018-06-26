import { IMemorySegment } from '../../memory/memory-segment';
import { MemorySegmentDecorator } from '../../memory/memory-segment-decorator';
import { AbstractMBC } from './abstract-mbc';
import { CARTRIDGE_ROM_BANK_LENGTH, CARTRIDGE_RAM_BANK_LENGTH } from '../game-cartridge';
import { IGameCartridgeInfo } from '../game-cartridge-info';

export class MBC1 extends AbstractMBC {
  private decoratedRomBanks: IMemorySegment[];
  private decoratedRamBanks: IMemorySegment[];

  private currentRomBank: number;
  private currentRamBank: number;

  private enabledRam: boolean;
  private romMode: boolean;

  public constructor(
    cartridgeInfo: IGameCartridgeInfo,
    romBanks: IMemorySegment[],
    ramBanks: IMemorySegment[]
  ) {
    super(cartridgeInfo, romBanks, ramBanks);

    this.currentRomBank = 1;
    this.currentRamBank = 0;
    this.enabledRam = false;
    this.romMode = true;

    this.decoratedRomBanks = this.romBanks.map(
      (bank, bankIndex) => new MemorySegmentDecorator(bank, {
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
            } else if (offset < 0x4000) {
              // ROM Bank switch (lower 5 bits)
              // If the value is equal to 0x00 it is changed
              // to 0x01.
              this.currentRomBank = (this.currentRomBank & ~0b11111) | ((value & 0b11111) || 1);
            }
          } else {
            if (offset < 0x2000) {
              // RAM Bank switch / bits 6 and 7 of ROM bank
              this.currentRamBank = (value & 0b11);
            } else if (offset < 0x4000) {
              // Enable/disable ROM mode
              this.romMode = (value === 0);
            }
          }
        }
      })
    );

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

        if (this.ramChangeListener !== null) {
          this.ramChangeListener(index, offset, value);
        }

        return decorated.setByte(offset, value);
      },
    }));
  }

  public get staticRomBank() {
    // Static ROM bank always targets bank #0
    return this.decoratedRomBanks[0];
  }

  public get switchableRomBank() {
    // Bank #0 cannot be accessed using the switchable bank
    // addresses since it is always available from 0x0000 to
    // 0x3FFF.
    let index = (this.currentRomBank > 0) ? this.currentRomBank : 1;

    // If in ROM mode, use the current RAM bank index for bits 5 and 6
    if (this.romMode) {
      index |= (this.currentRamBank & 0b11) << 5;
    }

    // Avoid out of bounds reads/writes
    index = index % this.decoratedRomBanks.length;

    return this.decoratedRomBanks[index];
  }

  public get ramBank() {
    // Only RAM bank 0 is returned in ROM mode
    return this.romMode ? this.decoratedRamBanks[0] : this.decoratedRamBanks[this.currentRamBank];
  }
}
