import 'mocha';
import { expect } from 'chai';
import { StaticMemorySegment } from '../../src/memory/static-memory-segment';

describe('StaticMemorySegment', () => {
  it('should return a MemoryAccessor that always read the same value', () => {
    const memorySegment1 = new StaticMemorySegment({ byte: 0x12, word: 0x3456 });
    const memorySegment2 = new StaticMemorySegment({ byte: 0x78, word: 0x9ABC });

    expect(memorySegment1[0x00].byte).to.equal(0x12);
    expect(memorySegment1[0x01].byte).to.equal(0x12);
    expect(memorySegment1[0x02].byte).to.equal(0x12);
    expect(memorySegment1[0xFF].byte).to.equal(0x12);

    expect(memorySegment1[0x00].word).to.equal(0x3456);
    expect(memorySegment1[0x01].word).to.equal(0x3456);
    expect(memorySegment1[0x02].word).to.equal(0x3456);
    expect(memorySegment1[0xFF].word).to.equal(0x3456);

    expect(memorySegment2[0x00].byte).to.equal(0x78);
    expect(memorySegment2[0xFF].byte).to.equal(0x78);

    expect(memorySegment2[0x00].word).to.equal(0x9ABC);
    expect(memorySegment2[0xFF].word).to.equal(0x9ABC);

    memorySegment1[0x00].byte = 0xAB;
    memorySegment1[0x01].word = 0xCDEF;

    expect(memorySegment1[0x00].byte).to.equal(0x12);
    expect(memorySegment1[0x01].word).to.equal(0x3456);
  });
});
