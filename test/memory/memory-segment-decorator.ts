import 'mocha';
import { expect } from 'chai';
import { MemorySegment } from '../../src/memory/memory-segment';
import { MemorySegmentDecorator } from '../../src/memory/memory-segment-decorator';
import { MemoryAccessor } from '../../src/memory/memory-accessor';

describe('MemorySegment', () => {
  let memorySegment: MemorySegment;

  beforeEach(() => {
    memorySegment = new MemorySegment(4);
  });

  it('allows to override [[Set]] behavior', () => {
    const decoratedSegment = new MemorySegmentDecorator(memorySegment, {
      set: (obj, prop, value) => {
        // Change behavior for address 0x00FF
        if (prop === 0x00FF.toString()) {
          obj[0x1234] = value;
        }

        // Use default behavior
        return false;
      }
    });

    decoratedSegment[0x0001].byte = 0x12;
    decoratedSegment[0x00FF].byte = 0x34;

    expect(decoratedSegment[0x0001].byte).to.equal(0x12);
    expect(decoratedSegment[0x00FF].byte).to.equal(0x00);
    expect(decoratedSegment[0x1234].byte).to.equal(0x34);
  });

  it('allows to override [[Get]] behavior', () => {
    const decoratedSegment = new MemorySegmentDecorator(memorySegment, {
      get: (obj, prop) => {
        // Change behavior for address 0x00FF
        if (prop === 0x00FF.toString()) {
          return { byte: 0xFF, word: 0xFFFF };
        }

        // Use default behavior
        return null;
      }
    });

    decoratedSegment[0x0001].byte = 0x12;
    decoratedSegment[0x00FF].byte = 0x34;

    expect(decoratedSegment[0x0001].byte).to.equal(0x12);
    expect(decoratedSegment[0x00FF].byte).to.equal(0xFF);
  });
});
