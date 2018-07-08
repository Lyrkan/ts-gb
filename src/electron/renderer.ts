// tslint:disable:no-console
import { ipcRenderer } from 'electron';
import { System } from '../system';
import { CPU_CLOCK_FREQUENCY } from '../cpu/cpu';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../display/display';
import { BUTTON } from '../controls/joypad';
import { Debugger, DEBUGGER_MODE } from './debugger';
import { WINDOW_SCALING } from './constants';

const fs = require('fs');
const crypto = require('crypto');

// Create the system object which contains
// the CPU/MMU/...
const system = new System();

// Init debugger
const systemDebugger = new Debugger(system.cpu, system.memory);

// Expose system and debugger globally
(global as any).GAME_BOY = system;
(global as any).GAME_BOY_DEBUGGER = systemDebugger;

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
canvasContext.fillStyle = '#EDEDED';
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

      const cartridgeInfo = system.cartridge.cartridgeInfo;
      console.log('Loaded game', cartridgeInfo);

      if (cartridgeInfo.hasBattery) {
        const saveFilename = `${filename}.save`;

        // Load previous save
        if (fs.existsSync(saveFilename)) {
          const saveDataBuffer = fs.readFileSync(saveFilename);
          system.cartridge.loadRamContent(saveDataBuffer);
          console.log(`Loaded savefile ${saveFilename}`);
        }

        // Set save handler
        // Since the listener is called everytime
        // something writes into the RAM don't forget
        // to debounce it...
        let debounceTimeout: NodeJS.Timer | null = null;
        system.cartridge.setRamChangedListener(() => {
          if (debounceTimeout !== null) {
            clearTimeout(debounceTimeout);
          }

          debounceTimeout = setTimeout(() => {
            fs.writeFileSync(saveFilename, system.cartridge.getRamContent());
            debounceTimeout = null;
          }, 500);
        });
      }

      gameRomLoaded = true;
    }
  },

  pauseEmulation: () => {
    console.log('Pausing emulation');
    systemDebugger.pause();
  },

  resumeEmulation: () => {
    console.log('Resuming emulation');
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
    const buffer = Buffer.from(system.display.getFrontBuffer().buffer);
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
const imageDataBuffer = new Uint8ClampedArray(4 * SCREEN_WIDTH * SCREEN_HEIGHT);
const imageData = new ImageData(imageDataBuffer, SCREEN_WIDTH, SCREEN_HEIGHT);

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

      try {
        system.tick();
        systemDebugger.tick();
        tps++;
      } catch (e) {
        console.error(e);
        systemDebugger.pause();
      }
    }
  }

  if (gameRomLoaded) {
    // Draw buffer
    const buffer = system.display.getFrontBuffer();

    for (let line = 0; line < SCREEN_HEIGHT; line++) {
      for (let column = 0; column < SCREEN_WIDTH; column++) {
        const startIndex = (line * SCREEN_WIDTH * 4) + (column * 4);
        imageDataBuffer[startIndex] = buffer[(line * SCREEN_WIDTH * 3) + (column * 3)];
        imageDataBuffer[startIndex + 1] = buffer[(line * SCREEN_WIDTH * 3) + (column * 3) + 1];
        imageDataBuffer[startIndex + 2] = buffer[(line * SCREEN_WIDTH * 3) + (column * 3) + 2];
        imageDataBuffer[startIndex + 3] = 255;
      }
    }

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
