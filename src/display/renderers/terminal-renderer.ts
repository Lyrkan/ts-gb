import { Display, SCREEN_WIDTH, SCREEN_HEIGHT } from '../display';
import { requireOptional } from '../../utils';

const supportsColor: any = requireOptional('supports-color', 'TerminalRenderer');
const ansiStyles: any = requireOptional('ansi-styles', 'TerminalRenderer');

const RESET = '\u001B[1;1H';
const LOWER_HALF_BLOCK = '\u2584';

const COLOR_LEVEL = supportsColor.stdout ? supportsColor.stdout.level : 0;
const COLOR_LEVEL_MAP = ['ansi', 'ansi', 'ansi256', 'ansi16m'];

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

    const lastBg = new RgbColor(-1, -1, -1);
    const lastFg = new RgbColor(-1, -1, -1);

    const currentBg = new RgbColor(0, 0, 0);
    const currentFg = new RgbColor(0, 0, 0);

    for (let y = 0; y < SCREEN_HEIGHT; y += 4) {
      for (let x = 0; x < SCREEN_WIDTH; x += 2) {
        currentBg.reset();
        currentFg.reset();

        for (let subY = 0; subY < 2; subY++) {
          for (let subX = 0; subX < 2; subX++) {
            const bgOffset = ((y + subY) * SCREEN_WIDTH * 3) + (x * 3);
            const fgOffset = ((y + (subY * 2)) * SCREEN_WIDTH * 3) + (x * 3);

            currentBg.add(buffer[bgOffset], buffer[bgOffset + 1], buffer[bgOffset + 2]);
            currentFg.add(buffer[fgOffset], buffer[fgOffset + 1], buffer[fgOffset + 2]);
          }
        }

        currentBg.rightShift(2);
        currentFg.rightShift(2);

        // tslint:disable-next-line:max-line-length
        if (!currentBg.equals(lastBg)) {
          currentBg.writeBg();
          lastBg.update(currentBg.r, currentBg.g, currentBg.b);
        }

        // tslint:disable-next-line:max-line-length
        if (!currentFg.equals(lastFg)) {
          currentFg.writeFg();
          lastFg.update(currentFg.r, currentFg.g, currentFg.b);
        }

        process.stdout.write(LOWER_HALF_BLOCK);
      }

      process.stdout.write('\n');
    }

    process.stdout.write(ansiStyles.bgColor.close);
    process.stdout.write(ansiStyles.color.close);
  }
}

export interface ITerminalRendererOptions {
  resetPosition?: boolean;
}

class RgbColor {
  public r: number;
  public g: number;
  public b: number;

  public constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public update(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public reset() {
    this.r = 0;
    this.g = 0;
    this.b = 0;
  }

  public add(r: number, g: number, b: number) {
    this.r += r;
    this.g += g;
    this.b += b;
  }

  public rightShift(offset: number) {
    this.r >>= offset;
    this.g >>= offset;
    this.b >>= offset;
  }

  public equals(other: RgbColor) {
    return (other.r === this.r)
      && (other.g === this.g)
      && (other.b === this.b);
  }

  public writeFg() {
    process.stdout.write(ansiStyles.color[COLOR_LEVEL_MAP[COLOR_LEVEL]].rgb(
      this.r,
      this.g,
      this.b
    ));
  }

  public writeBg() {
    process.stdout.write(ansiStyles.bgColor[COLOR_LEVEL_MAP[COLOR_LEVEL]].rgb(
      this.r,
      this.g,
      this.b
    ));
  }
}
