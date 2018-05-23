import { MemoryAccessor } from './memory-accessor';

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
export class MemorySegment {
  [index: number]: MemoryAccessor;

  private data: ArrayBuffer;
  private view: DataView;

  public constructor({ byteLength, writable = true, readable = true }: IMemorySegmentOptions) {
    this.data = new ArrayBuffer(byteLength);
    this.view = new DataView(this.data);

    return new Proxy(this, {
      get: (obj, prop: any) => {
        if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
          const offset = parseInt(prop, 10);

          if (offset >= 0 && offset < this.data.byteLength) {
            return new MemoryAccessor({
              view: this.view,
              offset: parseInt(prop, 10),
              writable,
              readable,
            });
          }

          throw new TypeError(`Invalid address "${prop}"`);
        }

        return obj[prop];
      },

      set: (obj, prop: any, value: any) => {
        if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
          throw new Error('[[Set]] method is not allowed for MemorySegment elements');
        }

        obj[prop] = value;
        return true;
      }
    });
  }

  /**
   * Load arbitrary data into the segment.
   *
   * @param data New data
   */
  public loadData(data: ArrayBuffer) {
    if (data.byteLength !== this.data.byteLength) {
      throw new Error(
        `Invalid data length ${data.byteLength} (expected ${this.data.byteLength})`
      );
    }

    this.data = data;
    this.view = new DataView(this.data);
  }
}

interface IMemorySegmentOptions {
  byteLength: number;
  writable?: boolean;
  readable?: boolean;
}
