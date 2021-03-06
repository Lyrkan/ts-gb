import { Audio, EventSource, EventName } from '../audio';

export abstract class AbstractSoundChannel {
  // Reference to the APU
  // Can be used to notify the registered
  // audio event listener.
  protected audio: Audio;
  protected eventSource: EventSource;

  // Registers
  protected _nrx0: number;
  protected _nrx1: number;
  protected _nrx2: number;
  protected _nrx3: number;
  protected _nrx4: number;

  // State
  private _enabled: boolean;
  private _dac: boolean;

  // Registers masks used by the getters
  private registerMasks: number[];

  // Output channel to SO2/ SO1
  private _outputLeft: boolean;
  private _outputRight: boolean;

  public constructor(
    audio: Audio,
    eventSource: EventSource,
    registerMasks: number[]
  ) {
    if (registerMasks.length !== 5) {
      throw new Error('Invalid register masks length');
    }

    this.audio = audio;
    this.eventSource = eventSource;
    this.registerMasks = registerMasks;

    this.reset();
  }

  public reset(): void {
    this._enabled = false;
    this._dac = false;
    this._nrx0 = 0;
    this._nrx1 = 0;
    this._nrx2 = 0;
    this._nrx3 = 0;
    this._nrx4 = 0;
    this._outputLeft = false;
    this._outputRight = false;

    this.audio.notifyListener(this.eventSource, EventName.RESET);
  }

  public get enabled(): boolean {
    return this._enabled;
  }

  public set enabled(value: boolean) {
    this._enabled = value;
    this.audio.notifyListener(this.eventSource, EventName.ON_OFF);
  }

  public get dac(): boolean {
    return this._dac;
  }

  public set dac(value: boolean) {
    this._dac = value;
    if (this._enabled) {
      this._enabled = false;
    }

    this.audio.notifyListener(this.eventSource, EventName.ON_OFF);
  }

  public get outputLeft(): boolean {
    return this._outputLeft;
  }

  public set outputLeft(value: boolean) {
    this._outputLeft = value;
    this.audio.notifyListener(this.eventSource, EventName.ON_OFF);
  }

  public get outputRight(): boolean {
    return this._outputRight;
  }

  public set outputRight(value: boolean) {
    this._outputRight = value;
    this.audio.notifyListener(this.eventSource, EventName.ON_OFF);
  }

  public get nrx0(): number {
    return this.registerMasks[0] | this._nrx0;
  }

  public set nrx0(value: number) {
    this._nrx0 = value;
  }

  public get nrx1(): number {
    return this.registerMasks[1] | this._nrx1;
  }

  public set nrx1(value: number) {
    this._nrx1 = value;
  }

  public get nrx2(): number {
    return this.registerMasks[2] | this._nrx2;
  }

  public set nrx2(value: number) {
    this._nrx2 = value;
  }

  public get nrx3(): number {
    return this.registerMasks[3] | this._nrx3;
  }

  public set nrx3(value: number) {
    this._nrx3 = value;
  }

  public get nrx4(): number {
    return this.registerMasks[4] | this._nrx4;
  }

  public set nrx4(value: number) {
    this._nrx4 = value;
  }

  public abstract tick(sequencerCounter: number): void;
}

export enum EnvelopeDirection {
  INCREASE,
  DECREASE,
}
