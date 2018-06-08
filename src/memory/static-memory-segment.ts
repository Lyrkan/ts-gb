import { IMemorySegment } from './memory-segment';

/**
 * Usage:
 *
 *   const segment = new StaticMemorySegment({ byte: 0x12, word: 0x1234 });
 *
 *   // Writing does nothing
 *   segment.get(0).byte = 0xAB;
 *   segment.get(1).byte = 0xCD;
 *   segment.get(2).word = 0xEFGH;
 *
 *   // Reading always return the given values
 *   const b0 = segment.get(0).byte; // 0x12
 *   const b1 = segment.get(1).byte; // 0x12
 *   const w2 = segment.get(2).word; // 0x1234
 */
export class StaticMemorySegment implements IMemorySegment {
  private readonly filledWith: { byte: number, word: number };

  public constructor(filledWith: {byte: number, word: number}) {
    this.filledWith = {
      byte: filledWith.byte & 0xFF,
      word: filledWith.word & 0xFFFF,
    };
  }

  public get(offset: number) {
    return { ...this.filledWith };
  }
}

// Some useful static segments
export const STATIC_0000_SEGMENT = new StaticMemorySegment({ byte: 0x00, word: 0x0000 });
export const STATIC_FFFF_SEGMENT = new StaticMemorySegment({ byte: 0xFF, word: 0xFFFF });
