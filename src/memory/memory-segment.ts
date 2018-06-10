import { MemoryAccessor, IMemoryAccessor } from './memory-accessor';

/**
 * Usage:
 *
 *   const segment = new MemorySegment({ byteLength: 4 });
 *
 *   // Write values
 *   segment.get(0).byte = 0x12;
 *   segment.get(1).byte = 0x34;
 *   segment.get(2).word = 0x5678;
 *
 *   // Read values
 *   const b0 = segment.get(0).byte;
 *   const b1 = segment.get(1).byte;
 *   const w2 = segment.get(2).word;
 */
export class MemorySegment implements IMemorySegment {
  public readonly data: ArrayBuffer;
  public readonly view: DataView;

  private accessorsCache: { [index: number]: MemoryAccessor };

  public constructor(byteLength: number) {
    this.data = new ArrayBuffer(byteLength);
    this.view = new DataView(this.data);
    this.accessorsCache = [];
  }

  public get(offset: number) {
    if (offset < 0 || offset >= this.data.byteLength) {
      throw new RangeError(`Invalid address "0x${offset.toString(16).toUpperCase()}"`);
    }

    const cachedValue = this.accessorsCache[offset];
    if (cachedValue) {
      return cachedValue;
    }

    const accessor = new MemoryAccessor(this.view, offset);
    this.accessorsCache[offset] = accessor;

    return accessor;
  }
}

export interface IMemorySegment {
  get(offset: number): IMemoryAccessor;
}
