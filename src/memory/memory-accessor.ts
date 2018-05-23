/**
 * Usage:
 *
 *   const buffer = new ArrayBuffer(4);
 *   const view = new DataView(buffer);
 *
 *   const accessor0 = new MemoryAccessor({ view: view, offset: 0 });
 *   const accessor1 = new MemoryAccessor({ view: view, offset: 1 });
 *
 *   // Write values
 *   accessor0.byte = 0x12;
 *   accessor1.word = 0x3456;
 *
 *   // Read values
 *   const b0 = accessor0.byte;
 *   const w0 = accessor0.word;
 *   const w1 = accessor1.word;
 */
export class MemoryAccessor {
  private view: DataView;
  private offset: number;
  private writable: boolean;
  private readable: boolean;

  public constructor({ view, offset, writable = true, readable = true }: IMemoryAccessorOptions) {
    this.view = view;
    this.offset = offset;
    this.writable = writable;
    this.readable = readable;
  }

  public get byte(): number {
    if (!this.readable) {
      throw new Error('Memory is not readable');
    }

    return this.view.getUint8(this.offset);
  }

  public set byte(value: number) {
    if (!this.writable) {
      throw new Error('Memory is not writable');
    }

    this.view.setUint8(this.offset, value);
  }

  public get word() {
    if (!this.readable) {
      throw new Error('Memory is not readable');
    }

    return this.view.getUint16(this.offset);
  }

  public set word(value: number) {
    if (!this.writable) {
      throw new Error('Memory is not writable');
    }

    this.view.setUint16(this.offset, value);
  }
}

interface IMemoryAccessorOptions {
  view: DataView;
  offset: number;
  writable?: boolean;
  readable?: boolean;
}
