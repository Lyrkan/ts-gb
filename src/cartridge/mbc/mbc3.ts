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

  private timerSegment: IMemorySegment;
  private timerStartValue: number;
  private timerUpdatedAt: number;
  private timerStopped: boolean;

  private latchActivationFlag: boolean;
  private latchedTimer: boolean;
  private latchedValue: ITimerValue;

  public constructor(
    cartridgeInfo: IGameCartridgeInfo,
    romBanks: IMemorySegment[],
    ramBanks: IMemorySegment[]
  ) {
    super(cartridgeInfo, romBanks, ramBanks);

    this.currentRomBank = 1;
    this.currentRamBank = 0;
    this.enabledRam = false;

    this.timerStartValue = Math.round((new Date()).getTime() / 1000);
    this.timerUpdatedAt = this.timerStartValue;
    this.timerStopped = false;

    this.latchActivationFlag = false;
    this.latchedTimer = false;
    this.latchedValue = {
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      daysOverflow: false,
    };

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
                this.latchActivationFlag = false;

                this.latchedTimer = !this.latchedTimer;
                if (this.latchedTimer) {
                  this.latchedValue = this.getTimerValue();
                }
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

    // Handle timer registers
    // Get the current timestamp for the RTC or the
    // latched one if the latchedTimer flag is set.
    const getRtcValue = () => {
      const timerValue = this.latchedTimer ? this.latchedValue : this.getTimerValue();
      switch (this.currentRamBank) {
        case 0x08:
          return timerValue.seconds;
        case 0x09:
          return timerValue.minutes;
        case 0x0A:
          return timerValue.hours;
        case 0x0B:
          return (timerValue.days & 0xFF);
        case 0x0C:
          let value = (timerValue.days >> 8) & 1;
          value |= this.timerStopped ? (1 << 6) : 0;
          value |= timerValue.daysOverflow ? (1 << 7) : 0;
          return value;
      }

      throw new Error(`Invalid RTC bank 0x${this.currentRamBank.toString(16)}`);
    };

    const setRtcValue = (value: number) => {
      const timerValue = this.latchedTimer ? this.latchedValue : this.getTimerValue();
      switch (this.currentRamBank) {
        case 0x08:
          timerValue.seconds = Math.min(value, 59);
          break;
        case 0x09:
          timerValue.minutes = Math.min(value, 59);
          break;
        case 0x0A:
          timerValue.hours = Math.min(value, 23);
          break;
        case 0x0B:
          timerValue.days &= ~0xFF;
          timerValue.days |= (value & 0xFF);
          break;
        case 0x0C:
          timerValue.days &= ~(1 << 8);
          timerValue.days |= (value & 1) << 8;
          timerValue.daysOverflow = (value & (1 << 7)) !== 0;
          this.timerStopped = (value & (1 << 6)) !== 0;
          break;
      }

      if (!this.latchedTimer) {
        this.setTimerValue(timerValue);
      }
    };

    this.timerSegment = {
      getByte: (offset: number) => getRtcValue(),
      setByte: (offset: number, value: number) => setRtcValue(value),
      getWord: (offset: number) => {
        const val = getRtcValue();
        return val | (val << 8);
      },
      setWord: (offset: number, value: number) => setRtcValue(value & 0xFF),
    };
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
    // tslint:disable-next-line:max-line-length
    if (this.cartridgeInfo.hasTimer && (this.currentRamBank >= 0x08 && this.currentRamBank <= 0x0C)) {
      return this.timerSegment;
    }

    const index = this.decoratedRamBanks[this.currentRamBank] ? this.currentRamBank : 0;
    return this.decoratedRamBanks[index];
  }

  private getTimerValue(): ITimerValue {
    let deltaTime = 0;
    if (!this.timerStopped) {
        deltaTime = Math.round((new Date()).getTime() / 1000) - this.timerUpdatedAt;
    }

    const currentTimestamp = this.timerStartValue + deltaTime;
    const seconds = currentTimestamp % 60;
    const minutes = Math.floor(currentTimestamp / 60) % 60;
    const hours = Math.floor(currentTimestamp / 3600) % 24;
    const days = Math.floor(currentTimestamp / 86400);

    return {
      seconds,
      minutes,
      hours,
      days: days % 511,
      daysOverflow: days > 511
    };
  }

  private setTimerValue(value: ITimerValue): void {
    this.timerStartValue = value.seconds;
    this.timerStartValue += value.minutes * 60;
    this.timerStartValue += value.hours * 3600;
    this.timerStartValue += value.days * 86400;
    this.timerUpdatedAt = Math.round((new Date()).getTime() / 1000);
  }
}

interface ITimerValue {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  daysOverflow: boolean;
}
