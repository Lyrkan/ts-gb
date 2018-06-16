import 'mocha';
import { expect } from 'chai';
import { StaticMemorySegment } from '../../src/memory/static-memory-segment';

describe('StaticMemorySegment', () => {
  it('should return a MemoryAccessor that always read the same value', () => {
    const memorySegment1 = new StaticMemorySegment({ byte: 0x12, word: 0x3456 });
    const memorySegment2 = new StaticMemorySegment({ byte: 0x78, word: 0x9ABC });

    expect(memorySegment1.getByte(0x00)).to.equal(0x12);
    expect(memorySegment1.getByte(0x01)).to.equal(0x12);
    expect(memorySegment1.getByte(0x02)).to.equal(0x12);
    expect(memorySegment1.getByte(0xFF)).to.equal(0x12);

    expect(memorySegment1.getWord(0x00)).to.equal(0x3456);
    expect(memorySegment1.getWord(0x01)).to.equal(0x3456);
    expect(memorySegment1.getWord(0x02)).to.equal(0x3456);
    expect(memorySegment1.getWord(0xFF)).to.equal(0x3456);

    expect(memorySegment2.getByte(0x00)).to.equal(0x78);
    expect(memorySegment2.getByte(0xFF)).to.equal(0x78);

    expect(memorySegment2.getWord(0x00)).to.equal(0x9ABC);
    expect(memorySegment2.getWord(0xFF)).to.equal(0x9ABC);

    memorySegment1.setByte(0x00, 0xAB);
    memorySegment1.setWord(0x01, 0xCDEF);

    expect(memorySegment1.getByte(0x00)).to.equal(0x12);
    expect(memorySegment1.getWord(0x01)).to.equal(0x3456);
  });
});
