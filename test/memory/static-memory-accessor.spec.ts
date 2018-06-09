import 'mocha';
import { expect } from 'chai';
import { StaticMemoryAccessor } from '../../src/memory/static-memory-accessor';

describe('StaticMemoryAccessor', () => {
  it('should always read the same value', () => {
    const accessor1 = new StaticMemoryAccessor({ byte: 0x12, word: 0x3456 });
    const accessor2 = new StaticMemoryAccessor({ byte: 0x78, word: 0x9ABC });

    expect(accessor1.byte).to.equal(0x12);
    expect(accessor1.word).to.equal(0x3456);

    expect(accessor2.byte).to.equal(0x78);
    expect(accessor2.word).to.equal(0x9ABC);

    accessor1.byte = 0xAB;
    accessor1.word = 0xCDEF;

    accessor2.byte = 0x65;
    accessor2.word = 0x4321;

    expect(accessor1.byte).to.equal(0x12);
    expect(accessor1.word).to.equal(0x3456);

    expect(accessor2.byte).to.equal(0x78);
    expect(accessor2.word).to.equal(0x9ABC);
  });
});
