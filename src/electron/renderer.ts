// tslint:disable:no-console
import { ipcRenderer } from 'electron';
import { System } from '../system';
import { CPU_CLOCK_FREQUENCY } from '../cpu/cpu';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../display/display';
import { COLOR_PALETTE, WINDOW_SCALING, COLOR_OFF_SCREEN } from './constants';
import { BUTTON } from '../controls/joypad';

const fs = require('fs');
const crypto = require('crypto');

// Create the system object which contains
// the CPU/MMU/...
const system = new System();

// Expose system globally
(global as any).GAME_BOY = system;

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
canvasContext.fillStyle = COLOR_OFF_SCREEN;
canvasContext.fillRect(0, 0, SCREEN_WIDTH * WINDOW_SCALING, SCREEN_HEIGHT * WINDOW_SCALING);

// Status flags
let gameRomLoaded = false;
let emulationPaused = false;
let statsDisplayed = false;

// Events handling
const WINDOW_EVENTS: { [name: string]: (event?: any, data?: any) => void } = {
  loadBootRom: (event: any, filename: string) => {
    console.log(`Loading bootstrap ROM: ${filename}`);
    const fileBuffer = fs.readFileSync(filename);
    if (fileBuffer) {
      const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      );

      system.loadBootRom(arrayBuffer);
    }
  },

  loadGame: (event: any, filename: any) => {
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
  },

  pauseEmulation: () => {
    console.log('Pausing emulation');
    emulationPaused = true;
  },

  resumeEmulation: () => {
    console.log('Resuming emulation');
    emulationPaused = false;
  },

  restartEmulation: () => {
    console.log('Restarting emulation');
    system.reset();
  },

  dumpRegisters: () => {
    const registers = system.cpu.getRegisters();
    console.log(`
      A=0x${registers.A.toString(16)}, F=0x${registers.F.toString(16)},
      B=0x${registers.B.toString(16)}, C=0x${registers.C.toString(16)},
      D=0x${registers.D.toString(16)}, E=0x${registers.E.toString(16)},
      H=0x${registers.H.toString(16)}, L=0x${registers.L.toString(16)},
      PC=0x${registers.PC.toString(16)}, SP=0x${registers.SP.toString(16)}
      Z=${registers.flags.Z}, N=${registers.flags.N}, H=${registers.flags.H}, C=${registers.flags.C}
    `);
  },

  dumpVram: () => {
    console.log(new Uint8Array(system.memory.getVideoRamSegment().data));
  },

  toggleStats: () => {
    statsDisplayed = !statsDisplayed;
  },

  runSingleTick: () => {
    const oldPC = system.cpu.getRegisters().PC;
    system.tick();
    console.log(`PC: 0x${oldPC.toString(16)} => 0x${system.cpu.getRegisters().PC.toString(16)}`);
    WINDOW_EVENTS.dumpRegisters();
  },

  getScreenBufferSha1: () => {
    const buffer = system.display.getFrontBuffer();
    const sha1 = crypto.createHash('sha1');
    sha1.update(buffer);
    console.log(sha1.digest('hex'));
  }
};

for (const event in WINDOW_EVENTS) {
  if (WINDOW_EVENTS.hasOwnProperty(event)) {
    ipcRenderer.on(event, WINDOW_EVENTS[event]);
  }
}

// Stats
let fps: number = 0;
let tps: number = 0;
const printFps = () => {
  const fpsCounterElement = document.getElementById('fps-counter');
  if (fpsCounterElement) {
    if (statsDisplayed) {
      fpsCounterElement.innerText = `
        FPS: ${fps},
        CPU: ${(tps / CPU_CLOCK_FREQUENCY).toFixed(2)}Mhz
      `;
    } else {
      fpsCounterElement.innerText = '';
    }
  }

  fps = 0;
  tps = 0;
};
setInterval(printFps, 1000);

// Handle keypresses
const keyMap: { [index: number]: BUTTON } = {
  38: BUTTON.UP,
  40: BUTTON.DOWN,
  37: BUTTON.LEFT,
  39: BUTTON.RIGHT,
  65: BUTTON.A,
  66: BUTTON.B,
  32: BUTTON.SELECT,
  13: BUTTON.START,
};

window.addEventListener('keydown', event => {
  if (keyMap.hasOwnProperty(event.keyCode)) {
    system.joypad.down(keyMap[event.keyCode]);
  }
});

window.addEventListener('keyup', event => {
  if (keyMap.hasOwnProperty(event.keyCode)) {
    system.joypad.up(keyMap[event.keyCode]);
  }
});

// Game loop
let lastLoopTime: number|null = null;
const gameLoop = (loopTime: number) => {
  let deltaTime: number|null = null;
  if (lastLoopTime != null) {
    deltaTime = loopTime - lastLoopTime;
  }

  if (!emulationPaused && gameRomLoaded && deltaTime) {
    // Run as many CPU ticks as needed based on the time
    // the previous frame took to process.
    const ticks = (CPU_CLOCK_FREQUENCY * deltaTime) / 1000;
    for (let i = 0; i < ticks; i++) {
      system.tick();
      tps++;
    }
  }

  if (gameRomLoaded) {
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
  lastLoopTime = loopTime;
  requestAnimationFrame(gameLoop);
};

// Start the game loop
requestAnimationFrame(gameLoop);
