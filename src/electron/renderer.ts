// tslint:disable:no-console
import { ipcRenderer } from 'electron';
import { System } from '../system';
import { CPU_CLOCK_FREQUENCY } from '../cpu/cpu';
import { BUTTON } from '../controls/joypad';
import { Debugger, DEBUGGER_MODE } from './debugger';
import { WINDOW_SCALING } from './constants';
import { CanvasRenderer } from '../display/renderers/canvas-renderer';
import { WebGLRenderer } from '../display/renderers/webgl-renderer';
import { TonejsRenderer } from '../audio/renderers/tonejs-renderer';

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

// Create Canvas or WebGL renderer
const webGLSupport = (() => {
  try {
    return !!document.createElement('canvas').getContext('webgl');
  } catch (e) {
    return false;
  }
})();

const rendererOptions = { scaling: WINDOW_SCALING, canvasId: 'lcd' };
const canvasRenderer = webGLSupport ?
  new WebGLRenderer(system.display, rendererOptions) :
  new CanvasRenderer(system.display, rendererOptions);

document.body.appendChild(canvasRenderer.getCanvas());

// Create audio renderer
const audioRenderer = new TonejsRenderer();
system.audio.setEventListener(audioRenderer);
audioRenderer.setVolume(-Infinity);

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

  setVolume: (event: any, volume: number) => {
    if (volume === 0) {
      audioRenderer.setVolume(-Infinity);
    } else {
      audioRenderer.setVolume((volume - 100) / 3);
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
    canvasRenderer.renderFrame();
  }

  // Prepare for new frame
  fps++;
  lastLoopTime = loopTime;
  requestAnimationFrame(gameLoop);
};

// Start the game loop
requestAnimationFrame(gameLoop);
