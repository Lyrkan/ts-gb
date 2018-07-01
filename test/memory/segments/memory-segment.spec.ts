import 'mocha';
import { expect } from 'chai';
import { MemorySegment } from '../../../src/memory/segments/memory-segment';

describe('MemorySegment', () => {
  let memorySegment: MemorySegment;

  beforeEach(() => {
    memorySegment = new MemorySegment(4);
  });

  it('should allow to read/write bytes', () => {
    memorySegment.setByte(0, 0x12);
    memorySegment.setByte(1, 0x34);
    memorySegment.setWord(2, 0x5678);

    expect(memorySegment.getByte(0)).to.equal(0x12);
    expect(memorySegment.getByte(1)).to.equal(0x34);
  });

  it('should allow to read/write words', () => {
    memorySegment.setWord(0, 0x1234);
    memorySegment.setWord(2, 0x5678);

    expect(memorySegment.getWord(0)).to.equal(0x1234);
    expect(memorySegment.getWord(2)).to.equal(0x5678);

    // Check little-endian
    expect(memorySegment.getByte(0)).to.equal(0x34);
    expect(memorySegment.getByte(1)).to.equal(0x12);
    expect(memorySegment.getByte(2)).to.equal(0x78);
    expect(memorySegment.getByte(3)).to.equal(0x56);
  });
});
