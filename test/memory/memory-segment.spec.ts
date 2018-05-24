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

  describe('Memory loading', () => {
    it('should allow to load arbitrary data', () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);

      view.setUint16(0, 0x1234);
      view.setUint16(2, 0x5678);

      memorySegment.loadData(buffer);

      expect(memorySegment[0].word).to.equal(0x1234);
      expect(memorySegment[2].word).to.equal(0x5678);
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

    it('should not allow to load data if they are the wrong size', () => {
      expect(() => {
        memorySegment.loadData(new ArrayBuffer(3));
      }).to.throw('Invalid data length');

      expect(() => {
        memorySegment.loadData(new ArrayBuffer(5));
      }).to.throw('Invalid data length');
    });
  });
});
