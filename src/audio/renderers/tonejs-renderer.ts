import { IAudioEventListener, EventName, EventSource, Audio } from '../audio';
import { QuadrangularChannel, WAVE_DUTY_MAP } from '../channels/quadrangular-channel';

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

export class TonejsRenderer implements IAudioEventListener {
  private panVol: any;

  private channel1: PulseWave | null;
  private channel2: PulseWave | null;

  public constructor() {
    this.panVol = new Tone.PanVol(0, -Infinity);
    Tone.Master.chain(this.panVol);
  }

  public start() {
    this.stop();

    this.channel1 = new PulseWave();
    this.channel2 = new PulseWave();
  }

  public stop() {
    if (this.channel1) {
      this.channel1.dispose();
      this.channel1 = null;
    }

    if (this.channel2) {
      this.channel2.dispose();
      this.channel2 = null;
    }
  }

  public setVolume(db: number) {
    Tone.Master.volume.value = db;
  }

  public onAudioEvent(audio: Audio, source: EventSource, name: EventName) {
    switch (source) {
      case EventSource.GLOBAL:
        this.updateGlobal(audio, name);
        break;

      case EventSource.CHANNEL1:
        this.updateChannel1(audio, name);
        break;

      case EventSource.CHANNEL2:
        this.updateChannel2(audio, name);
        break;
    }
  }

  private updateGlobal(audio: Audio, name: EventName): void {
    switch (name) {
      case EventName.ON_OFF:
      case EventName.VOLUME_CHANGED:
        const volume = audio.enabled ?
          (audio.leftVolume + audio.rightVolume) :
          0;

        if (volume > 0) {
          this.panVol.volume.value = volume - 0x0F;
          this.panVol.pan.value = ((0 - audio.leftVolume) + audio.rightVolume) / 0x0F;
        } else {
          this.panVol.volume.value = -Infinity;
        }
        break;
    }
  }

  private updateChannel1(audio: Audio, name: EventName): void {
    if (!this.channel1) {
      return;
    }

    switch (name) {
      case EventName.ON_OFF:
      case EventName.VOLUME_CHANGED:
        this.channel1.updateVolume(audio.ch1);
        break;

      case EventName.FREQUENCY_CHANGED:
        this.channel1.updateFrequency(audio.ch1);
        break;

      case EventName.DUTY_CHANGED:
        this.channel1.updateWaveDuty(audio.ch1);
        break;
    }
  }

  private updateChannel2(audio: Audio, name: EventName): void {
    if (!this.channel2) {
      return;
    }

    switch (name) {
      case EventName.ON_OFF:
      case EventName.VOLUME_CHANGED:
        this.channel2.updateVolume(audio.ch2);
        break;

      case EventName.FREQUENCY_CHANGED:
        this.channel2.updateFrequency(audio.ch2);
        break;

      case EventName.DUTY_CHANGED:
        this.channel2.updateWaveDuty(audio.ch2);
        break;
    }
  }
}

class PulseWave {
  private oscillator: any;
  private panner: any;

  public constructor() {
    this.oscillator = new Tone.PulseOscillator(0, 0.5);
    this.panner = new Tone.Panner(0);
    this.oscillator.chain(this.panner, Tone.Master);
    this.oscillator.volume.mute = true;
    this.oscillator.start();
  }

  public dispose() {
    this.oscillator.dispose();
    this.panner.dispose();
  }

  public updateFrequency(channel: QuadrangularChannel): void {
    this.setFrequency(131072 / (2048 - channel.frequency));
  }

  public updateWaveDuty(channel: QuadrangularChannel): void {
    this.setWaveDuty(WAVE_DUTY_MAP[channel.waveDuty]);
  }

  public updateVolume(channel: QuadrangularChannel): void {
    if (channel.enabled && (channel.outputLeft || channel.outputRight)) {
      this.panner.pan.value = (channel.outputLeft ? -1 : 0) + (channel.outputRight ? 1 : 0);
      this.setVolume(channel.volume);
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

  public setVolume(volume: number): void {
    if (volume > 0) {
      this.oscillator.volume.value = (volume - 0x0F);
    } else {
      this.oscillator.volume.value = -Infinity;
    }
  }
}
