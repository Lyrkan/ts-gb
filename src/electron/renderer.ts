// tslint:disable:no-console
import { ipcRenderer } from 'electron';
import { System } from '../system';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../display/display';
import { CPU_CLOCK_FREQUENCY, COLOR_PALETTE, WINDOW_SCALING, COLOR_SCREEN } from './constants';

const fs = require('fs');

// Create the system object which contains
// the CPU/MMU/...
const system = new System();

// Find the canvas that represents the LCD screen
const canvas = document.getElementById('lcd');
const canvasContext = canvas ? (canvas as HTMLCanvasElement).getContext('2d') : null;
if (!canvas || !canvasContext) {
  throw new Error('Could not find LCD canvas');
}

// Initialize canvas options
canvas.style.width = `${SCREEN_WIDTH * WINDOW_SCALING}px` ;
canvas.style.height = `${SCREEN_HEIGHT * WINDOW_SCALING}px` ;
canvasContext.canvas.width = SCREEN_WIDTH * WINDOW_SCALING;
canvasContext.canvas.height = SCREEN_HEIGHT * WINDOW_SCALING;
canvasContext.imageSmoothingEnabled = false;
canvasContext.fillStyle = COLOR_SCREEN;
canvasContext.fillRect(0, 0, SCREEN_WIDTH * WINDOW_SCALING, SCREEN_HEIGHT * WINDOW_SCALING);

// Status flags
let gameRomLoaded = false;
let emulationPaused = false;

// Events handling
ipcRenderer.on('loadBootRom', (event: any, filename: string) => {
  console.log(`Loading bootstrap ROM: ${filename}`);
  const fileBuffer = fs.readFileSync(filename);
  if (fileBuffer) {
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    );

    system.loadBootRom(arrayBuffer);
  }
});

ipcRenderer.on('loadGame', (event: any, filename: any) => {
  console.log(`Loading game: ${filename}`);
  const fileBuffer = fs.readFileSync(filename);
  if (fileBuffer) {
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    );

    system.loadGame(arrayBuffer);
    gameRomLoaded = true;

    const cartridgeInfo = system.memory.getCartridgeInfo();
    console.log(`Loaded game: ${cartridgeInfo.gameTitle}`);
  }
});

ipcRenderer.on('pauseEmulation', () => {
  console.log('Pausing emulation');
  emulationPaused = true;
});

ipcRenderer.on('resumeEmulation', () => {
  console.log('Resuming emulation');
  emulationPaused = false;
});

// Stats
let fps: number = 0;
let tps: number = 0;
const printFps = () => {
  console.log(`Frame/s: ${fps}, CPU frequency: ${(tps / CPU_CLOCK_FREQUENCY).toFixed(2)}Mhz`);
  fps = 0;
  tps = 0;
};
setInterval(printFps, 1000);

// Game loop
let lastLoopTime: number|null = null;
const gameLoop = (time: number) => {
  let deltaTime: number|null = null;
  if (lastLoopTime != null) {
    deltaTime = time - lastLoopTime;
  }

  if (deltaTime && gameRomLoaded && !emulationPaused) {
    // Run as many CPU ticks as needed based on the time
    // the previous frame took to process.
    const ticks = (CPU_CLOCK_FREQUENCY * deltaTime) / 1000;
    for (let i = 0; i < ticks; i++) {
      system.tick();
      tps++;
    }

    // Draw buffer
    const buffer = system.display.getFrontBuffer();

    const imageDataBuffer = new Uint8ClampedArray(4 * SCREEN_WIDTH * SCREEN_HEIGHT);

    for (let line = 0; line < SCREEN_HEIGHT; line++) {
      for (let column = 0; column < SCREEN_WIDTH; column++) {
        const colorIndex = buffer[line * SCREEN_WIDTH + column];
        const color = COLOR_PALETTE[colorIndex];

        if (color) {
          const startIndex = (line * SCREEN_WIDTH * 4) + (column * 4);
          imageDataBuffer[startIndex] = color[0];
          imageDataBuffer[startIndex + 1] = color[1];
          imageDataBuffer[startIndex + 2] = color[2];
          imageDataBuffer[startIndex + 3] = 255;
        }
      }
    }

    const imageData = new ImageData(imageDataBuffer, SCREEN_WIDTH, SCREEN_HEIGHT);
    createImageBitmap(imageData).then(bitmap => {
      canvasContext.drawImage(
        bitmap,
        0,
        0,
        SCREEN_WIDTH * WINDOW_SCALING,
        SCREEN_HEIGHT * WINDOW_SCALING
      );
    });
  }

  // Prepare for new frame
  fps++;
  lastLoopTime = time;
  requestAnimationFrame(gameLoop);
};

// Start the game loop
requestAnimationFrame(gameLoop);
