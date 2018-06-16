export class Joypad {
  public readonly pressedButtons: Set<BUTTON>;
  private interruptCallback: () => void;

  public constructor() {
    this.pressedButtons = new Set<BUTTON>();
  }

  public down(button: BUTTON) {
    if (!this.pressedButtons.has(button)) {
      this.pressedButtons.add(button);
      if (this.interruptCallback) {
        this.interruptCallback();
      }
    }
  }

  public up(button: BUTTON) {
    if (this.pressedButtons.has(button)) {
      this.pressedButtons.delete(button);

      // Theoretically no interrupt should be
      // triggered when releasing a button but
      // in practice that does happen...
      if (this.interruptCallback) {
        this.interruptCallback();
      }
    }
  }

  public isPressed(button: BUTTON) {
    return this.pressedButtons.has(button);
  }

  public setInterruptCallback(callback: () => void) {
    this.interruptCallback = callback;
  }
}

export enum BUTTON {
  LEFT,
  RIGHT,
  UP,
  DOWN,
  A,
  B,
  START,
  SELECT,
}
