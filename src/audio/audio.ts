import { NoiseChannel } from './channels/noise-channel';
import { QuadrangularChannel } from './channels/quadrangular-channel';
import { WaveChannel } from './channels/wave-channel';
import { checkBit } from '../utils';

export class Audio {
  public readonly ch1: QuadrangularChannel;
  public readonly ch2: QuadrangularChannel;
  public readonly ch3: WaveChannel;
  public readonly ch4: NoiseChannel;

  private _enabled: boolean;
  private _leftVolume: number;
  private _rightVolume: number;
  private vinLeftEnabled: boolean;
  private vinRightEnabled: boolean;

  private eventListener?: IAudioEventListener;

  private ticksCounter: number;
  private sequencerCounter: number;
  private pendingEvents: Array<Set<EventName>>;

  public constructor() {
    // Create the pending events object first
    // since channels may start emitting events
    // as soon as they're created.
    this.pendingEvents = [];
    for (const eventSource of EVENT_SOURCES) {
      this.pendingEvents[eventSource] = new Set();
    }

    // Create audio channels
    this.ch1 = new QuadrangularChannel(
      this,
      EventSource.CHANNEL1,
      [0x80, 0x3F, 0x00, 0xFF, 0xBF],
      true
    );

    this.ch2 = new QuadrangularChannel(
      this,
      EventSource.CHANNEL2,
      [0xFF, 0x3F, 0x00, 0xFF, 0xBF],
      false
    );

    this.ch3 = new WaveChannel(
      this,
      EventSource.CHANNEL3,
      [0x7F, 0xFF, 0x9F, 0xFF, 0xBF]
    );

    this.ch4 = new NoiseChannel(
      this,
      EventSource.CHANNEL4,
      [0xFF, 0xFF, 0x00, 0x00, 0xBF]
    );

    this.reset();
  }

  public reset(): void {
    for (const eventSource of EVENT_SOURCES) {
      this.pendingEvents[eventSource].clear();
    }

    this._enabled = false;
    this._leftVolume = 0;
    this._rightVolume = 0;
    this.vinLeftEnabled = false;
    this.vinRightEnabled = false;

    this.ticksCounter = 0;
    this.sequencerCounter = 0;

    this.ch1.reset();
    this.ch2.reset();
    this.ch3.reset();
    this.ch4.reset();

    this.notifyListener(EventSource.GLOBAL, EventName.RESET);
  }

  public tick(): void {
    // Tick at a 512hz frequency (every 2048
    // ticks if this method is called at a 1Mhz
    // frequency)
    if (this.ticksCounter === 0) {
      this.ch1.tick(this.sequencerCounter);
      this.ch2.tick(this.sequencerCounter);
      this.ch3.tick(this.sequencerCounter);
      this.ch4.tick(this.sequencerCounter);
      this.sequencerCounter = (this.sequencerCounter + 1) % 8;

      // Broadcast pending events
      if (this.eventListener) {
        for (const eventSource of EVENT_SOURCES) {
          if (this.pendingEvents[eventSource].size > 0) {
            for (const eventName of this.pendingEvents[eventSource]) {
              this.eventListener.onAudioEvent(eventSource, eventName);
            }

            this.pendingEvents[eventSource].clear();
          }
        }
      }
    }

    // Also update the LFSR of the noise channel
    // This is called every tick since it needs to
    // be refreshed way more often than the usual
    // sequencers.
    this.ch4.updateLFSR();

    // Next tick
    this.ticksCounter = (this.ticksCounter + 1) % 2048;
  }

  public setEventListener(eventListener: IAudioEventListener): void {
    this.eventListener = eventListener;
  }

  public notifyListener(source: EventSource, name: EventName): void {
    this.pendingEvents[source].add(name);
  }

  public get enabled(): boolean {
    return this._enabled;
  }

  public set enabled(value: boolean) {
    this._enabled = value;
    this.notifyListener(EventSource.GLOBAL, EventName.ON_OFF);
  }

  public get leftVolume(): number {
    return this._leftVolume;
  }

  public set leftVolume(value: number) {
    this._leftVolume = value;
    this.notifyListener(EventSource.GLOBAL, EventName.VOLUME_CHANGED);
  }

