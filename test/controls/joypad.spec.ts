import 'mocha';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { Joypad, BUTTON } from '../../src/controls/joypad';

describe('Joypad', () => {
  let joypad: Joypad;

  beforeEach(() => {
    joypad = new Joypad();
  });

  it('All buttons should be released by default', () => {
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

    // Press directions
    joypad.down(BUTTON.DOWN);
    expect(joypad.isPressed(BUTTON.DOWN)).to.equal(true);
    expect(joypad.pressedButtons.size).to.equal(1);

    joypad.down(BUTTON.UP);
    expect(joypad.isPressed(BUTTON.UP)).to.equal(true);
    expect(joypad.pressedButtons.size).to.equal(2);

    joypad.down(BUTTON.LEFT);
    expect(joypad.isPressed(BUTTON.LEFT)).to.equal(true);
    expect(joypad.pressedButtons.size).to.equal(3);

    joypad.down(BUTTON.RIGHT);
    expect(joypad.isPressed(BUTTON.RIGHT)).to.equal(true);
    expect(joypad.pressedButtons.size).to.equal(4);

    // Press buttons
    joypad.down(BUTTON.START);
    expect(joypad.isPressed(BUTTON.START)).to.equal(true);
    expect(joypad.pressedButtons.size).to.equal(5);

    joypad.down(BUTTON.SELECT);
    expect(joypad.isPressed(BUTTON.SELECT)).to.equal(true);
    expect(joypad.pressedButtons.size).to.equal(6);

    joypad.down(BUTTON.B);
    expect(joypad.isPressed(BUTTON.B)).to.equal(true);
    expect(joypad.pressedButtons.size).to.equal(7);

    joypad.down(BUTTON.A);
    expect(joypad.isPressed(BUTTON.A)).to.equal(true);
    expect(joypad.pressedButtons.size).to.equal(8);

    // Release buttons
    joypad.up(BUTTON.START);
    expect(joypad.isPressed(BUTTON.START)).to.equal(false);
    expect(joypad.pressedButtons.size).to.equal(7);

    joypad.up(BUTTON.SELECT);
    expect(joypad.isPressed(BUTTON.SELECT)).to.equal(false);
    expect(joypad.pressedButtons.size).to.equal(6);

    joypad.up(BUTTON.B);
    expect(joypad.isPressed(BUTTON.B)).to.equal(false);
    expect(joypad.pressedButtons.size).to.equal(5);

    joypad.up(BUTTON.A);
    expect(joypad.isPressed(BUTTON.A)).to.equal(false);
    expect(joypad.pressedButtons.size).to.equal(4);

    // Release directions
    joypad.up(BUTTON.DOWN);
    expect(joypad.isPressed(BUTTON.DOWN)).to.equal(false);
    expect(joypad.pressedButtons.size).to.equal(3);

    joypad.up(BUTTON.UP);
    expect(joypad.isPressed(BUTTON.UP)).to.equal(false);
    expect(joypad.pressedButtons.size).to.equal(2);

    joypad.up(BUTTON.LEFT);
    expect(joypad.isPressed(BUTTON.LEFT)).to.equal(false);
    expect(joypad.pressedButtons.size).to.equal(1);

    joypad.up(BUTTON.RIGHT);
    expect(joypad.isPressed(BUTTON.RIGHT)).to.equal(false);
    expect(joypad.pressedButtons.size).to.equal(0);
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
