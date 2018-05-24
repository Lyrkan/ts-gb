import 'mocha';
import { expect } from 'chai';
import { MemoryAccessor } from '../../src/memory/memory-accessor';

describe('MemoryAccessor', () => {
  let memoryAccessors: MemoryAccessor[];
  let dataView: DataView;

  beforeEach(() => {
    const arrayBuffer = new ArrayBuffer(4);

    // Set test data
    dataView = new DataView(arrayBuffer);
    dataView.setUint8(0, 0);
    dataView.setUint8(1, 1);
    dataView.setUint8(2, 2);
    dataView.setUint8(3, 3);

    memoryAccessors = [
      new MemoryAccessor(dataView, 0),
      new MemoryAccessor(dataView, 1),
      new MemoryAccessor(dataView, 2),
      new MemoryAccessor(dataView, 3),
    ];
  });

  describe('Byte access', () => {
    it('should allow to write a byte', () => {
      memoryAccessors[0].byte = 3;
      memoryAccessors[1].byte = 2;
      memoryAccessors[2].byte = 1;
      memoryAccessors[3].byte = 0;

      expect(dataView.getUint8(0)).to.equal(3);
      expect(dataView.getUint8(1)).to.equal(2);
      expect(dataView.getUint8(2)).to.equal(1);
      expect(dataView.getUint8(3)).to.equal(0);
    });

    it('should allow to read a byte', () => {
      expect(memoryAccessors[0].byte).to.equal(0);
      expect(memoryAccessors[1].byte).to.equal(1);
      expect(memoryAccessors[2].byte).to.equal(2);
      expect(memoryAccessors[3].byte).to.equal(3);
    });
  });

  describe('Word access', () => {
    it('should allow to write a word', () => {
      memoryAccessors[0].word = 0x1234;
      memoryAccessors[2].word = 0x4321;

      expect(dataView.getUint16(0)).to.equal(0x1234);
      expect(dataView.getUint16(2)).to.equal(0x4321);
    });

    it('should allow to read a word', () => {
      expect(memoryAccessors[0].word).to.equal(0x0001);
      expect(memoryAccessors[1].word).to.equal(0x0102);
      expect(memoryAccessors[2].word).to.equal(0x0203);
    });
  });

  describe('Errors handling', () => {
    it('should fail for invalid addresses', () => {
      expect(() => {
        const invalidAccessor = new MemoryAccessor(dataView, -1);
        invalidAccessor.word; // tslint:disable-line:no-unused-expression
      }).to.throw('outside the bounds');

      expect(() => {
        const invalidAccessor = new MemoryAccessor(dataView, 4);
        invalidAccessor.byte; // tslint:disable-line:no-unused-expression
      }).to.throw('outside the bounds');

      expect(() => {
        memoryAccessors[3].word; // tslint:disable-line:no-unused-expression
      }).to.throw('outside the bounds');
    });
  });
});
