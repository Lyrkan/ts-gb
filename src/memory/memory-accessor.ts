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
export class MemoryAccessor implements IMemoryAccessor {
  private view: DataView;
  private offset: number;

  public constructor(view: DataView, offset: number) {
    this.view = view;
    this.offset = offset;
  }

  public get byte(): number {
    return this.view.getUint8(this.offset);
  }

  public set byte(value: number) {
    this.view.setUint8(this.offset, value);
  }

  public get word() {
    return this.view.getUint16(this.offset, true);
  }

  public set word(value: number) {
    this.view.setUint16(this.offset, value, true);
  }
}

export interface IMemoryAccessor {
  byte: number;
  word: number;
}
