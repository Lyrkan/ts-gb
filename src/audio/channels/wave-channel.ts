import { AbstractSoundChannel } from './abstract-sound-channel';
import { checkBit } from '../../utils';
import { EventName } from '../audio';

export class WaveChannel extends AbstractSoundChannel {
  // Frequency
  private _frequency: number;

  // Volume
  private _volume: WaveChannelVolume;

  // Sound length
  private soundLengthEnabled: boolean;
  private soundLengthCounter: number;

  // Waveform (16x 2x 4-bits)
  private _waveform: number[];

  public reset(): void {
    super.reset();

    this.frequency = 0;
    this.volume = 0;
    this.soundLengthEnabled = false;
    this.soundLengthCounter = 0;
    this._waveform = new Array(16).fill(0);
  }

  public tick(sequencerCounter: number): void {
    // Sound length is updated at rate of 256Hz
    if ((sequencerCounter % 2) === 0) {
      this.updateSoundLength();
    }
  }

  public updateWaveform(offset: number, value: number): void {
    if (offset < 0 || offset >= this.waveform.length) {
      throw new RangeError(`Invalid waveform index ${offset}`);
    }

    this.waveform[offset] = value & 0xFF;
    this.audio.notifyListener(this.eventSource, EventName.WAVEFORM_CHANGED);
  }

  public get frequency(): number {
    return this._frequency;
  }

  public set frequency(value: number) {
    this._frequency = value;
    this.audio.notifyListener(this.eventSource, EventName.FREQUENCY_CHANGED);
  }

  public get volume(): WaveChannelVolume {
    return this._volume;
  }

  public set volume(value: WaveChannelVolume) {
    this._volume = value;
    this.audio.notifyListener(this.eventSource, EventName.VOLUME_CHANGED);
  }

  public get waveform(): number[] {
    return this._waveform;
  }

  public get nrx0(): number {
    return super.nrx0;
  }

  public set nrx0(value: number) {
    super.nrx0 = value;

    // If bit 7 is equal to 0 the DAC is disabled.
    this.dac = checkBit(7, value);
  }

  public get nrx1(): number {
    return super.nrx1;
  }

  public set nrx1(value: number) {
    super.nrx1 = value;
    this.soundLengthCounter = 256 - value;
  }

  public get nrx2(): number {
    return super.nrx2;
  }

  public set nrx2(value: number) {
    super.nrx2 = value;
    this.volume = (value >> 5) & 0b11;
  }

  public get nrx3(): number {
    return super.nrx3;
  }

  public set nrx3(value: number) {
    super.nrx3 = value;

    // Update the 8 lower bits of the
    // current frequency.
    this.frequency = (this.frequency & ~0xFF) | (value & 0xFF);
  }

  public get nrx4(): number {
    return super.nrx4;
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
    // Restart sound length counter if needed
    if (this.soundLengthCounter === 0) {
      this.soundLengthCounter = 256;
    }

    // Only enable the channel if DAC is on
    if (this.dac) {
      this.enabled = true;
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

export enum WaveChannelVolume {
  VOLUME_MUTE = 0,
  VOLUME_100 = 1,
  VOLUME_50 = 2,
  VOLUME_25 = 3,
}
