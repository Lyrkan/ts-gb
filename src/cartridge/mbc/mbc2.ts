import { IMemorySegment, MemorySegment } from '../../memory/memory-segment';
import { MemorySegmentDecorator } from '../../memory/memory-segment-decorator';
import { AbstractMBC } from './abstract-mbc';
import { CARTRIDGE_ROM_BANK_LENGTH, CARTRIDGE_RAM_BANK_LENGTH } from '../game-cartridge';
import { IGameCartridgeInfo } from '../game-cartridge-info';

export class MBC2 extends AbstractMBC {
  private decoratedRomBanks: IMemorySegment[];
  private decoratedRamBanks: IMemorySegment[];

  private currentRomBank: number;
  private enabledRam: boolean;

  public constructor(
    cartridgeInfo: IGameCartridgeInfo,
    romBanks: IMemorySegment[]
  ) {
    // MBC2 ROMs always have 512x4 bits of RAM
    const ramBanks = [new MemorySegment(512)];
    super(cartridgeInfo, romBanks, ramBanks);

    this.currentRomBank = 1;
    this.enabledRam = true;

    this.decoratedRomBanks = this.romBanks.map(
      (bank, bankIndex) => new MemorySegmentDecorator(bank, {
        setByte: (decorated, offset, value) => {
          if (offset < 0 || offset >= CARTRIDGE_ROM_BANK_LENGTH) {
            throw new RangeError(`Invalid address "${offset}"`);
          }

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
              if (((offset >> 8) & 1) === 1) {
                this.currentRomBank = (value & 0b1111) || 1;
              }
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

        if (offset > 0x1FF) {
          return 0xFF;
        }

        if (!this.enabledRam) {
          return 0xFF;
        }

        return decorated.getByte(offset);
      },
      setByte: (decorated, offset, value) => {
        if (offset < 0 || offset >= CARTRIDGE_RAM_BANK_LENGTH) {
          throw new RangeError(`Invalid address "${offset}"`);
        }

        if (offset > 0x1FF) {
          return;
        }

        if (this.ramChangeListener !== null) {
          this.ramChangeListener(index, offset, value);
        }

        decorated.setByte(offset, value & 0x0F);
      }
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
    const index = (this.currentRomBank > 0) ? this.currentRomBank : 1;
    return this.decoratedRomBanks[index];
  }

  public get ramBank() {
    // Return the current RAM bank no matter what (disabled RAM
    // is handled by a MemorySegmentDecorator).
    return this.decoratedRamBanks[0];
  }
}
