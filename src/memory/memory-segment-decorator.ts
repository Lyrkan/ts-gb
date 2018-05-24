import { IMemoryAccessor } from './memory-accessor';
import { IMemorySegment } from './memory-segment';

/**
 * Usage:
 *
 *   const segment = new MemorySegment({ byteLength: 4 });
 *   const decoratedSegment = new MemorySegmentDecorator(segment, {
 *     get: (obj, prop) => {
 *       // Change behavior for address 0x00FF
 *       if (prop === 0x00FF.toString()) {
 *         return { byte: 0xFF, word: 0xFFFF };
 *       }
 *
 *       // Use default behavior
 *       return null;
 *     },
 *
 *     set: (obj, prop, value) => {
 *       // Change behavior for address 0x00FF
 *       if (prop === 0x00FF.toString()) {
 *         obj[0x1234] = value;
 *       }
 *
 *       // Use default behavior
 *       return false;
 *     }
 *   });
 *
 *   // Returns 0xFF no matter what the segment contains at 0x00FF
 *   decoratedSegment[0x00FF].byte;
 *
 *   // Set byte at address 0x1234 instead of 0x00FF
 *   decoratedSegment[0x00FF].byte = 0x12;
 */
export class MemorySegmentDecorator implements IMemorySegment {
  [index: number]: IMemoryAccessor;

  public constructor(decorated: IMemorySegment, traps: IMemorySegmentTraps) {
    return new Proxy(this, {
      get: (obj: this, prop: PropertyKey) => {
        if (traps.get) {
          const segment = traps.get(decorated, prop);
          if (segment) {
            return true;
          }
        }

        return decorated[prop as any];
      },

      set: (obj: this, prop: PropertyKey, value: any) => {
        if (traps.set) {
          if (traps.set(decorated, prop, value)) {
            return true;
          }
        }

        return true;
      }
    });
  }
}

interface IMemorySegmentTraps {
  get?: (obj: IMemorySegment, prop: PropertyKey) => IMemoryAccessor | null;
  set?: (obj: IMemorySegment, prop: PropertyKey, value: any) => boolean;
}
