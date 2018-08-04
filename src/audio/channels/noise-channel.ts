import { AbstractSoundChannel, EnvelopeDirection } from './abstract-sound-channel';
import { checkBit } from '../../utils';
import { EventName } from '../audio';

export class NoiseChannel extends AbstractSoundChannel {
  // Volume
  private _volume: number;
  private volumeSweepEnabled: boolean;
  private volumeSweepTimer: number;
  private volumeSweepLength: number;
  private volumeSweepDirection: EnvelopeDirection;

  // Sound length
  private soundLengthEnabled: boolean;
  private soundLengthCounter: number;

  // Polynomial counter
  private lfsr: number;
  private lfsrTimer: number;
  private shiftClockFrequency: number;
  private counterStep: number;
  private dividingRatio: number;

  public reset(): void {
    super.reset();

    this.volume = 0;
    this.volumeSweepEnabled = false;
    this.volumeSweepTimer = 0;
    this.volumeSweepLength = 0;
    this.volumeSweepDirection = EnvelopeDirection.INCREASE;
    this.soundLengthEnabled = false;
    this.soundLengthCounter = 0;
    this.lfsr = 0;
    this.lfsrTimer = 0;
    this.shiftClockFrequency = 0;
    this.counterStep = 0;
    this.dividingRatio = 0;
  }

  public tick(sequencerCounter: number): void {
    // Sound length is updated at rate of 256Hz
    if ((sequencerCounter % 2) === 0) {
      this.updateSoundLength();
    }

    // Volume is updated at a rate of 64Hz.
    if (((sequencerCounter + 7) % 8) === 0) {
      this.updateVolume();
    }
  }

  public updateLFSR(): void {
    if (this.lfsrTimer > 0) {
      this.lfsrTimer--;
      return;
    }

    // Reload timer
    this.lfsrTimer = 2 * ((this.dividingRatio || 0.5) / (2 ^ (this.shiftClockFrequency + 1)));

    // Update current register value
    const carry = this.lfsr & 1;
    this.lfsr = this.lfsr >> 1;

    const xored = carry ^ (this.lfsr & 1);
    this.lfsr |= (xored << 7);

    if (this.counterStep === 1) {
      this.lfsr = (this.lfsr & ~(1 << 6)) | (xored << 6);
    }
  }

  public get waveformOutput(): number {
    return this.lfsr & 1;
  }

  public get volume(): number {
    return this._volume;
  }

  public set volume(value: number) {
    this._volume = value;
    this.audio.notifyListener(this.eventSource, EventName.VOLUME_CHANGED);
  }

  public get nrx1(): number {
    return super.nrx1;
  }

  public set nrx1(value: number) {
    super.nrx1 = value;
    this.soundLengthCounter = 64 - (value & 0x3F);
  }

  public get nrx2(): number {
    return super.nrx2;
  }

  public set nrx2(value: number) {
    super.nrx2 = value;

    // If all the upper 5 bits are equal to 0
    // the DAC is disabled.
    this.dac = ((value >> 3) & 0b11111) !== 0;

    this.volume = (value >> 4) & 0b1111;
    this.volumeSweepDirection = checkBit(3, value) ?
      EnvelopeDirection.INCREASE :
      EnvelopeDirection.DECREASE;
    this.volumeSweepLength = value & 0b111;
  }

  public get nrx3(): number {
    return super.nrx3;
  }

  public set nrx3(value: number) {
    super.nrx3 = value;
    this.shiftClockFrequency = (value >> 4) & 0b1111;
    this.counterStep = (value >> 3) & 0b1;
    this.dividingRatio = value & 0b111;
  }

  public get nrx4(): number {
    return super.nrx4;
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
    // Restart sound length counter if needed
    if (this.soundLengthCounter === 0) {
      this.soundLengthCounter = 64;
    }

    // Restart volume sweep envelope
    this.volume = (this._nrx2 >> 4) & 0b1111;
    this.volumeSweepEnabled = (this.volumeSweepLength !== 0);
    this.volumeSweepTimer = this.volumeSweepLength;

    // Only enable the channel if DAC is on
    if (this.dac) {
      this.enabled = true;
    }
  }

  private updateVolume(): void {
    if (!this.volumeSweepEnabled || (this.volumeSweepLength === 0)) {
      return;
    }

    // Wait for the timer to expire
    this.volumeSweepTimer--;
    if (this.volumeSweepTimer > 0) {
      return;
    }

    // Reload the timer
    this.volumeSweepTimer = this.volumeSweepLength;

    // Update volume if not min/maxed
    if (this.volumeSweepDirection === EnvelopeDirection.INCREASE) {
      this.volume = Math.min(0x0F, this.volume + 1);
    } else {
      this.volume = Math.max(0, this.volume - 1);
    }

    if ((this.volume === 0) || (this.volume === 0x0F)) {
      this.volumeSweepEnabled = false;
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
