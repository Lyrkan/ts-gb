import 'mocha';
import { expect } from 'chai';
import * as Utils from '../src/utils';

describe('Utils', () => {
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
