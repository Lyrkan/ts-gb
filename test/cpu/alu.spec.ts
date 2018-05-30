import 'mocha';
import { expect } from 'chai';
import { ALU } from '../../src/cpu/alu';

describe('ALU', () => {
  it('incByte', () => {
    expect(ALU.incByte(0x01)).to.deep.equal({ value: 0x02, Z: 0, N: 0, H: 0 });
    expect(ALU.incByte(0x02)).to.deep.equal({ value: 0x03, Z: 0, N: 0, H: 0 });
    expect(ALU.incByte(0x0F)).to.deep.equal({ value: 0x10, Z: 0, N: 0, H: 1 });
    expect(ALU.incByte(0x1F)).to.deep.equal({ value: 0x20, Z: 0, N: 0, H: 1 });
    expect(ALU.incByte(0xFF)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 1 });
  });

  it('incWord', () => {
    expect(ALU.incWord(0x0001).value).to.equal(0x0002);
    expect(ALU.incWord(0x0002).value).to.equal(0x0003);
    expect(ALU.incWord(0x00FF).value).to.equal(0x0100);
    expect(ALU.incWord(0xFFF0).value).to.equal(0xFFF1);
    expect(ALU.incWord(0xFFFF).value).to.equal(0x0000);
  });

  it('decByte', () => {
    expect(ALU.decByte(0xFF)).to.deep.equal({ value: 0xFE, Z: 0, N: 1, H: 0 });
    expect(ALU.decByte(0x10)).to.deep.equal({ value: 0x0F, Z: 0, N: 1, H: 1 });
    expect(ALU.decByte(0x02)).to.deep.equal({ value: 0x01, Z: 0, N: 1, H: 0 });
    expect(ALU.decByte(0x01)).to.deep.equal({ value: 0x00, Z: 1, N: 1, H: 0 });
    expect(ALU.decByte(0x00)).to.deep.equal({ value: 0xFF, Z: 0, N: 1, H: 1 });
  });

  it('decWord', () => {
    expect(ALU.decWord(0xFFFF).value).to.equal(0xFFFE);
    expect(ALU.decWord(0xFFF0).value).to.equal(0xFFEF);
    expect(ALU.decWord(0x00FF).value).to.equal(0x00FE);
    expect(ALU.decWord(0x0002).value).to.equal(0x0001);
    expect(ALU.decWord(0x0001).value).to.equal(0x0000);
    expect(ALU.decWord(0x0000).value).to.equal(0xFFFF);
  });

  it('addBytes');
  it('addWords');

  it('sub', () => {
    expect(ALU.sub(0xFF, 0x01)).to.deep.equal({ value: 0xFE, Z: 0, N: 1, H: 0, C: 0});
    expect(ALU.sub(0xFF, 0x02)).to.deep.equal({ value: 0xFD, Z: 0, N: 1, H: 0, C: 0 });
    expect(ALU.sub(0xF0, 0x01)).to.deep.equal({ value: 0xEF, Z: 0, N: 1, H: 1, C: 0 });
    expect(ALU.sub(0xF0, 0x0F)).to.deep.equal({ value: 0xE1, Z: 0, N: 1, H: 1, C: 0 });
    expect(ALU.sub(0xF0, 0xFF)).to.deep.equal({ value: 0xF1, Z: 0, N: 1, H: 1, C: 1 });
    expect(ALU.sub(0x02, 0x01)).to.deep.equal({ value: 0x01, Z: 0, N: 1, H: 0, C: 0 });
    expect(ALU.sub(0x02, 0x02)).to.deep.equal({ value: 0x00, Z: 1, N: 1, H: 0, C: 0 });
    expect(ALU.sub(0x01, 0x02)).to.deep.equal({ value: 0xFF, Z: 0, N: 1, H: 1, C: 1 });
  });

  it('xor', () => {
    expect(ALU.xor(0x00, 0x00)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.xor(0x01, 0x01)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.xor(0x01, 0x00)).to.deep.equal({ value: 0x01, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.xor(0x00, 0x01)).to.deep.equal({ value: 0x01, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.xor(0xAA, 0xAA)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.xor(0xAA, 0x55)).to.deep.equal({ value: 0xFF, Z: 0, N: 0, H: 0, C: 0 });
  });

  it('or', () => {
    expect(ALU.or(0x00, 0x00)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.or(0x01, 0x01)).to.deep.equal({ value: 0x01, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.or(0x01, 0x00)).to.deep.equal({ value: 0x01, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.or(0x00, 0x01)).to.deep.equal({ value: 0x01, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.or(0xAA, 0xAA)).to.deep.equal({ value: 0xAA, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.or(0xAA, 0x55)).to.deep.equal({ value: 0xFF, Z: 0, N: 0, H: 0, C: 0 });
  });

  it('and', () => {
    expect(ALU.and(0x00, 0x00)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 1, C: 0 });
    expect(ALU.and(0x01, 0x01)).to.deep.equal({ value: 0x01, Z: 0, N: 0, H: 1, C: 0 });
    expect(ALU.and(0x01, 0x00)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 1, C: 0 });
    expect(ALU.and(0x00, 0x01)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 1, C: 0 });
    expect(ALU.and(0xAA, 0xAA)).to.deep.equal({ value: 0xAA, Z: 0, N: 0, H: 1, C: 0 });
    expect(ALU.and(0xAA, 0x55)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 1, C: 0 });
  });

  it('adc');
  it('sbc');
  it('daa');
  it('rlc');
  it('rrc');
  it('rl');
  it('rr');
  it('sla');
  it('srl');
  it('sra');
  it('swap');
  it('bit');
  it('res');
  it('set');
});
