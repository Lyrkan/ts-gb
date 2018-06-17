import { AddressBus } from '../memory/address-bus';
import { SCREEN_WIDTH } from './display';
import { checkBit, uint8ToInt8 } from '../utils';

export const PPU = {
  readLcdcRegister: (addressBus: AddressBus) => {
    const lcdcRegister = addressBus.getByte(0xFF40);
    return {
      backgroundEnabled: checkBit(0, lcdcRegister),
      spritesEnabled: checkBit(1, lcdcRegister),
      spritesHeight: checkBit(2, lcdcRegister) ? 16 : 8,
      backgroundTileMap: checkBit(3, lcdcRegister) ? TILE_MAP.MAP_2 : TILE_MAP.MAP_1,
      backgroundTileArea: checkBit(4, lcdcRegister) ? TILE_AREA.AREA_2 : TILE_AREA.AREA_1,
      windowEnabled: checkBit(5, lcdcRegister),
      windowTileMap: checkBit(6, lcdcRegister) ? TILE_MAP.MAP_2 : TILE_MAP.MAP_1,
      lcdEnabled: checkBit(7, lcdcRegister),
    };
  },

  readPosRegisters: (addressBus: AddressBus) => {
    const backgroundScroll = addressBus.getWord(0xFF42);
    const windowPosition = addressBus.getWord(0xFF4A);
    return {
      backgroundScrollY: backgroundScroll & 0xFF,
      backgroundScrollX: backgroundScroll >> 8,
      windowPositionY: windowPosition & 0xFF,
      windowPositionX: (windowPosition >> 8) - 7,
    };
  },

  readPaletteRegisters: (addressBus: AddressBus) => {
    const backgroundPalette = addressBus.getByte(0xFF47);
    const spritePalette0 = addressBus.getByte(0xFF48);
    const spritePalette1 = addressBus.getByte(0xFF49);

    return {
      backgroundPalette: [
        (backgroundPalette) & 3,
        (backgroundPalette >> 2) & 3,
        (backgroundPalette >> 4) & 3,
        (backgroundPalette >> 6) & 3,
      ],
      spritePalette0: [
        (spritePalette0 & 3), // Not used
        (spritePalette0 >> 2) & 3,
        (spritePalette0 >> 4) & 3,
        (spritePalette0 >> 6) & 3,
      ],
      spritePalette1: [
        (spritePalette1 & 3), // Not used
        (spritePalette1 >> 2) & 3,
        (spritePalette1 >> 4) & 3,
        (spritePalette1 >> 6) & 3,
      ],
    };
  },

  retrieveSprites: (oamData: Uint8Array, line: number, spritesHeight: number): ISprite[] => {
    const sprites: ISprite[] = [];

    for (let i = 0; i < 40; i++) {
      // Only 10 sprites can be displayed for a given line
      // TODO Not sure this check should be done there since
      // a sprite can have a line with only transparent pixels.
      if (sprites.length >= 10) {
        break;
      }

      const yPos = oamData[i * 4] - 16;
      const xPos = oamData[(i * 4) + 1] - 8;

      // Filter sprites based on the current line
      if ((yPos <= line) && (yPos + spritesHeight > line)) {
        const spriteFlags = oamData[(i * 4) + 3];

        sprites.push({
          y: yPos,
          x: xPos,
          tile: oamData[(i * 4) + 2],
          priority: (spriteFlags >> 7) & 1,
          yFlip: ((spriteFlags >> 6) & 1) === 1,
          xFlip: ((spriteFlags >> 5) & 1) === 1,
          palette: (spriteFlags >> 4) & 1,
        });
      }
    }

    // Sort by x position to avoid doing it later.
    sprites.sort((a, b) => {
      return a.x - b.x;
    });

    return sprites;
  },

  renderLine: (addressBus: AddressBus, screenBuffer: Uint8Array, line: number): void => {
    const vramData = addressBus.getVideoRamSegment().data;
    const oamData = addressBus.getOamSegment().data;

    const lcdControl = PPU.readLcdcRegister(addressBus);
    const lcdPositions = PPU.readPosRegisters(addressBus);
    const palettes = PPU.readPaletteRegisters(addressBus);

    const bgMapOffset = (lcdControl.backgroundTileMap === TILE_MAP.MAP_1) ? 0x1800 : 0x1C00;
    const winMapOffset = (lcdControl.windowTileMap === TILE_MAP.MAP_1) ? 0x1800 : 0x1C00;

    const bgScrollX = lcdPositions.backgroundScrollX;
    const bgScrollY = lcdPositions.backgroundScrollY;

    const winPosX = lcdPositions.windowPositionX;
    const winPosY = lcdPositions.windowPositionY;

    // Retrieve sprites for the current line
    let sprites: ISprite[] = [];
    if (lcdControl.spritesEnabled) {
      sprites = PPU.retrieveSprites(oamData, line, lcdControl.spritesHeight);
    }

    // Render current line
    for (let i = 0; i < SCREEN_WIDTH; i++) {
      const isWindowPixel = lcdControl.windowEnabled && (winPosY <= line) && (winPosX <= i);
      const isBackgroundPixel = lcdControl.backgroundEnabled && !isWindowPixel;
      const screenBufferIndex = (line * SCREEN_WIDTH) + i;

      // Check if a sprite should be rendered
      let hasVisibleSprite = false;
      let spriteColor = 0;
      let spritePriority = SPRITE_PRIORITY.BELOW_BG;
      for (const sprite of sprites) {
        if (i >= sprite.x && i < (sprite.x + 8)) {
          const tileIndex = sprite.tile;
          const tileStartOffset = (16 * tileIndex);

          let tileColumn = i - sprite.x;
          let tileLine = line - sprite.y;

          if (sprite.xFlip) {
            tileColumn = 7 - tileColumn;
          }

          if (sprite.yFlip) {
            tileLine = lcdControl.spritesHeight - 1 - tileLine;
          }

          const spritePalette = sprite.palette ? palettes.spritePalette1 : palettes.spritePalette0;
          const tileOffset = tileStartOffset + (tileLine * 2);
          const color1 = (vramData[tileOffset] >> (7 - tileColumn)) & 1;
          const color2 = (vramData[tileOffset + 1] >> (7 - tileColumn)) & 1;
          const colorIndex = (color2 << 1) | color1;

          if (colorIndex !== 0) {
            hasVisibleSprite = true;
            spriteColor = spritePalette[colorIndex];
            spritePriority = sprite.priority;
            break;
          }
        }
      }

      // Render background
      if (isBackgroundPixel) {
        const mapPosX = Math.floor((bgScrollX + i) / 8) % 32;
        const mapPosY = Math.floor((bgScrollY + line) / 8) % 32;

        let tileIndex = vramData[bgMapOffset + mapPosY * 32 + mapPosX];
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileIndex = uint8ToInt8(tileIndex);
        }

        let tileStartOffset = (16 * tileIndex);
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileStartOffset += 0x1000;
        }

        const tileColumn = (i + bgScrollX) % 8;
        const tileLine = (line + bgScrollY) % 8;
        const tileOffset = tileStartOffset + (tileLine * 2);
        const color1 = (vramData[tileOffset] >> (7 - tileColumn)) & 1;
        const color2 = (vramData[tileOffset + 1] >> (7 - tileColumn)) & 1;
        const pixelColor = palettes.backgroundPalette[(color2 << 1) | color1];
        screenBuffer[screenBufferIndex] = pixelColor;
      }

      // Render window
      if (isWindowPixel) {
        const mapPosX = Math.floor((i - winPosX) / 8) % 32;
        const mapPosY = Math.floor((line - winPosY) / 8) % 32;

        let tileIndex = vramData[winMapOffset + mapPosY * 32 + mapPosX];
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileIndex = uint8ToInt8(tileIndex);
        }

        let tileStartOffset = (16 * tileIndex);
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileStartOffset += 0x1000;
        }

        const tileColumn = (i - winPosX) % 8;
        const tileLine = (line - winPosY) % 8;
        const tileOffset = tileStartOffset + (tileLine * 2);
        const color1 = (vramData[tileOffset] >> (7 - tileColumn)) & 1;
        const color2 = (vramData[tileOffset + 1] >> (7 - tileColumn)) & 1;
        const pixelColor = palettes.backgroundPalette[(color2 << 1) | color1];
        screenBuffer[screenBufferIndex] = pixelColor;
      }

      // Render sprite if there is one and if one of the two
      // following conditions is true:
      //   - Its priority is equal to "above background"
      //   - The current color (set by either the background
      //     or the window) is equal to 0
      if (hasVisibleSprite) {
        const spriteIsAbove = (spritePriority === SPRITE_PRIORITY.ABOVE_BG);
        const pixelIsFree = (screenBuffer[screenBufferIndex] === 0);
        if (spriteIsAbove || pixelIsFree) {
          screenBuffer[screenBufferIndex] = spriteColor;
        }
      }
    }
  }
};

export enum SPRITE_PRIORITY {
  ABOVE_BG,
  BELOW_BG,
}

export enum TILE_MAP {
  MAP_1,
  MAP_2,
}

export enum TILE_AREA {
  AREA_1,
  AREA_2,
}

export interface ISprite {
  y: number;
  x: number;
  tile: number;
  priority: SPRITE_PRIORITY;
  yFlip: boolean;
  xFlip: boolean;
  palette: number;
}
