import { checkBit } from '../../utils';
import { AbstractSoundChannel, EnvelopeDirection } from './abstract-sound-channel';
import { Audio, EventSource, EventName } from '../audio';

export class QuadrangularChannel extends AbstractSoundChannel {
  // Duty
  private _waveDuty: number;

  // Frequency
  private _frequency: number;
  private hasFrequencySweep: boolean;
  private frequencySweepEnabled: boolean;
  private frequencySweepShadow: number;
  private frequencySweepPeriod: number;
  private frequencySweepShift: number;
  private frequencySweepDirection: EnvelopeDirection;

  // Volume
  private _volume: number;
  private volumeSweepCounter: number;
  private volumeSweepDirection: EnvelopeDirection;

  // Sound length
  private soundLengthEnabled: boolean;
  private soundLengthCounter: number;

  public constructor(
    audio: Audio,
    eventSource: EventSource,
    registerMasks: number[],
    hasFrequencySweep: boolean
  ) {
    super(audio, eventSource, registerMasks);
    this.hasFrequencySweep = hasFrequencySweep;
  }

  public tick(sequencerCounter: number) {
    // Sound length is updated at rate of 256Hz
    if ((sequencerCounter % 2) === 0) {
      this.updateSoundLength();
    }

    // Volume is updated at a rate of 64Hz.
    if (((sequencerCounter + 7) % 8) === 0) {
      this.updateVolume();
    }

    // Frequency is updated at a rate of 64Hz.
    if (this.hasFrequencySweep && ((sequencerCounter + 2) % 4) === 0) {
      this.updateFrequency();
    }
  }

  public reset(): void {
    super.reset();

    this.waveDuty = 0;
    this.frequency = 0;
    this.frequencySweepEnabled = false;
    this.frequencySweepShadow = 0;
    this.frequencySweepPeriod = 0;
    this.frequencySweepShift = 0;
    this.frequencySweepDirection = EnvelopeDirection.INCREASE;
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
    this.audio.notifyListener(this.eventSource, EventName.FREQUENCY_CHANGED);
  }

  public get volume(): number {
    return this._volume;
  }

  public set volume(value: number) {
    this._volume = value;
    this.audio.notifyListener(this.eventSource, EventName.VOLUME_CHANGED);
  }

  public get waveDuty(): number {
    return this._waveDuty;
  }

  public set waveDuty(value: number) {
    this._waveDuty = value;
    this.audio.notifyListener(this.eventSource, EventName.DUTY_CHANGED);
  }

  public set nrx0(value: number) {
    super.nrx0 = value;

    this.frequencySweepPeriod = (value >> 4) & 0b111;
    this.frequencySweepDirection = checkBit(3, value) ?
      EnvelopeDirection.DECREASE :
      EnvelopeDirection.INCREASE;
    this.frequencySweepShift = value & 0b111;
  }

  public set nrx1(value: number) {
    super.nrx1 = value;

    this.waveDuty = (value >> 6) & 0b11;
    this.soundLengthCounter = value & 0x3F;
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

    // Update the 8 lower bits of the
    // current frequency.
    this.frequency = (this.frequency & ~0xFF) | (value & 0xFF);
  }

  public set nrx4(value: number) {
    super.nrx4 = value;

    // Enable/disable the sound length check
    this.soundLengthEnabled = checkBit(6, value);

    // Update the 3 upper bits of the
    // current frequency.
    this.frequency = (this.frequency & 0xFF) | ((value & 0b111) << 8);

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

  private updateFrequency(): void {
    if (this.frequencySweepEnabled && (this.frequencySweepPeriod > 0)) {
      let shiftedShadow = this.frequencySweepShadow >> this.frequencySweepShift;
      if (this.frequencySweepDirection === EnvelopeDirection.DECREASE) {
        shiftedShadow = 0 - shiftedShadow;
      }

      const newFrequency = this.frequencySweepShadow + shiftedShadow;

      if (newFrequency >= 2048) {
        this.enabled = false;
      } else {
        if (this.frequencySweepShift !== 0) {
          this.frequencySweepShadow = newFrequency;
          this.frequency = newFrequency;
        }

        this.frequencySweepPeriod--;
      }
    }
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
