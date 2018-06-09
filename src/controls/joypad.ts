import { IMemoryAccessor } from '../memory/memory-accessor';

export class Joypad {
  public readonly pressedButtons: Set<BUTTON>;
  public readonly memoryAccesor: IMemoryAccessor;

  private interruptCallback: () => void;

  public constructor() {
    this.pressedButtons = new Set<BUTTON>();
    this.memoryAccesor = this.createMemoryAccessor();
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

  private createMemoryAccessor(): IMemoryAccessor {
    const joypad = this;
    let currentMode: REGISTER_MODE = REGISTER_MODE.BUTTONS;
    return {
      get byte() {
        let value = 0xFF;

        if (currentMode === REGISTER_MODE.BUTTONS) {
          value &= ~0x10;
          value &= joypad.isPressed(BUTTON.START) ? ~0x08 : 0xFF;
          value &= joypad.isPressed(BUTTON.SELECT) ? ~0x04 : 0xFF;
          value &= joypad.isPressed(BUTTON.B) ? ~0x02 : 0xFF;
          value &= joypad.isPressed(BUTTON.A) ? ~0x01 : 0xFF;
        } else {
          value &= ~0x20;
          value &= joypad.isPressed(BUTTON.DOWN) ? ~0x08 : 0xFF;
          value &= joypad.isPressed(BUTTON.UP) ? ~0x04 : 0xFF;
          value &= joypad.isPressed(BUTTON.LEFT) ? ~0x02 : 0xFF;
          value &= joypad.isPressed(BUTTON.RIGHT) ? ~0x01 : 0xFF;
        }

        return value;
      },

      set byte(value: number) {
        if ((value & 0x10) === 0) {
          currentMode = REGISTER_MODE.DIRECTION;
        } else if ((value & 0x20) === 0) {
          currentMode = REGISTER_MODE.BUTTONS;
        }
      },

      get word() {
        throw new Error('The joypad register only contains a byte');
      },

      set word(value: number) {
        throw new Error('The joypad register only contains a byte');
      }
    };
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

enum REGISTER_MODE {
  DIRECTION,
  BUTTONS,
}
