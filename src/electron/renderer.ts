// tslint:disable:no-console
import { ipcRenderer } from 'electron';
import { System } from '../system';
import { CPU_CLOCK_FREQUENCY } from '../cpu/cpu';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../display/display';
import { COLOR_PALETTE, WINDOW_SCALING, COLOR_OFF_SCREEN } from './constants';
import { BUTTON } from '../controls/joypad';
import { Debugger, DEBUGGER_MODE } from './debugger';

const fs = require('fs');
const crypto = require('crypto');

// Create the system object which contains
// the CPU/MMU/...
const system = new System();

// Init debugger
const systemDebugger = new Debugger(system.cpu, system.memory);

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

  loadGame: (event: any, filename: string) => {
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
    systemDebugger.pause();
  },

  resumeEmulation: () => {
    systemDebugger.unpause();
  },

  restartEmulation: () => {
    console.log('Restarting emulation');
    system.reset();
  },

  dumpRegisters: () => {
    systemDebugger.dumpRegisters();
  },

  dumpVram: () => {
    systemDebugger.dumpVram();
  },

  setDebuggerMode: (event: any, mode: DEBUGGER_MODE) => {
    systemDebugger.setMode(mode);
  },

  toggleStats: () => {
    const fpsCounterElement = document.getElementById('fps-counter');
    if (fpsCounterElement) {
      const currentDisplay = fpsCounterElement.style.display;
      fpsCounterElement.style.display = (currentDisplay === 'none') ? 'block' : 'none';
    }
  },

  runSingleTick: () => {
    system.tick();
    systemDebugger.tick();
  },

  runSingleStep: () => {
    const initialPC = system.cpu.getRegisters().PC;

    let i = 0;
    while ((system.cpu.getRegisters().PC === initialPC) && (i < 1000)) {
      system.tick();
      i++;
    }

    if (i >= 1000) {
      console.log(`CPU didn\'t change state after ${i} ticks... maybe it\'s halted/paused?`);
    }

    systemDebugger.tick();
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
    fpsCounterElement.innerText = `
      FPS: ${fps},
      CPU: ${(tps / CPU_CLOCK_FREQUENCY).toFixed(2)}Mhz
    `;
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

  if (gameRomLoaded && deltaTime) {
    // Run as many CPU ticks as needed based on the time
    // the previous frame took to process.
    const ticks = (CPU_CLOCK_FREQUENCY * deltaTime) / 1000;
    for (let i = 0; i < ticks; i++) {
      // Test if a breakpoint has been triggered
      if (systemDebugger.isPaused()) {
        break;
      }

      system.tick();
      systemDebugger.tick();
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
