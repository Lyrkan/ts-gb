import { AddressBus } from '../memory/address-bus';
import { SCREEN_WIDTH } from './display';

export const PPU = {
  renderLine: (addressBus: AddressBus, screenBuffer: Uint8Array, line: number): void => {
    for (let i = 0; i < SCREEN_WIDTH; i++) {
      // TODO Retrieve data
      screenBuffer[(line * SCREEN_WIDTH) + i] = (i + line) % 4;
    }
  }
};
