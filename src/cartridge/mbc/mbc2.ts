import { IGameCartridgeMBC, CARTRIDGE_ROM_BANK_LENGTH } from '../game-cartridge';
import { IMemorySegment } from '../../memory/memory-segment';
import { MemorySegmentDecorator } from '../../memory/memory-segment-decorator';
import { MemoryAccessorDecorator } from '../../memory/memory-accessor-decorator';

export class MBC2 implements IGameCartridgeMBC {
  private romBanks: IMemorySegment[];
  private ramBanks: IMemorySegment[];

  private currentRomBank: number;
  private currentRamBank: number;

  private enabledRam: boolean;

  public constructor(romBanks: IMemorySegment[], ramBanks: IMemorySegment[]) {
    this.currentRomBank = 1;
    this.currentRamBank = 0;

    this.enabledRam = true;

    // Create a trap that will be called when something
    // tries to write into the ROM banks.
    const romWriteTrap = (bankIndex: number, offset: number, value: number) => {
      // Only keep the 8 lower bits so we have the
      // same behavior between .byte and .word
      value = value & 0xFF;

      // Only addresses from 0x0000 to 0x3FFF (bank #0)
      // have an effect.
      if (bankIndex === 0) {
        if (offset < 0x2000) {
          // Enable/disable RAM
          // Should only work if the least significant bit
          // of the upper address is set to 0.
          if (((0 >> 8) & 1) === 0) {
            this.enabledRam = (value & 0b1111) === 0x0A;
          }
        } else if (offset < 0x4000) {
          // ROM Bank switch
          // If the value is equal to 0x00 it is changed
          // to 0x01.
          // Should only work if the least significant bit
          // of the upper address is set to 1.
          if (((0 >> 8) & 1) === 1) {
            this.currentRomBank = (value & 0b1111) || 1;
          }
        }
      }
    };

    this.romBanks = romBanks.map((bank, index) => new MemorySegmentDecorator(
      bank,
      (obj, offset) => {
        if (offset < 0 || offset >= CARTRIDGE_ROM_BANK_LENGTH) {
          throw new RangeError(`Invalid address "${offset}"`);
        }

        return new MemoryAccessorDecorator(obj.get(offset), {
          setByte: (decorated, value) => { romWriteTrap(index, offset, value); },
          setWord: (decorated, value) => { romWriteTrap(index, offset, value); }
        });
      }
    ));

    this.ramBanks = ramBanks.map(bank => new MemorySegmentDecorator(bank, (obj, offset) => {
      // If RAM is not enabled return a static accessor
      if (!this.enabledRam) {
        return { byte: 0xFF, word: 0xFFFF };
      }

      // Only the lower 4 bits are used
      return obj.get(offset);
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
