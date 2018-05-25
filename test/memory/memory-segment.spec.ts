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
      expect(memorySegment[0]).to.be.an.instanceof(MemoryAccessor);
      expect(memorySegment[1]).to.be.an.instanceof(MemoryAccessor);
      expect(memorySegment[2]).to.be.an.instanceof(MemoryAccessor);
      expect(memorySegment[3]).to.be.an.instanceof(MemoryAccessor);
    });
  });

  describe('Errors handling', () => {
    it('should not allow to access an invalid address', () => {
      expect(() => {
        memorySegment[-1]; // tslint:disable-line:no-unused-expression
      }).to.throw('Invalid address');
    });

    it('should not allow to directly set values', () => {
      expect(() => {
        (memorySegment[0] as any) = 1;
      }).to.throw('not allowed');
    });
  });
});
