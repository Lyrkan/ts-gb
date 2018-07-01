import { IMemorySegment } from '../../memory/segments/memory-segment';
import { MemorySegmentDecorator } from '../../memory/segments/memory-segment-decorator';
import { AbstractMBC } from './abstract-mbc';
import { CARTRIDGE_ROM_BANK_LENGTH, CARTRIDGE_RAM_BANK_LENGTH } from '../game-cartridge';
import { IGameCartridgeInfo } from '../game-cartridge-info';

export class MBC3 extends AbstractMBC {
  private decoratedRomBanks: IMemorySegment[];
  private decoratedRamBanks: IMemorySegment[];

  private currentRomBank: number;
  private currentRamBank: number;

  private enabledRam: boolean;

  private latchedTimer: boolean;
  private latchActivationFlag: boolean;

  public constructor(
    cartridgeInfo: IGameCartridgeInfo,
    romBanks: IMemorySegment[],
    ramBanks: IMemorySegment[]
  ) {
    super(cartridgeInfo, romBanks, ramBanks);

    this.currentRomBank = 1;
    this.currentRamBank = 0;
    this.enabledRam = false;
    this.latchedTimer = false;
    this.latchActivationFlag = false;

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
              // ROM Bank switch (all 7 bits)
              // If the value is equal to 0x00 it is changed
              // to 0x01.
              this.currentRomBank = (value & 0x7F) || 1;
            }
          } else {
            if (offset < 0x2000) {
              // RAM Bank/RTC Register switch
              this.currentRamBank = value;
            } else if (offset < 0x4000) {
              // Latch/unlatch timer when 0x00 then 0x01
              // is written into this register
              if (value === 0x00) {
                this.latchActivationFlag = true;
              } else if ((value === 0x01 && this.latchActivationFlag)) {
                this.latchedTimer = !this.latchedTimer;
                this.latchActivationFlag = false;
              } else {
                this.latchActivationFlag = false;
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
    // TODO Handle timer registers
    if (this.cartridgeInfo.hasTimer &&
      (this.currentRamBank >= 0x08 && this.currentRamBank <= 0x0C)) {
      return {
        getByte: () => 0x00,
        setByte: () => { /* NOP */ },
        getWord: () => 0x0000,
        setWord: () => { /* NOP */ },
      };
    }

    const index = this.decoratedRamBanks[this.currentRamBank] ? this.currentRamBank : 0;
    return this.decoratedRamBanks[index];
  }
}
