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
    const decoratedSegment = new MemorySegmentDecorator(memorySegment, {
      getByte: (decorated, offset) => {
        if (offset === 0x00FF) {
          return 0xFF;
        }

        return decorated.getByte(offset);
      },
      setByte: (decorated, offset, value) => {
        if (offset === 0x0002) {
          // Don't do anything
          return;
        }

        if (offset === 0x0012) {
          // Replace value at 0x0001 by 0xAB
          decorated.setByte(0x0001, 0xAB);
        }

        // Default behavior
        decorated.setByte(offset, value);
      }
    });

    // Check bytes
    decoratedSegment.setByte(0x0001, 0x12);
    decoratedSegment.setByte(0x0002, 0x34);
    decoratedSegment.setByte(0x00FF, 0x56);

    expect(decoratedSegment.getByte(0x0001)).to.equal(0x12);
    expect(decoratedSegment.getByte(0x0002)).to.equal(0x00);
    expect(decoratedSegment.getByte(0x00FF)).to.equal(0xFF);

    decoratedSegment.setByte(0x0012, 0xFF);
    expect(decoratedSegment.getByte(0x0001)).to.equal(0xAB);

    // Check words
    decoratedSegment.setWord(0x0000, 0x1234);
    expect(decoratedSegment.getByte(0x0000)).to.equal(0x34);
    expect(decoratedSegment.getByte(0x0001)).to.equal(0x12);
    expect(decoratedSegment.getWord(0x0000)).to.equal(0x1234);

    decoratedSegment.setWord(0x0002, 0x5678);
    expect(decoratedSegment.getByte(0x0002)).to.equal(0x00);
    expect(decoratedSegment.getByte(0x0003)).to.equal(0x56);
    expect(decoratedSegment.getWord(0x0002)).to.equal(0x5600);
  });
});
