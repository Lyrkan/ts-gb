import { Display, SCREEN_WIDTH, SCREEN_HEIGHT } from '../display';

const RESET = '\u001B[1;1H';
const LOWER_HALF_BLOCK = '\u2584';

const chalk: any = (() => {
  try {
    return require('chalk');
  } catch (e) {
    throw new Error(`
chalk is required by the TerminalRenderer
Please add it to your project using one of the following commands:

  $ npm add chalk
  $ yarn add chalk
  `);
  }
})();

export class TerminalRenderer {
  private display: Display;
  private resetPosition: boolean;

  public constructor(
    display: Display,
    { resetPosition = true }: ITerminalRendererOptions = {}
  ) {
    this.display = display;
    this.resetPosition = resetPosition;
  }

  public renderFrame(): void {
    const buffer = this.display.getFrontBuffer();

    if (this.resetPosition) {
      process.stdout.write(RESET);
    }

    for (let y = 0; y < SCREEN_HEIGHT; y += 4) {
      for (let x = 0; x < SCREEN_WIDTH; x += 2) {
        let bgR = 0;
        let bgG = 0;
        let bgB = 0;

        let fgR = 0;
        let fgG = 0;
        let fgB = 0;

        for (let subY = 0; subY < 2; subY++) {
          for (let subX = 0; subX < 2; subX++) {
            const bgOffset = ((y + subY) * SCREEN_WIDTH * 3) + (x * 3);
            const fgOffset = ((y + (subY * 2)) * SCREEN_WIDTH * 3) + (x * 3);

            bgR = buffer[bgOffset];
            bgG = buffer[bgOffset + 1];
            bgB = buffer[bgOffset + 2];

            fgR = buffer[fgOffset];
            fgG = buffer[fgOffset + 1];
            fgB = buffer[fgOffset + 2];
          }
        }

        process.stdout.write(chalk.bgRgb(bgR, bgG, bgB).rgb(fgR, fgG, fgB)(LOWER_HALF_BLOCK));
      }
      process.stdout.write('\n');
    }
  }
}

export interface ITerminalRendererOptions {
  resetPosition?: boolean;
}
