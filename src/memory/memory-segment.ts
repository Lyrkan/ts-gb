import { MemoryAccessor, IMemoryAccessor } from './memory-accessor';

/**
 * Usage:
 *
 *   const segment = new MemorySegment({ byteLength: 4 });
 *
 *   // Write values
 *   segment[0].byte = 0x12;
 *   segment[1].byte = 0x34;
 *   segment[2].word = 0x5678;
 *
 *   // Read values
 *   const b0 = segment[0].byte;
 *   const b1 = segment[1].byte;
 *   const w2 = segment[2].word;
 */
export class MemorySegment implements IMemorySegment {
  private data: ArrayBuffer;
  private view: DataView;

  public constructor(byteLength: number) {
    this.data = new ArrayBuffer(byteLength);
    this.view = new DataView(this.data);
  }

  public get(offset: number) {
    if (offset < 0 || offset >= this.data.byteLength) {
      throw new RangeError(`Invalid address "0x${offset.toString(16).toUpperCase()}"`);
    }

    return new MemoryAccessor(this.view, offset);
  }
}

export interface IMemorySegment {
  get(offset: number): IMemoryAccessor;
}
