import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { Joypad, BUTTON } from '../../src/controls/joypad';

describe('Joypad', () => {
  let joypad: Joypad;

  beforeEach(() => {
    joypad = new Joypad();
  });

  it('should return 0b1 for all buttons by default', () => {
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b1111);
    expect(joypad.isPressed(BUTTON.A)).to.equal(false);
    expect(joypad.isPressed(BUTTON.B)).to.equal(false);
    expect(joypad.isPressed(BUTTON.START)).to.equal(false);
    expect(joypad.isPressed(BUTTON.SELECT)).to.equal(false);
    expect(joypad.isPressed(BUTTON.UP)).to.equal(false);
    expect(joypad.isPressed(BUTTON.DOWN)).to.equal(false);
    expect(joypad.isPressed(BUTTON.LEFT)).to.equal(false);
    expect(joypad.isPressed(BUTTON.RIGHT)).to.equal(false);
  });

  it('should behave correctly', () => {
    // Select direction mode
    joypad.memoryAccesor.byte = 0x20;

    // Press directions
    joypad.down(BUTTON.DOWN);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b0111);

    joypad.down(BUTTON.UP);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b0011);

    joypad.down(BUTTON.LEFT);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b0001);

    joypad.down(BUTTON.RIGHT);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b0000);

    // Select buttons mode
    joypad.memoryAccesor.byte = 0x10;
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b1111);

    // Press buttons
    joypad.down(BUTTON.START);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b0111);

    joypad.down(BUTTON.SELECT);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b0011);

    joypad.down(BUTTON.B);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b0001);

    joypad.down(BUTTON.A);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b0000);

    // Release buttons
    joypad.up(BUTTON.START);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b1000);

    joypad.up(BUTTON.SELECT);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b1100);

    joypad.up(BUTTON.B);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b1110);

    joypad.up(BUTTON.A);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b1111);

    // Select directions mode
    joypad.memoryAccesor.byte = 0x20;
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b0000);

    // Release directions
    joypad.up(BUTTON.DOWN);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b1000);

    joypad.up(BUTTON.UP);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b1100);

    joypad.up(BUTTON.LEFT);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b1110);

    joypad.up(BUTTON.RIGHT);
    expect(joypad.memoryAccesor.byte & 0b1111).to.equal(0b1111);
  });

  it('should call the interrupt callback whenever a button is pressed/released', () => {
    const callback = sinon.spy();
    joypad.setInterruptCallback(callback);

    joypad.up(BUTTON.DOWN); // Should not count
    joypad.down(BUTTON.DOWN);
    joypad.down(BUTTON.DOWN); // Should not count
    joypad.down(BUTTON.DOWN); // Should not count
    joypad.down(BUTTON.UP);
    joypad.up(BUTTON.DOWN);
    joypad.up(BUTTON.UP);
    joypad.down(BUTTON.A);
    joypad.down(BUTTON.A); // Should not count
    joypad.down(BUTTON.B);
    joypad.down(BUTTON.LEFT);
    joypad.down(BUTTON.RIGHT);
    joypad.down(BUTTON.START);
    joypad.down(BUTTON.SELECT);

    expect(callback.callCount).to.equal(10);
  });
});