  public get rightVolume(): number {
    return this._rightVolume;
  }

  public set rightVolume(value: number) {
    this._rightVolume = value;
    this.notifyListener(EventSource.GLOBAL, EventName.VOLUME_CHANGED);
  }

  public get nr50(): number {
    let value = 0;

    value |= (this.vinLeftEnabled ? 1 : 0) << 7;
    value |= (this.leftVolume & 0b111) << 4;
    value |= (this.vinRightEnabled ? 1 : 0) << 3;
    value |= (this.rightVolume & 0b111);

    return value;
  }

  public set nr50(value: number) {
    this.vinLeftEnabled = checkBit(7, value);
    this.vinRightEnabled = checkBit(3, value);

    this.leftVolume = (value >> 4) & 0b111;
    this.rightVolume = value & 0b111;
  }

  public get nr51(): number {
    let value = 0;

    value |= (this.ch4.outputLeft ? 1 : 0) << 7;
    value |= (this.ch3.outputLeft ? 1 : 0) << 6;
    value |= (this.ch2.outputLeft ? 1 : 0) << 5;
    value |= (this.ch1.outputLeft ? 1 : 0) << 4;

    value |= (this.ch4.outputRight ? 1 : 0) << 3;
    value |= (this.ch3.outputRight ? 1 : 0) << 2;
    value |= (this.ch2.outputRight ? 1 : 0) << 1;
    value |= (this.ch1.outputRight ? 1 : 0);

    return value;
  }

  public set nr51(value: number) {
    this.ch4.outputLeft = checkBit(7, value);
    this.ch3.outputLeft = checkBit(6, value);
    this.ch2.outputLeft = checkBit(5, value);
    this.ch1.outputLeft = checkBit(4, value);

    this.ch4.outputRight = checkBit(3, value);
    this.ch3.outputRight = checkBit(2, value);
    this.ch2.outputRight = checkBit(1, value);
    this.ch1.outputRight = checkBit(0, value);
  }

  public get nr52(): number {
    let value = 0;
    value |= (this.enabled ? 1 : 0) << 7;
    value |= ((this.ch4.enabled && this.ch4.dac) ? 1 : 0) << 3;
    value |= ((this.ch3.enabled && this.ch3.dac) ? 1 : 0) << 2;
    value |= ((this.ch2.enabled && this.ch2.dac) ? 1 : 0) << 1;
    value |= ((this.ch1.enabled && this.ch1.dac) ? 1 : 0);
    return value;
  }

  public set nr52(value: number) {
    const wasEnabled = this.enabled;
    this.enabled = checkBit(7, value);

    if (!this.enabled && wasEnabled) {
      this.ch1.dac = false;
      this.ch2.dac = false;
      this.ch3.dac = false;
      this.ch4.dac = false;
    }
  }
}

export enum EventSource {
  GLOBAL,
  CHANNEL1,
  CHANNEL2,
  CHANNEL3,
  CHANNEL4,
}

const EVENT_SOURCES = [
  EventSource.GLOBAL,
  EventSource.CHANNEL1,
  EventSource.CHANNEL2,
  EventSource.CHANNEL3,
  EventSource.CHANNEL4,
];

export enum EventName {
  RESET,
  ON_OFF,
  VOLUME_CHANGED,
  FREQUENCY_CHANGED,
  DUTY_CHANGED,
  WAVEFORM_CHANGED,
}

export interface IAudioEventListener {
  onAudioEvent: (source: EventSource, name: EventName) => any;
}

export const DEFAULT_WAVE_DATA_DMG = [
  0x84, 0x40, 0x43, 0xAA,
  0x2D, 0x78, 0x92, 0x3C,
  0x60, 0x59, 0x59, 0xB0,
  0x34, 0xB8, 0x2E, 0xDA,
];

export const DEFAULT_WAVE_DATA_CGB = [
  0x00, 0xFF, 0x00, 0xFF,
  0x00, 0xFF, 0x00, 0xFF,
  0x00, 0xFF, 0x00, 0xFF,
  0x00, 0xFF, 0x00, 0xFF,
];
