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

  it('addBytes', () => {
    expect(ALU.addBytes(0x01, 0x01)).to.deep.equal({ value: 0x02, Z: 0, N: 0, H: 0, C: 0});
    expect(ALU.addBytes(0x0F, 0x01)).to.deep.equal({ value: 0x10, Z: 0, N: 0, H: 1, C: 0});
    expect(ALU.addBytes(0x0E, 0x02)).to.deep.equal({ value: 0x10, Z: 0, N: 0, H: 1, C: 0});
    expect(ALU.addBytes(0xFF, 0x01)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 1, C: 1});
    expect(ALU.addBytes(0xFF, 0xFF)).to.deep.equal({ value: 0xFE, Z: 0, N: 0, H: 1, C: 1});
  });

  it('addWords', () => {
    expect(ALU.addWords(0x0001, 0x0001)).to.deep.equal({ value: 0x0002, N: 0, H: 0, C: 0});
    expect(ALU.addWords(0x000F, 0x0001)).to.deep.equal({ value: 0x0010, N: 0, H: 0, C: 0});
    expect(ALU.addWords(0x000E, 0x0002)).to.deep.equal({ value: 0x0010, N: 0, H: 0, C: 0});
    expect(ALU.addWords(0x00FF, 0x0001)).to.deep.equal({ value: 0x0100, N: 0, H: 0, C: 0});
    expect(ALU.addWords(0x00FF, 0x00FF)).to.deep.equal({ value: 0x01FE, N: 0, H: 0, C: 0});
    expect(ALU.addWords(0x0FFF, 0x0001)).to.deep.equal({ value: 0x1000, N: 0, H: 1, C: 0});
    expect(ALU.addWords(0x0FFE, 0x0002)).to.deep.equal({ value: 0x1000, N: 0, H: 1, C: 0});
    expect(ALU.addWords(0xFFFF, 0x0001)).to.deep.equal({ value: 0x0000, N: 0, H: 1, C: 1});
    expect(ALU.addWords(0xFFFF, 0xFFFF)).to.deep.equal({ value: 0xFFFE, N: 0, H: 1, C: 1});
  });

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

  it('adc', () => {
    expect(ALU.adc(0x01, 0x01, 0)).to.deep.equal({ value: 0x02, Z: 0, N: 0, H: 0, C: 0});
    expect(ALU.adc(0x01, 0x01, 1)).to.deep.equal({ value: 0x03, Z: 0, N: 0, H: 0, C: 0});
    expect(ALU.adc(0x0F, 0x01, 0)).to.deep.equal({ value: 0x10, Z: 0, N: 0, H: 1, C: 0});
    expect(ALU.adc(0x0F, 0x01, 1)).to.deep.equal({ value: 0x11, Z: 0, N: 0, H: 1, C: 0});
    expect(ALU.adc(0x0E, 0x02, 0)).to.deep.equal({ value: 0x10, Z: 0, N: 0, H: 1, C: 0});
    expect(ALU.adc(0x0E, 0x02, 1)).to.deep.equal({ value: 0x11, Z: 0, N: 0, H: 1, C: 0});
    expect(ALU.adc(0xFF, 0x01, 0)).to.deep.equal({ value: 0x00, Z: 1, N: 0, H: 1, C: 1});
    expect(ALU.adc(0xFF, 0x01, 1)).to.deep.equal({ value: 0x01, Z: 0, N: 0, H: 1, C: 1});
    expect(ALU.adc(0xFF, 0xFF, 0)).to.deep.equal({ value: 0xFE, Z: 0, N: 0, H: 1, C: 1});
    expect(ALU.adc(0xFF, 0xFF, 1)).to.deep.equal({ value: 0xFF, Z: 0, N: 0, H: 1, C: 1});
  });

  it('sbc', () => {
    expect(ALU.sbc(0xFF, 0x01, 0)).to.deep.equal({ value: 0xFE, Z: 0, N: 1, H: 0, C: 0});
    expect(ALU.sbc(0xFF, 0x01, 1)).to.deep.equal({ value: 0xFD, Z: 0, N: 1, H: 0, C: 0});
    expect(ALU.sbc(0xFF, 0x02, 0)).to.deep.equal({ value: 0xFD, Z: 0, N: 1, H: 0, C: 0 });
    expect(ALU.sbc(0xFF, 0x02, 1)).to.deep.equal({ value: 0xFC, Z: 0, N: 1, H: 0, C: 0 });
    expect(ALU.sbc(0xF0, 0x01, 0)).to.deep.equal({ value: 0xEF, Z: 0, N: 1, H: 1, C: 0 });
    expect(ALU.sbc(0xF0, 0x01, 1)).to.deep.equal({ value: 0xEE, Z: 0, N: 1, H: 1, C: 0 });
    expect(ALU.sbc(0xF0, 0x0F, 0)).to.deep.equal({ value: 0xE1, Z: 0, N: 1, H: 1, C: 0 });
    expect(ALU.sbc(0xF0, 0x0F, 1)).to.deep.equal({ value: 0xE0, Z: 0, N: 1, H: 1, C: 0 });
    expect(ALU.sbc(0xF0, 0xFF, 0)).to.deep.equal({ value: 0xF1, Z: 0, N: 1, H: 1, C: 1 });
    expect(ALU.sbc(0xF0, 0xFF, 1)).to.deep.equal({ value: 0xF0, Z: 0, N: 1, H: 1, C: 1 });
    expect(ALU.sbc(0x02, 0x01, 0)).to.deep.equal({ value: 0x01, Z: 0, N: 1, H: 0, C: 0 });
    expect(ALU.sbc(0x02, 0x01, 1)).to.deep.equal({ value: 0x00, Z: 1, N: 1, H: 0, C: 0 });
    expect(ALU.sbc(0x02, 0x02, 0)).to.deep.equal({ value: 0x00, Z: 1, N: 1, H: 0, C: 0 });
    expect(ALU.sbc(0x02, 0x02, 1)).to.deep.equal({ value: 0xFF, Z: 0, N: 1, H: 1, C: 1 });
    expect(ALU.sbc(0x01, 0x02, 0)).to.deep.equal({ value: 0xFF, Z: 0, N: 1, H: 1, C: 1 });
    expect(ALU.sbc(0x01, 0x02, 1)).to.deep.equal({ value: 0xFE, Z: 0, N: 1, H: 1, C: 1 });
    expect(ALU.sbc(0x00, 0xFF, 0)).to.deep.equal({ value: 0x01, Z: 0, N: 1, H: 1, C: 1 });
    expect(ALU.sbc(0x00, 0xFF, 1)).to.deep.equal({ value: 0x00, Z: 1, N: 1, H: 1, C: 1 });
  });

  it('daa', () => {
    expect(ALU.daa(0x00, 0, 0, 0)).to.deep.equal({ value: 0x00, Z: 1, H: 0, C: 0 });
    expect(ALU.daa(0x00, 0, 1, 0)).to.deep.equal({ value: 0x06, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x00, 0, 1, 1)).to.deep.equal({ value: 0x66, Z: 0, H: 0, C: 1 });
    expect(ALU.daa(0x00, 0, 0, 1)).to.deep.equal({ value: 0x60, Z: 0, H: 0, C: 1 });
    expect(ALU.daa(0x09, 0, 0, 0)).to.deep.equal({ value: 0x09, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x90, 0, 0, 0)).to.deep.equal({ value: 0x90, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x0A, 0, 0, 0)).to.deep.equal({ value: 0x10, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x0B, 0, 0, 0)).to.deep.equal({ value: 0x11, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x9A, 0, 0, 0)).to.deep.equal({ value: 0x00, Z: 1, H: 0, C: 1 });
    expect(ALU.daa(0x9B, 0, 0, 0)).to.deep.equal({ value: 0x01, Z: 0, H: 0, C: 1 });
    expect(ALU.daa(0xA0, 0, 0, 0)).to.deep.equal({ value: 0x00, Z: 1, H: 0, C: 1 });
    expect(ALU.daa(0xB0, 0, 0, 0)).to.deep.equal({ value: 0x10, Z: 0, H: 0, C: 1 });
    expect(ALU.daa(0xA9, 0, 0, 0)).to.deep.equal({ value: 0x09, Z: 0, H: 0, C: 1 });
    expect(ALU.daa(0xB9, 0, 0, 0)).to.deep.equal({ value: 0x19, Z: 0, H: 0, C: 1 });

    expect(ALU.daa(0x00, 1, 0, 0)).to.deep.equal({ value: 0x00, Z: 1, H: 0, C: 0 });
    expect(ALU.daa(0x00, 1, 1, 0)).to.deep.equal({ value: 0xFA, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x00, 1, 1, 1)).to.deep.equal({ value: 0x9A, Z: 0, H: 0, C: 1 });
    expect(ALU.daa(0x00, 1, 0, 1)).to.deep.equal({ value: 0xA0, Z: 0, H: 0, C: 1 });
    expect(ALU.daa(0x09, 1, 0, 0)).to.deep.equal({ value: 0x09, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x90, 1, 0, 0)).to.deep.equal({ value: 0x90, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x0A, 1, 0, 0)).to.deep.equal({ value: 0x0A, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x0B, 1, 0, 0)).to.deep.equal({ value: 0x0B, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x9A, 1, 0, 0)).to.deep.equal({ value: 0x9A, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0x9B, 1, 0, 0)).to.deep.equal({ value: 0x9B, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0xA0, 1, 0, 0)).to.deep.equal({ value: 0xA0, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0xB0, 1, 0, 0)).to.deep.equal({ value: 0xB0, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0xA9, 1, 0, 0)).to.deep.equal({ value: 0xA9, Z: 0, H: 0, C: 0 });
    expect(ALU.daa(0xB9, 1, 0, 0)).to.deep.equal({ value: 0xB9, Z: 0, H: 0, C: 0 });
  });

  it('rlc', () => {
    expect(ALU.rlc(0b00000000)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.rlc(0b00000001)).to.deep.equal({ value: 0b00000010, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rlc(0b10000000)).to.deep.equal({ value: 0b00000001, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rlc(0b10000001)).to.deep.equal({ value: 0b00000011, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rlc(0b10101010)).to.deep.equal({ value: 0b01010101, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rlc(0b01010101)).to.deep.equal({ value: 0b10101010, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rlc(0b11111111)).to.deep.equal({ value: 0b11111111, Z: 0, N: 0, H: 0, C: 1 });
  });

  it('rrc', () => {
    expect(ALU.rrc(0b00000000)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.rrc(0b00000001)).to.deep.equal({ value: 0b10000000, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rrc(0b10000000)).to.deep.equal({ value: 0b01000000, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rrc(0b10000001)).to.deep.equal({ value: 0b11000000, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rrc(0b10101010)).to.deep.equal({ value: 0b01010101, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rrc(0b01010101)).to.deep.equal({ value: 0b10101010, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rrc(0b11111111)).to.deep.equal({ value: 0b11111111, Z: 0, N: 0, H: 0, C: 1 });
  });

  it('rl', () => {
    expect(ALU.rl(0b00000000, 0)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.rl(0b00000000, 1)).to.deep.equal({ value: 0b00000001, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rl(0b00000001, 0)).to.deep.equal({ value: 0b00000010, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rl(0b00000001, 1)).to.deep.equal({ value: 0b00000011, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rl(0b10000000, 0)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 1 });
    expect(ALU.rl(0b10000000, 1)).to.deep.equal({ value: 0b00000001, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rl(0b10000001, 0)).to.deep.equal({ value: 0b00000010, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rl(0b10000001, 1)).to.deep.equal({ value: 0b00000011, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rl(0b10101010, 0)).to.deep.equal({ value: 0b01010100, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rl(0b10101010, 1)).to.deep.equal({ value: 0b01010101, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rl(0b01010101, 0)).to.deep.equal({ value: 0b10101010, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rl(0b01010101, 1)).to.deep.equal({ value: 0b10101011, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rl(0b11111111, 0)).to.deep.equal({ value: 0b11111110, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rl(0b11111111, 1)).to.deep.equal({ value: 0b11111111, Z: 0, N: 0, H: 0, C: 1 });
  });

  it('rr', () => {
    expect(ALU.rr(0b00000000, 0)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.rr(0b00000000, 1)).to.deep.equal({ value: 0b10000000, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rr(0b00000001, 0)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 1 });
    expect(ALU.rr(0b00000001, 1)).to.deep.equal({ value: 0b10000000, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rr(0b10000000, 0)).to.deep.equal({ value: 0b01000000, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rr(0b10000000, 1)).to.deep.equal({ value: 0b11000000, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rr(0b10000001, 0)).to.deep.equal({ value: 0b01000000, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rr(0b10000001, 1)).to.deep.equal({ value: 0b11000000, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rr(0b10101010, 0)).to.deep.equal({ value: 0b01010101, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rr(0b10101010, 1)).to.deep.equal({ value: 0b11010101, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.rr(0b01010101, 0)).to.deep.equal({ value: 0b00101010, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rr(0b01010101, 1)).to.deep.equal({ value: 0b10101010, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rr(0b11111111, 0)).to.deep.equal({ value: 0b01111111, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.rr(0b11111111, 1)).to.deep.equal({ value: 0b11111111, Z: 0, N: 0, H: 0, C: 1 });
  });

  it('sla', () => {
    expect(ALU.sla(0b00000000)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.sla(0b00000001)).to.deep.equal({ value: 0b00000010, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.sla(0b10000000)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 1 });
    expect(ALU.sla(0b10000001)).to.deep.equal({ value: 0b00000010, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.sla(0b10101010)).to.deep.equal({ value: 0b01010100, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.sla(0b01010101)).to.deep.equal({ value: 0b10101010, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.sla(0b11111111)).to.deep.equal({ value: 0b11111110, Z: 0, N: 0, H: 0, C: 1 });
  });

  it('srl', () => {
    expect(ALU.srl(0b00000000)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.srl(0b00000001)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 1 });
    expect(ALU.srl(0b10000000)).to.deep.equal({ value: 0b01000000, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.srl(0b10000001)).to.deep.equal({ value: 0b01000000, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.srl(0b10101010)).to.deep.equal({ value: 0b01010101, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.srl(0b01010101)).to.deep.equal({ value: 0b00101010, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.srl(0b11111111)).to.deep.equal({ value: 0b01111111, Z: 0, N: 0, H: 0, C: 1 });
  });

  it('sra', () => {
    expect(ALU.sra(0b00000000)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 0 });
    expect(ALU.sra(0b00000001)).to.deep.equal({ value: 0b00000000, Z: 1, N: 0, H: 0, C: 1 });
    expect(ALU.sra(0b10000000)).to.deep.equal({ value: 0b11000000, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.sra(0b10000001)).to.deep.equal({ value: 0b11000000, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.sra(0b10101010)).to.deep.equal({ value: 0b11010101, Z: 0, N: 0, H: 0, C: 0 });
    expect(ALU.sra(0b01010101)).to.deep.equal({ value: 0b00101010, Z: 0, N: 0, H: 0, C: 1 });
    expect(ALU.sra(0b11111111)).to.deep.equal({ value: 0b11111111, Z: 0, N: 0, H: 0, C: 1 });
  });

  it('swap', () => {
    expect(ALU.swap(0b00000000)).to.deep.equal({ value: 0b00000000, Z: 1 });
    expect(ALU.swap(0b00001111)).to.deep.equal({ value: 0b11110000, Z: 0 });
    expect(ALU.swap(0b11110000)).to.deep.equal({ value: 0b00001111, Z: 0 });
    expect(ALU.swap(0b11011011)).to.deep.equal({ value: 0b10111101, Z: 0 });
    expect(ALU.swap(0b10010110)).to.deep.equal({ value: 0b01101001, Z: 0 });
    expect(ALU.swap(0b11111111)).to.deep.equal({ value: 0b11111111, Z: 0 });
  });

  it('bit', () => {
    expect(ALU.bit(0, 0b00000000)).to.deep.equal({ Z: 1, N: 0, H: 1 });
    expect(ALU.bit(0, 0b00000001)).to.deep.equal({ Z: 0, N: 0, H: 1 });
    expect(ALU.bit(1, 0b00000000)).to.deep.equal({ Z: 1, N: 0, H: 1 });
    expect(ALU.bit(1, 0b00000010)).to.deep.equal({ Z: 0, N: 0, H: 1 });
    expect(ALU.bit(2, 0b00000000)).to.deep.equal({ Z: 1, N: 0, H: 1 });
    expect(ALU.bit(2, 0b00000100)).to.deep.equal({ Z: 0, N: 0, H: 1 });
    expect(ALU.bit(3, 0b00000000)).to.deep.equal({ Z: 1, N: 0, H: 1 });
    expect(ALU.bit(3, 0b00001000)).to.deep.equal({ Z: 0, N: 0, H: 1 });
    expect(ALU.bit(4, 0b00000000)).to.deep.equal({ Z: 1, N: 0, H: 1 });
    expect(ALU.bit(4, 0b00010000)).to.deep.equal({ Z: 0, N: 0, H: 1 });
    expect(ALU.bit(5, 0b00000000)).to.deep.equal({ Z: 1, N: 0, H: 1 });
    expect(ALU.bit(5, 0b00100000)).to.deep.equal({ Z: 0, N: 0, H: 1 });
    expect(ALU.bit(6, 0b00000000)).to.deep.equal({ Z: 1, N: 0, H: 1 });
    expect(ALU.bit(6, 0b01000000)).to.deep.equal({ Z: 0, N: 0, H: 1 });
    expect(ALU.bit(7, 0b00000000)).to.deep.equal({ Z: 1, N: 0, H: 1 });
    expect(ALU.bit(7, 0b10000000)).to.deep.equal({ Z: 0, N: 0, H: 1 });
  });

  it('res', () => {
    expect(ALU.res(0, 0b11111111).value).to.equal(0b11111110);
    expect(ALU.res(0, 0b11111110).value).to.equal(0b11111110);
    expect(ALU.res(1, 0b11111111).value).to.equal(0b11111101);
    expect(ALU.res(1, 0b11111101).value).to.equal(0b11111101);
    expect(ALU.res(2, 0b11111111).value).to.equal(0b11111011);
    expect(ALU.res(2, 0b11111011).value).to.equal(0b11111011);
    expect(ALU.res(3, 0b11111111).value).to.equal(0b11110111);
    expect(ALU.res(3, 0b11110111).value).to.equal(0b11110111);
    expect(ALU.res(4, 0b11111111).value).to.equal(0b11101111);
    expect(ALU.res(4, 0b11101111).value).to.equal(0b11101111);
    expect(ALU.res(5, 0b11111111).value).to.equal(0b11011111);
    expect(ALU.res(5, 0b11011111).value).to.equal(0b11011111);
    expect(ALU.res(6, 0b11111111).value).to.equal(0b10111111);
    expect(ALU.res(6, 0b10111111).value).to.equal(0b10111111);
    expect(ALU.res(7, 0b11111111).value).to.equal(0b01111111);
    expect(ALU.res(7, 0b01111111).value).to.equal(0b01111111);
  });

  it('set', () => {
    expect(ALU.set(0, 0b00000000).value).to.equal(0b00000001);
    expect(ALU.set(0, 0b00000001).value).to.equal(0b00000001);
    expect(ALU.set(1, 0b00000000).value).to.equal(0b00000010);
    expect(ALU.set(1, 0b00000010).value).to.equal(0b00000010);
    expect(ALU.set(2, 0b00000000).value).to.equal(0b00000100);
    expect(ALU.set(2, 0b00000100).value).to.equal(0b00000100);
    expect(ALU.set(3, 0b00000000).value).to.equal(0b00001000);
    expect(ALU.set(3, 0b00001000).value).to.equal(0b00001000);
    expect(ALU.set(4, 0b00000000).value).to.equal(0b00010000);
    expect(ALU.set(4, 0b00010000).value).to.equal(0b00010000);
    expect(ALU.set(5, 0b00000000).value).to.equal(0b00100000);
    expect(ALU.set(5, 0b00100000).value).to.equal(0b00100000);
    expect(ALU.set(6, 0b00000000).value).to.equal(0b01000000);
    expect(ALU.set(6, 0b01000000).value).to.equal(0b01000000);
    expect(ALU.set(7, 0b00000000).value).to.equal(0b10000000);
    expect(ALU.set(7, 0b10000000).value).to.equal(0b10000000);
  });
});
