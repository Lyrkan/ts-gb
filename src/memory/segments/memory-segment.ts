/**
 * Usage:
 *
 *   const segment = new MemorySegment(4);
 *
 *   // Write values
 *   segment.setByte(0, 0x12);
 *   segment.setByte(1, 0x34);
 *   segment.setWord(2, 0x5678);
 *
 *   // Read values
 *   const b0 = segment.getByte(0);
 *   const b1 = segment.getByte(1);
 *   const w2 = segment.getWord(2);
 */
export class MemorySegment implements IMemorySegment {
  public readonly data: Uint8Array;

  public constructor(byteLength: number) {
    this.data = new Uint8Array(
      new ArrayBuffer(byteLength)
    );
  }

  public getByte(offset: number) {
    return this.data[offset];
  }

  public setByte(offset: number, value: number) {
    this.data[offset] = value & 0xFF;
  }

  public getWord(offset: number) {
    return (this.data[offset + 1] << 8) | this.data[offset];
  }

  public setWord(offset: number, value: number) {
    this.data[offset + 1] = (value & 0xFF00) >> 8;
    this.data[offset] = value & 0xFF;
  }
}

export interface IMemorySegment {
  getByte(offset: number): number;
  setByte(offset: number, value: number): void;
  getWord(offset: number): number;
  setWord(offset: number, value: number): void;
}
