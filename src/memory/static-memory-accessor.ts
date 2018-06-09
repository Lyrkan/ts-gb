import { IMemoryAccessor } from './memory-accessor';

/**
 * Usage:
 *
 *   const accessor = new StaticMemoryAccessor({ byte: 0x12, word: 0x1234 });
 *
 *   // Writing does nothing
 *   accessor.byte = 0xAB;
 *   accessor.byte = 0xCD;
 *   accessor.word = 0xEFGH;
 *
 *   // Reading always return the given values
 *   const b0 = accessor.byte; // 0x12
 *   const b1 = accessor.byte; // 0x12
 *   const w2 = accessor.word; // 0x1234
 */
export class StaticMemoryAccessor implements IMemoryAccessor {
  private readonly filledWith: { byte: number, word: number };

  public constructor(filledWith: {byte: number, word: number}) {
    this.filledWith = {
      byte: filledWith.byte & 0xFF,
      word: filledWith.word & 0xFFFF,
    };
  }

  public get byte(): number {
    return this.filledWith.byte;
  }

  public set byte(value: number) {
    // NOP
  }

  public get word() {
    return this.filledWith.word;
  }

  public set word(value: number) {
    // NOP
  }
}
// Some useful static accessors
export const STATIC_0000_ACCESSOR = new StaticMemoryAccessor({ byte: 0x00, word: 0x0000 });
export const STATIC_FFFF_ACCESSOR = new StaticMemoryAccessor({ byte: 0xFF, word: 0xFFFF });
