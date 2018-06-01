import 'mocha';
import { expect } from 'chai';
import { MemorySegment } from '../../src/memory/memory-segment';
import { MemoryAccessor } from '../../src/memory/memory-accessor';

describe('MemorySegment', () => {
  let memorySegment: MemorySegment;

  beforeEach(() => {
    memorySegment = new MemorySegment(4);
  });

  describe('Memory access', () => {
    it('should return a MemoryAccessor when using array notation', () => {
      expect(memorySegment.get(0)).to.be.an.instanceof(MemoryAccessor);
      expect(memorySegment.get(1)).to.be.an.instanceof(MemoryAccessor);
      expect(memorySegment.get(2)).to.be.an.instanceof(MemoryAccessor);
      expect(memorySegment.get(3)).to.be.an.instanceof(MemoryAccessor);
    });
  });

  describe('Errors handling', () => {
    it('should not allow to access an invalid address', () => {
      expect(() => { memorySegment.get(-1); }).to.throw('Invalid address');
    });
  });
});
