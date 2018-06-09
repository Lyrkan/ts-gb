import { IGameCartridgeMBC, CARTRIDGE_ROM_BANK_LENGTH } from '../game-cartridge';
import { IMemorySegment } from '../../memory/memory-segment';
import { MemorySegmentDecorator } from '../../memory/memory-segment-decorator';
import { MemoryAccessorDecorator } from '../../memory/memory-accessor-decorator';
import { STATIC_0000_ACCESSOR, STATIC_FFFF_ACCESSOR } from '../../memory/static-memory-accessor';

export class MBC3 implements IGameCartridgeMBC {
  private romBanks: IMemorySegment[];
  private ramBanks: IMemorySegment[];

  private currentRomBank: number;
  private currentRamBank: number;

  private enabledRam: boolean;
  private hasRtc: boolean;
  private rtcMode: boolean;

  public constructor(romBanks: IMemorySegment[], ramBanks: IMemorySegment[], hasRtc: boolean) {
    this.currentRomBank = 1;
    this.currentRamBank = 0;
    this.hasRtc = hasRtc;
    this.rtcMode = false;

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
          // ROM Bank switch (7-bits value)
          // If the value is equal to 0x00 it is changed
          // to 0x01.
          this.currentRomBank = ((value || 1) & 0xA7);
        }
      } else {
        if (offset < 0x4000) {
          if (!this.hasRtc || (value >= 0x0 && value < 0x4)) {
            // RAM Bank switch (2-bits value)
            this.currentRamBank = value & 0b11;
            this.rtcMode = false;
          } else if (value >= 0x8 && value <= 0xC) {
            // Switch to RTC-mode
            this.rtcMode = true;
          }
        }
      }
    };

    this.romBanks = romBanks.map((bank, index) => new MemorySegmentDecorator(
      bank,
      (obj, offset: number) => {
        if (offset < 0 || offset >= CARTRIDGE_ROM_BANK_LENGTH) {
          throw new RangeError(`Invalid address "${offset}"`);
        }

        return new MemoryAccessorDecorator(obj.get(offset), {
          setByte: (decorated, value) => { romWriteTrap(index, offset, value); },
          setWord: (decorated, value) => { romWriteTrap(index, offset, value); },
        });
      })
    );

    const rtcAccessor = new MemoryAccessorDecorator(STATIC_0000_ACCESSOR, {
      // TODO
    });

    this.ramBanks = ramBanks.map(bank => new MemorySegmentDecorator(bank, (obj, offset: number) => {
      // If RAM is not enabled return a static accessor
      if (!this.enabledRam) {
        return STATIC_FFFF_ACCESSOR;
      }

      // If RTC mode is enabled return the
      // RTC accessor.
      if (this.rtcMode) {
        return rtcAccessor;
      }

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
