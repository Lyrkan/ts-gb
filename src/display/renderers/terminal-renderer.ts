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

    const lastUpper = new RgbColor(-1, -1, -1);
    const lastLower = new RgbColor(-1, -1, -1);

    const currentUpper = new RgbColor(-1, -1, -1);
    const currentLower = new RgbColor(-1, -1, -1);

    for (let y = 0; y < SCREEN_HEIGHT; y += 4) {
      for (let x = 0; x < SCREEN_WIDTH; x += 2) {
        currentUpper.update(0, 0, 0);
        currentLower.update(0, 0, 0);

        for (let subY = 0; subY < 2; subY++) {
          for (let subX = 0; subX < 2; subX++) {
            const upperOffset = ((y + subY) * SCREEN_WIDTH * 3) + (x * 3);
            const lowerOffset = ((y + (subY * 2)) * SCREEN_WIDTH * 3) + (x * 3);

            currentUpper.add(buffer[upperOffset], buffer[upperOffset + 1], buffer[upperOffset + 2]);
            currentLower.add(buffer[lowerOffset], buffer[lowerOffset + 1], buffer[lowerOffset + 2]);
          }
        }

        currentUpper.shiftRight(2);
        currentLower.shiftRight(2);

        if (!currentUpper.equals(lastUpper)) {
          currentUpper.writeToBackground();
          lastUpper.update(currentUpper.r, currentUpper.g, currentUpper.b);
        }

        if (!currentLower.equals(lastLower)) {
          currentLower.writeToForeground();
          lastLower.update(currentLower.r, currentLower.g, currentLower.b);
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
    this.update(r, g, b);
  }

  public update(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public add(r: number, g: number, b: number) {
    this.r += r;
    this.g += g;
    this.b += b;
  }

  public shiftRight(offset: number) {
    this.r >>= offset;
    this.g >>= offset;
    this.b >>= offset;
  }

  public equals(other: RgbColor) {
    return (other.r === this.r)
      && (other.g === this.g)
      && (other.b === this.b);
  }

  public writeToForeground() {
    process.stdout.write(ansiStyles.color[COLOR_LEVEL_MAP[COLOR_LEVEL]].rgb(
      this.r,
      this.g,
      this.b
    ));
  }

  public writeToBackground() {
    process.stdout.write(ansiStyles.bgColor[COLOR_LEVEL_MAP[COLOR_LEVEL]].rgb(
      this.r,
      this.g,
      this.b
    ));
  }
}
