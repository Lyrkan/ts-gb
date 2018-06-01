import { IMemoryAccessor } from './memory-accessor';
import { IMemorySegment } from './memory-segment';

/**
 * Usage:
 *
 *   const segment = new MemorySegment({ byteLength: 4 });
 *   const decoratedSegment = new MemorySegmentDecorator(segment, (obj, prop) => {
 *     // Change behavior for address 0x00FF
 *     if (prop === 0x00FF.toString()) {
 *       return { byte: 0xFF, word: 0xFFFF };
 *     }
 *
 *     // Use default behavior
 *     return null;
 *   });
 *
 *   // Returns 0xFF no matter what the segment contains at 0x00FF
 *   decoratedSegment[0x00FF].byte;
 */
export class MemorySegmentDecorator implements IMemorySegment {
  private decorated: IMemorySegment;
  private trap: MemorySegmentTrap;

  public constructor(decorated: IMemorySegment, trap: MemorySegmentTrap) {
    this.decorated = decorated;
    this.trap = trap;
  }

  public get(offset: number) {
    return this.trap(this.decorated, offset) || this.decorated.get(offset);
  }
}

type MemorySegmentTrap = (obj: IMemorySegment, offset: number) => IMemoryAccessor | null;
