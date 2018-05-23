export class CpuRegisters {
  private buffer: ArrayBuffer;
  private view: DataView;

  public constructor() {
    this.reset();
  }

  public reset(): void {
    this.buffer = new ArrayBuffer(96);
    this.view = new DataView(this.buffer);
  }

  public get A(): number {
    return this.view.getUint8(0);
  }

  public set A(value: number) {
    this.view.setUint8(0, value);
  }

  public get F(): number {
    return this.view.getUint8(1);
  }

  public set F(value: number) {
    this.view.setUint8(1, value);
  }

  public get AF(): number {
    return this.view.getUint16(0);
  }

  public set AF(value: number) {
    this.view.setUint16(0, value);
  }

  public get B(): number {
    return this.view.getUint8(2);
  }

  public set B(value: number) {
    this.view.setUint8(2, value);
  }

  public get C(): number {
    return this.view.getUint8(3);
  }

  public set C(value: number) {
    this.view.setUint8(3, value);
  }

  public get BC(): number {
    return this.view.getUint16(2);
  }

  public set BC(value: number) {
    this.view.setUint16(2, value);
  }

  public get D(): number {
    return this.view.getUint8(4);
  }

  public set D(value: number) {
    this.view.setUint8(4, value);
  }

  public get E(): number {
    return this.view.getUint8(5);
  }

  public set E(value: number) {
    this.view.setUint8(5, value);
  }

  public get DE(): number {
    return this.view.getUint16(4);
  }

  public set DE(value: number) {
    this.view.setUint16(4, value);
  }

  public get H(): number {
    return this.view.getUint8(6);
  }

  public set H(value: number) {
    this.view.setUint8(6, value);
  }

  public get L(): number {
    return this.view.getUint8(7);
  }

  public set L(value: number) {
    this.view.setUint8(7, value);
  }

  public get HL(): number {
    return this.view.getUint16(6);
  }

  public set HL(value: number) {
    this.view.setUint16(6, value);
  }

  public get SP(): number {
    return this.view.getUint16(8);
  }

  public set SP(value: number) {
    this.view.setUint16(8, value);
  }

  public get PC(): number {
    return this.view.getUint16(10);
  }

  public set PC(value: number) {
    this.view.setUint16(10, value);
  }
}
