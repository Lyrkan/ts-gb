import 'mocha';
import { expect } from 'chai';
import * as Utils from '../../src/memory/utils';

describe('Utils', () => {
  it('isIntegerPropertyKey', () => {
    // Integers
    expect(Utils.isIntegerPropertyKey(-15)).to.equal(true);
    expect(Utils.isIntegerPropertyKey(0)).to.equal(true);
    expect(Utils.isIntegerPropertyKey(15)).to.equal(true);
    expect(Utils.isIntegerPropertyKey(1234)).to.equal(true);

    // Strings that contain an integer
    expect(Utils.isIntegerPropertyKey('-15')).to.equal(true);
    expect(Utils.isIntegerPropertyKey('0')).to.equal(true);
    expect(Utils.isIntegerPropertyKey('15')).to.equal(true);
    expect(Utils.isIntegerPropertyKey('1234')).to.equal(true);

    // Invalid
    expect(Utils.isIntegerPropertyKey(12.5)).to.equal(false);
    expect(Utils.isIntegerPropertyKey('abcd')).to.equal(false);
    expect(Utils.isIntegerPropertyKey('12.5')).to.equal(false);
    expect(Utils.isIntegerPropertyKey(Symbol('a'))).to.equal(false);
  });

  it('uint8ToInt8', () => {
    // Positive numbers
    expect(Utils.uint8ToInt8(0)).to.equal(0);
    expect(Utils.uint8ToInt8(10)).to.equal(10);
    expect(Utils.uint8ToInt8(126)).to.equal(126);
    expect(Utils.uint8ToInt8(127)).to.equal(127);

    // Negative numbers
    expect(Utils.uint8ToInt8(128)).to.equal(-128);
    expect(Utils.uint8ToInt8(129)).to.equal(-127);
    expect(Utils.uint8ToInt8(245)).to.equal(-11);
    expect(Utils.uint8ToInt8(255)).to.equal(-1);
  });
});
