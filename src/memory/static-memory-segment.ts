import { IMemorySegment } from './memory-segment';
import { IMemoryAccessor } from './memory-accessor';
import { isIntegerPropertyKey } from './utils';

/**
 * Usage:
 *
 *   const segment = new StaticMemorySegment({ byte: 0x12, word: 0x1234 });
 *
 *   // Writing does nothing
 *   segment[0].byte = 0xAB;
 *   segment[1].byte = 0xCD;
 *   segment[2].word = 0xEFGH;
 *
 *   // Reading always return the given values
 *   const b0 = segment[0].byte; // 0x12
 *   const b1 = segment[1].byte; // 0x12
 *   const w2 = segment[2].word; // 0x1234
 */
export class StaticMemorySegment implements IMemorySegment {
  [index: number]: IMemoryAccessor;

  public constructor(filledWith: {byte: number, word: number}) {
    return new Proxy(this, {
      get: (obj: this, prop: PropertyKey) => {
        if (isIntegerPropertyKey(prop)) {
          return {
            byte: filledWith.byte & 0xFF,
            word: filledWith.word & 0xFFFF,
          };
        }

        return obj[prop as any];
      },

      set: (obj: this, prop: PropertyKey, value: any) => {
        return false;
      }
    });
  }
}

// Some useful static segments
export const STATIC_0000_SEGMENT = new StaticMemorySegment({ byte: 0x00, word: 0x0000 });
export const STATIC_FFFF_SEGMENT = new StaticMemorySegment({ byte: 0xFF, word: 0xFFFF });
