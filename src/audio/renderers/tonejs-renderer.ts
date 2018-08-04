import { IAudioEventListener, EventName, EventSource, Audio } from '../audio';
import { QuadrangularChannel, WAVE_DUTY_MAP } from '../channels/quadrangular-channel';
import { NoiseChannel } from '../channels/noise-channel';

const Tone: any = (() => {
  try {
    return require('tone');
  } catch (e) {
    throw new Error(`
Tone.js is required by the TonejsRenderer
Please add it to your project using one of the following commands:

  $ npm add tone
  $ yarn add tone
  `);
  }
})();

// Used to scale the volume in the
// setVolume/getVolume methods.
const VOLUME_SCALING = -38;

export class TonejsRenderer implements IAudioEventListener {
  private audio: Audio;
  private panVol: any;

  private channel1: PulseWave;
  private channel2: PulseWave;
  private channel4: NoiseWave;

  public constructor(audio: Audio) {
    this.audio = audio;

    this.panVol = new Tone.PanVol(0, -Infinity);
    Tone.Master.chain(this.panVol);

    this.channel1 = new PulseWave(this.audio.ch1);
    this.channel2 = new PulseWave(this.audio.ch2);
    this.channel4 = new NoiseWave(this.audio.ch4);
  }

  public setVolume(volume: number) {
    const cappedVolume = Math.max(0, Math.min(100, volume));
    const db = (volume === 0) ?
      -Infinity :
      ((cappedVolume / 100) * Math.abs(VOLUME_SCALING)) + VOLUME_SCALING;

    Tone.Master.volume.rampTo(db, 0.05);
  }

  public getVolume() {
    const db = Tone.Master.volume.value;
    if (db === -Infinity) {
      return 0;
    }

    return Math.max(0, Math.min(100,
      100 * (Tone.Master.volume.value - VOLUME_SCALING) / Math.abs(VOLUME_SCALING)
    ));
  }

  public onAudioEvent(source: EventSource, name: EventName) {
    switch (source) {
      case EventSource.GLOBAL:
        this.updateGlobal(name);
        break;

      case EventSource.CHANNEL1:
        this.updateChannel1(name);
        break;

      case EventSource.CHANNEL2:
        this.updateChannel2(name);
        break;

      case EventSource.CHANNEL4:
        this.updateChannel4(name);
        break;
    }
  }

  private updateGlobal(name: EventName): void {
    switch (name) {
      case EventName.RESET:
      case EventName.ON_OFF:
      case EventName.VOLUME_CHANGED:
        const volume = this.audio.enabled ?
          (this.audio.leftVolume + this.audio.rightVolume) :
          0;

        if (volume > 0) {
          this.panVol.volume.value = volume - 0x0F;
          this.panVol.pan.value = ((0 - this.audio.leftVolume) + this.audio.rightVolume) / 0x0F;
        } else {
          this.panVol.volume.value = -Infinity;
        }
        break;
    }
  }

  private updateChannel1(name: EventName): void {
    switch (name) {
      case EventName.RESET:
        this.channel1.updateAll();
        break;

      case EventName.ON_OFF:
      case EventName.VOLUME_CHANGED:
        this.channel1.updateVolume();
        break;

      case EventName.FREQUENCY_CHANGED:
        this.channel1.updateFrequency();
        break;

      case EventName.DUTY_CHANGED:
        this.channel1.updateWaveDuty();
        break;
    }
  }

  private updateChannel2(name: EventName): void {
    switch (name) {
      case EventName.RESET:
        this.channel2.updateAll();
        break;

      case EventName.ON_OFF:
      case EventName.VOLUME_CHANGED:
        this.channel2.updateVolume();
        break;

      case EventName.FREQUENCY_CHANGED:
        this.channel2.updateFrequency();
        break;

      case EventName.DUTY_CHANGED:
        this.channel2.updateWaveDuty();
        break;
    }
  }

  private updateChannel4(name: EventName): void {
    switch (name) {
      case EventName.RESET:
      case EventName.ON_OFF:
      case EventName.VOLUME_CHANGED:
        this.channel4.updateVolume();
        break;
    }
  }
}

class PulseWave {
  private channel: QuadrangularChannel;
  private oscillator: any;
  private panner: any;

  public constructor(channel: QuadrangularChannel) {
    this.channel = channel;
    this.oscillator = new Tone.PulseOscillator(0, 0.5);
    this.panner = new Tone.Panner(0);

    this.setVolume(-Infinity);

    this.oscillator.chain(this.panner, Tone.Master);
    this.oscillator.start();
  }

  public updateAll(): void {
    this.updateVolume();
    this.updateFrequency();
    this.updateWaveDuty();
  }

  public updateFrequency(): void {
    this.setFrequency(131072 / (2048 - this.channel.frequency));
  }

  public updateWaveDuty(): void {
    this.setWaveDuty(WAVE_DUTY_MAP[this.channel.waveDuty]);
  }

  public updateVolume(): void {
    if (this.channel.enabled && (this.channel.outputLeft || this.channel.outputRight)) {
      // tslint:disable-next-line:max-line-length
      this.panner.pan.value = (this.channel.outputLeft ? -1 : 0) + (this.channel.outputRight ? 1 : 0);
      this.setVolume(this.channel.volume);
    } else {
      this.setVolume(0);
    }
  }

  public setFrequency(frequency: number): void {
    this.oscillator.frequency.value = frequency;
  }

  public setWaveDuty(waveDuty: number): void {
    this.oscillator.width.value = waveDuty;
  }

  private setVolume(volume: number): void {
    if (volume > 0) {
      this.oscillator.volume.value = (volume - 0x0F);
    } else {
      this.oscillator.volume.value = -Infinity;
    }
  }
}

class NoiseWave {
  private channel: NoiseChannel;
  private oscillator: any;
  private panner: any;

  public constructor(channel: NoiseChannel) {
    this.channel = channel;
    this.oscillator = new Tone.Noise('white');
    this.panner = new Tone.Panner(0);

    this.setVolume(-Infinity);

    this.oscillator.chain(this.panner, Tone.Master);
    this.oscillator.start();
  }

  public updateVolume(): void {
    if (this.channel.enabled && (this.channel.outputLeft || this.channel.outputRight)) {
      // tslint:disable-next-line:max-line-length
      this.panner.pan.value = (this.channel.outputLeft ? -1 : 0) + (this.channel.outputRight ? 1 : 0);
      this.setVolume(this.channel.volume);
    } else {
      this.setVolume(0);
    }
  }

  private setVolume(volume: number): void {
    if (volume > 0) {
      this.oscillator.volume.value = (volume - 0x0F);
    } else {
      this.oscillator.volume.value = -Infinity;
    }
  }
}
