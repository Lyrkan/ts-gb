import 'mocha';
import { expect } from 'chai';
import { MemoryAccessor } from '../../src/memory/memory-accessor';
import { MemoryAccessorDecorator } from '../../src/memory/memory-accessor-decorator';

describe('MemoryAccessorDecorator', () => {
  let memoryAccessor: MemoryAccessor;

  beforeEach(() => {
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    memoryAccessor = new MemoryAccessor(view, 0);
  });

  it('should allow to change .byte get behavior', () => {
    const decoratedAccessor = new MemoryAccessorDecorator(memoryAccessor, {
      getByte: decorated => 0xFF
    });

    expect(decoratedAccessor.byte).to.equal(0xFF);

    decoratedAccessor.word = 0x3456;
    expect(decoratedAccessor.byte).to.equal(0xFF);
    expect(decoratedAccessor.word).to.equal(0x3456);
  });

  it('should allow to change .byte set behavior', () => {
    const decoratedAccessor = new MemoryAccessorDecorator(memoryAccessor, {
      setByte: (decorated, value) => {
        decorated.byte = (value === 0xFF) ? 0x12 : value;
      }
    });

    expect(decoratedAccessor.byte).to.equal(0x00);

    decoratedAccessor.byte = 0xFF;
    expect(decoratedAccessor.byte).to.equal(0x12);
    expect(decoratedAccessor.word).to.equal(0x1200);

    decoratedAccessor.byte = 0x34;
    expect(decoratedAccessor.byte).to.equal(0x34);
    expect(decoratedAccessor.word).to.equal(0x3400);
  });

  it('should allow to change .word get behavior', () => {
    const decoratedAccessor = new MemoryAccessorDecorator(memoryAccessor, {
      getWord: decorated => 0xFFFF
    });

    expect(decoratedAccessor.word).to.equal(0xFFFF);

    decoratedAccessor.word = 0x3456;
    expect(decoratedAccessor.byte).to.equal(0x34);
    expect(decoratedAccessor.word).to.equal(0xFFFF);
  });

  it('should allow to change .word set behavior', () => {
    const decoratedAccessor = new MemoryAccessorDecorator(memoryAccessor, {
      setWord: (decorated, value) => {
        decorated.word = (value === 0xFFFF) ? 0x1234 : value;
      }
    });

    expect(decoratedAccessor.word).to.equal(0x0000);

    decoratedAccessor.word = 0xFFFF;
    expect(decoratedAccessor.byte).to.equal(0x12);
    expect(decoratedAccessor.word).to.equal(0x1234);

    decoratedAccessor.word = 0x3456;
    expect(decoratedAccessor.byte).to.equal(0x34);
    expect(decoratedAccessor.word).to.equal(0x3456);
  });
});
