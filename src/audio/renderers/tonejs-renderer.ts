import { IAudioEventListener, EventName, EventSource, APU } from '../apu';
import { QuadrangularChannel } from '../channels/quadrangular-channel';

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
  private channel1: PulseWave;
  private channel2: PulseWave;

  public constructor() {
    this.channel1 = new PulseWave();
    this.channel2 = new PulseWave();

    Tone.Master.volume.value = -Infinity;
  }

  public onAudioEvent(apu: APU, source: EventSource, name: EventName) {
    switch (source) {
      case EventSource.GLOBAL:
        this.updateGlobal(apu, name);
        break;

      case EventSource.CHANNEL1:
        this.updateChannel1(apu, name);
        break;

      case EventSource.CHANNEL2:
        this.updateChannel2(apu, name);
        break;
    }
  }

  private updateGlobal(apu: APU, name: EventName): void {
    switch (name) {
      case EventName.ON_OFF:
      case EventName.VOLUME_CHANGED:
        const volume = apu.enabled ?
          (apu.leftVolume + apu.rightVolume) / (2 * 0xF) :
          0;

        if (volume > 0) {
          Tone.Master.volume.value = volume;
        } else {
          Tone.Master.volume.value = -Infinity;
        }
        break;
    }
  }

  private updateChannel1(apu: APU, name: EventName): void {
    switch (name) {
      case EventName.ON_OFF:
      case EventName.VOLUME_CHANGED:
        this.channel1.updateVolume(apu.ch1);
        break;

      case EventName.FREQUENCY_CHANGED:
        this.channel1.updateFrequency(apu.ch1);
        break;

      case EventName.DUTY_CHANGED:
        this.channel1.updateWaveDuty(apu.ch1);
        break;
    }
  }

  private updateChannel2(apu: APU, name: EventName): void {
    switch (name) {
      case EventName.ON_OFF:
      case EventName.VOLUME_CHANGED:
        this.channel2.updateVolume(apu.ch2);
        break;

      case EventName.FREQUENCY_CHANGED:
        this.channel2.updateFrequency(apu.ch2);
        break;

      case EventName.DUTY_CHANGED:
        this.channel2.updateWaveDuty(apu.ch2);
        break;
    }
  }
}

class PulseWave {
  private oscillator: any;

  public constructor() {
    this.oscillator = new Tone.PulseOscillator(440, 0);
    this.oscillator.toMaster().start();
    this.oscillator.volume.mute = true;
  }

  public updateFrequency(channel: QuadrangularChannel): void {
    this.setFrequency(131072 / (2048 - channel.frequency));
  }

  public updateWaveDuty(channel: QuadrangularChannel): void {
    this.setWaveDuty(channel.waveDuty);
  }

  public updateVolume(channel: QuadrangularChannel): void {
    this.setVolume(channel.enabled ? channel.volume : 0);
  }

  public setFrequency(frequency: number): void {
    this.oscillator.frequency.value = frequency;
  }

  public setWaveDuty(waveDuty: number): void {
    this.oscillator.width.value = DUTY_MAPPING[waveDuty];
  }

  public setVolume(volume: number): void {
    if (volume > 0) {
      this.oscillator.volume.value = volume;
    } else {
      this.oscillator.volume.value = -Infinity;
    }
  }
}

const DUTY_MAPPING = [0.125, 0.25, 0.5, 0.75];
