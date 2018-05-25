import { IMemoryAccessor } from './memory-accessor';

/**
 * Usage:
 *
 *   const buffer = new ArrayBuffer(2);
 *   const view = new DataView(buffer);
 *   const memoryAccessor = new MemoryAccessor(view, 0);
 *   const decoratedAccessor = new MemoryAccessorDecorator(memoryAccessor, {
 *     getByte: (decorated) => { return 0xFF; },
 *     setByte: (decorated, value) => {
 *       decorated.byte = (value === 0xFF) ? 0x12 : value;
 *     },
 *     getWord: (decorated) => { return 0xFFFF; },
 *     setWord: (decorated, value) => {
 *       decorated.word = (value === 0xFFFF) ? 0x1234 : value;
 *     }
 *   });
 *
 * If a trap is not defined the original behavior will be used.
 */
export class MemoryAccessorDecorator implements IMemoryAccessor {
  private decorated: IMemoryAccessor;
  private traps: IMemoryAccessorTraps;

  public constructor(decorated: IMemoryAccessor, traps: IMemoryAccessorTraps) {
    this.decorated = decorated;
    this.traps = traps;
  }

  public get byte(): number {
    return this.traps.getByte ? this.traps.getByte(this.decorated) : this.decorated.byte;
  }

  public set byte(value) {
    if (this.traps.setByte) {
      this.traps.setByte(this.decorated, value);
    } else {
      this.decorated.byte = value;
    }
  }

  public get word(): number {
    return this.traps.getWord ? this.traps.getWord(this.decorated) : this.decorated.word;
  }

  public set word(value) {
    if (this.traps.setWord) {
      this.traps.setWord(this.decorated, value);
    } else {
      this.decorated.word = value;
    }
  }
}

interface IMemoryAccessorTraps {
  getByte?: (decorated: IMemoryAccessor) => number;
  setByte?: (decorated: IMemoryAccessor, value: number) => void;
  getWord?: (decorated: IMemoryAccessor) => number;
  setWord?: (decorated: IMemoryAccessor, value: number) => void;
}
