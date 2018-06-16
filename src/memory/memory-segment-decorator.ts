import { IMemorySegment } from './memory-segment';

/**
 * Usage:
 *
 *   const segment = new MemorySegment(byteLength);
 *   const decoratedSegment = new MemorySegmentDecorator(segment, {
 *     getByte: (decorated, offset) => {
 *       if (offset === 0x00FF) {
 *         return 0xFF;
 *       }
 *
 *       return decorated.getByte(offset);
 *     },
 *     setByte: (decorated, offset, value) => {
 *       if (offset === 0x0012) {
 *         decorated.setByte(offset, 0x00);
 *       } else {
 *         decorated.setByte(offset, value);
 *       }
 *     }
 *   });
 *
 *   // Returns 0xFF no matter what the segment contains at 0x00FF
 *   decoratedSegment.getByte(0x00FF);
 *
 *   // Reset the byte at 0x0012 instead of putting 0xAB in it
 *   decoratedSegment.setByte(0x0012, 0xAB);
 */
export class MemorySegmentDecorator implements IMemorySegment {
  private decorated: IMemorySegment;
  private traps: IMemorySegmentTraps;

  public constructor(decorated: IMemorySegment, traps: IMemorySegmentTraps) {
    this.decorated = decorated;
    this.traps = traps;
  }

  public getByte(offset: number) {
    if (this.traps.getByte) {
      return this.traps.getByte(this.decorated, offset);
    }

    return this.decorated.getByte(offset);
  }

  public setByte(offset: number, value: number) {
    if (this.traps.setByte) {
      this.traps.setByte(this.decorated, offset, value);
      return;
    }

    this.decorated.setByte(offset, value);
  }

  public getWord(offset: number) {
    return (this.getByte(offset + 1) << 8) | this.getByte(offset);
  }

  public setWord(offset: number, value: number) {
    this.setByte(offset + 1, (value & 0xFF00) >> 8);
    this.setByte(offset, value & 0xFF);
  }
}

export interface IMemorySegmentTraps {
  getByte?: (decorated: IMemorySegment, offset: number) => number;
  setByte?: (decorated: IMemorySegment, offset: number, value: number) => void;
}
