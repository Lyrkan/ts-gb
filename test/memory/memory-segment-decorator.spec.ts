import 'mocha';
import { expect } from 'chai';
import { MemorySegment } from '../../src/memory/memory-segment';
import { MemorySegmentDecorator } from '../../src/memory/memory-segment-decorator';

describe('MemorySegmentDecorator', () => {
  let memorySegment: MemorySegment;

  beforeEach(() => {
    memorySegment = new MemorySegment(4);
  });

  it('allows to change the behavior related to an address', () => {
    const decoratedSegment = new MemorySegmentDecorator(memorySegment, (obj, offset) => {
      // Change behavior for address 0x00FF
      if (offset === 0x00FF) {
        return { byte: 0xFF, word: 0xFFFF };
      }

      // Use default behavior
      return obj.get(offset);
    });

    decoratedSegment.get(0x0001).byte = 0x12;
    decoratedSegment.get(0x00FF).byte = 0x34;

    expect(decoratedSegment.get(0x0001).byte).to.equal(0x12);
    expect(decoratedSegment.get(0x00FF).byte).to.equal(0xFF);
  });
});
