import { IMemorySegment } from './memory-segment';

/**
 * Usage:
 *
 *   const segment = new StaticMemorySegment({ byte: 0x12, word: 0x1234 });
 *
 *   // Writing does nothing
 *   segment.setByte(0, 0xAB);
 *   segment.setByte(1, 0xCD);
 *   segment.setWord(2, 0xEFGH);
 *
 *   // Reading always return the given values
 *   const b0 = segment.getByte(0); // 0x12
 *   const b1 = segment.getByte(1); // 0x12
 *   const w2 = segment.getWord(2); // 0x1234
 */
export class StaticMemorySegment implements IMemorySegment {
  private readonly filledWith: {byte: number, word: number};

  public constructor(filledWith: {byte: number, word: number}) {
    this.filledWith = filledWith;
  }

  public getByte(offset: number) {
    return this.filledWith.byte;
  }

  public setByte(offset: number, value: number) {
    // NOP
  }

  public getWord(offset: number) {
    return this.filledWith.word;
  }

  public setWord(offset: number, value: number) {
    // NOP
  }
}

// Some useful static segments
export const STATIC_0000_SEGMENT = new StaticMemorySegment({ byte: 0x00, word: 0x0000 });
export const STATIC_FFFF_SEGMENT = new StaticMemorySegment({ byte: 0xFF, word: 0xFFFF });
