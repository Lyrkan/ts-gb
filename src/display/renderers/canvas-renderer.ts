import { Display, SCREEN_WIDTH, SCREEN_HEIGHT } from '../display';

export class CanvasRenderer {
  private display: Display;
  private scaling: number;

  private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;

  private imageDataBuffer: Uint8ClampedArray;
  private imageData: ImageData;

  public constructor(display: Display, {
    scaling,
    defaultColor = '#EDEDED',
    canvasId = '',
  }: ICanvasRendererOptions) {
    this.display = display;
    this.scaling = scaling;

    this.canvas = document.createElement('canvas');
    this.canvas.id = canvasId;
    this.canvas.style.width = `${SCREEN_WIDTH * this.scaling}px` ;
    this.canvas.style.height = `${SCREEN_HEIGHT * this.scaling}px` ;

    this.canvasContext = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.canvasContext.canvas.width = SCREEN_WIDTH * this.scaling;
    this.canvasContext.canvas.height = SCREEN_HEIGHT * this.scaling;
    this.canvasContext.imageSmoothingEnabled = false;

    this.canvasContext.fillStyle = defaultColor;
    this.canvasContext.fillRect(0, 0, SCREEN_WIDTH * this.scaling, SCREEN_HEIGHT * this.scaling);

    this.imageDataBuffer = new Uint8ClampedArray(4 * SCREEN_WIDTH * SCREEN_HEIGHT);
    this.imageData = new ImageData(this.imageDataBuffer, SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public renderFrame(): void {
    // Draw buffer
    const buffer = this.display.getFrontBuffer();

    for (let line = 0; line < SCREEN_HEIGHT; line++) {
      for (let column = 0; column < SCREEN_WIDTH; column++) {
        const startIndex = (line * SCREEN_WIDTH * 4) + (column * 4);
        this.imageDataBuffer[startIndex] = buffer[(line * SCREEN_WIDTH * 3) + (column * 3)];
        this.imageDataBuffer[startIndex + 1] = buffer[(line * SCREEN_WIDTH * 3) + (column * 3) + 1];
        this.imageDataBuffer[startIndex + 2] = buffer[(line * SCREEN_WIDTH * 3) + (column * 3) + 2];
        this.imageDataBuffer[startIndex + 3] = 255;
      }
    }

    createImageBitmap(this.imageData).then(bitmap => {
      this.canvasContext.drawImage(
        bitmap,
        0,
        0,
        SCREEN_WIDTH * this.scaling,
        SCREEN_HEIGHT * this.scaling
      );
    });
  }
}

export interface ICanvasRendererOptions {
  scaling: number;
  defaultColor?: string;
  canvasId?: string;
}
