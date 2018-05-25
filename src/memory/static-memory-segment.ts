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
            byte: filledWith.byte,
            word: filledWith.word,
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
