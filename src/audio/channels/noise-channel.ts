import { AbstractSoundChannel, EnvelopeDirection } from './abstract-sound-channel';
import { checkBit } from '../../utils';
import { EventName } from '../apu';

export class NoiseChannel extends AbstractSoundChannel {
  // Frequency
  private _frequency: number;

  // Volume
  private _volume: number;
  private volumeSweepCounter: number;
  private volumeSweepDirection: EnvelopeDirection;

  // Sound length
  private soundLengthEnabled: boolean;
  private soundLengthCounter: number;

  // Polynomial counter
  // private lfsr: number;
  // private shiftClockFrequency: number;
  // private counterStep: number;
  // private dividingRatio: number;

  public tick(sequencerCounter: number): void {
    // Sound length is updated at rate of 256Hz
    if ((sequencerCounter % 2) === 0) {
      this.updateSoundLength();
    }

    // Volume is updated at a rate of 64Hz.
    if (((sequencerCounter + 7) % 8) === 0) {
      this.updateVolume();
    }

    // Update LFSR
    // TODO
  }

  public reset(): void {
    super.reset();

    this.volume = 0;
    this.volumeSweepCounter = 0;
    this.volumeSweepDirection = EnvelopeDirection.INCREASE;
    this.soundLengthEnabled = false;
    this.soundLengthCounter = 0;
  }

  public get frequency(): number {
    return this._frequency;
  }

  public set frequency(value: number) {
    this._frequency = value;
    this.apu.notifyListener(this.eventSource, EventName.FREQUENCY_CHANGED);
  }

  public get volume(): number {
    return this._volume;
  }

  public set volume(value: number) {
    this._volume = value;
    this.apu.notifyListener(this.eventSource, EventName.VOLUME_CHANGED);
  }

  public set nrx1(value: number) {
    super.nrx1 = value;
    this.soundLengthCounter = (value & 0x3F);
  }

  public set nrx2(value: number) {
    super.nrx2 = value;
    this.volume = (value >> 4) & 0b1111;
    this.volumeSweepDirection = checkBit(3, value) ?
      EnvelopeDirection.INCREASE :
      EnvelopeDirection.DECREASE;
    this.volumeSweepCounter = value & 0b111;
  }

  public set nrx3(value: number) {
    super.nrx3 = value;
    // this.shiftClockFrequency = (value >> 4) & 0b1111;
    // this.counterStep = (value >> 3) & 0b1;
    // this.dividingRatio = value & 0b111;
  }

  public set nrx4(value: number) {
    super.nrx4 = value;

    // Enable/disable the sound length check
    this.soundLengthEnabled = checkBit(6, value);

    // Trigger/restart if the 7th bit
    // is set.
    if (checkBit(7, value)) {
      this.trigger();
    }
  }

  private trigger(): void {
    this.enabled = true;

    // Restart sound length counter
    this.soundLengthCounter = (this._nrx1 & 0x3F);

    // Restart volume sweep envelope
    this.volume = (this._nrx2 >> 4) & 0b1111;
    this.volumeSweepCounter = this._nrx2 & 0b111;
  }

  private updateVolume(): void {
    if (this.volumeSweepCounter > 0) {
      this.volumeSweepCounter--;

      if (this.volumeSweepDirection === EnvelopeDirection.INCREASE) {
        this.volume = Math.min(0x0F, this.volume + 1);
      } else {
        this.volume = Math.max(0, this.volume - 1);
      }
    }
  }

  private updateSoundLength(): void {
    if (this.soundLengthEnabled && (this.soundLengthCounter > 0)) {
      this.soundLengthCounter--;

      if (this.soundLengthCounter <= 0) {
        this.enabled = false;
      }
    }
  }
}
