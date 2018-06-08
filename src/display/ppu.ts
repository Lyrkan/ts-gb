import { AddressBus } from '../memory/address-bus';
import { SCREEN_WIDTH } from './display';
import { checkBit, uint8ToInt8 } from '../utils';

export const PPU = {
  readLcdcRegister: (addressBus: AddressBus) => {
    const lcdcRegister = addressBus.get(0xFF40).byte;
    return {
      backgroundEnabled: checkBit(0, lcdcRegister),
      spritesEnabled: checkBit(1, lcdcRegister),
      spritesSize: checkBit(2, lcdcRegister) ? SPRITE_SIZE.SIZE_8x16 : SPRITE_SIZE.SIZE_8x8,
      backgroundTileMap: checkBit(3, lcdcRegister) ? TILE_MAP.MAP_2 : TILE_MAP.MAP_1,
      backgroundTileArea: checkBit(4, lcdcRegister) ? TILE_AREA.AREA_2 : TILE_AREA.AREA_1,
      windowEnabled: checkBit(5, lcdcRegister),
      windowTileMap: checkBit(6, lcdcRegister) ? TILE_MAP.MAP_2 : TILE_MAP.MAP_1,
      lcdEnabled: checkBit(7, lcdcRegister),
    };
  },

  readPosRegisters: (addressBus: AddressBus) => {
    const backgroundScroll = addressBus.get(0xFF42).word;
    const windowPosition = addressBus.get(0xFF4A).word;
    return {
      backgroundScrollY: backgroundScroll & 0xFF,
      backgroundScrollX: backgroundScroll >> 8,
      windowPositionY: windowPosition & 0xFF,
      windowPositionX: (windowPosition >> 8) - 7,
    };
  },

  readPaletteRegisters: (addressBus: AddressBus) => {
    const backgroundPalette = addressBus.get(0xFF47).byte;
    const spritePalette0 = addressBus.get(0xFF48).byte;
    const spritePalette1 = addressBus.get(0xFF49).byte;

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

  renderLine: (addressBus: AddressBus, screenBuffer: Uint8Array, line: number): void => {
    const vramData = addressBus.getVideoRamSegment().data;
    const lcdControl = PPU.readLcdcRegister(addressBus);
    const lcdPositions = PPU.readPosRegisters(addressBus);
    const palettes = PPU.readPaletteRegisters(addressBus);

    const tileSets = new Uint8Array(vramData.slice(0, 0x17FF));
    const tileMap1 = new Uint8Array(vramData.slice(0x1800, 0x1BFF));
    const tileMap2 = new Uint8Array(vramData.slice(0x1C00, 0x1FFF));

    const backgroundMap = (lcdControl.backgroundTileMap === TILE_MAP.MAP_1) ? tileMap1 : tileMap2;
    const windowMap = (lcdControl.windowTileMap === TILE_MAP.MAP_1) ? tileMap1 : tileMap2;

    const bgScrollX = lcdPositions.backgroundScrollX;
    const bgScrollY = lcdPositions.backgroundScrollY;

    const winPosX = lcdPositions.windowPositionX;
    const winPosY = lcdPositions.windowPositionY;

    for (let i = 0; i < SCREEN_WIDTH; i++) {
      // Render background
      if (lcdControl.backgroundEnabled) {
        const mapPosX = Math.floor((bgScrollX + i) / 8) % 32;
        const mapPosY = Math.floor((bgScrollY + line) / 8) % 32;

        let tileIndex = backgroundMap[mapPosY * 32 + mapPosX];
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileIndex = uint8ToInt8(tileIndex);
        }

        let tileStartOffset = (16 * tileIndex);
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileStartOffset += 0x1000;
        }

        const tileColumn = (i + bgScrollX) % 8;
        const tileLine = (line + bgScrollY) % 8;
        const color1 = (tileSets[tileStartOffset + (tileLine * 2)] >> (7 - tileColumn)) & 1;
        const color2 = (tileSets[tileStartOffset + (tileLine * 2) + 1] >> (7 - tileColumn)) & 1;

        const pixelColor = palettes.backgroundPalette[(color2 << 1) | color1];
        screenBuffer[(line * SCREEN_WIDTH) + i] = pixelColor;
      }

      // Render window
      if (lcdControl.windowEnabled && (lcdPositions.windowPositionY <= line) && (winPosX <= i)) {
        const mapPosX = Math.floor((i - winPosX) / 8) % 32;
        const mapPosY = Math.floor((line - winPosY) / 8) % 32;

        let tileIndex = windowMap[mapPosY * 32 + mapPosX];
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileIndex = uint8ToInt8(tileIndex);
        }

        let tileStartOffset = (16 * tileIndex);
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileStartOffset += 0x1000;
        }

        const tileColumn = (i - winPosX) % 8;
        const tileLine = (line - winPosY) % 8;
        const color1 = (tileSets[tileStartOffset + (tileLine * 2)] >> (7 - tileColumn)) & 1;
        const color2 = (tileSets[tileStartOffset + (tileLine * 2) + 1] >> (7 - tileColumn)) & 1;

        const pixelColor = palettes.backgroundPalette[(color2 << 1) | color1];
        screenBuffer[(line * SCREEN_WIDTH) + i] = pixelColor;
      }
    }
  }
};

enum SPRITE_SIZE  {
  SIZE_8x8,
  SIZE_8x16
}

enum TILE_MAP {
  MAP_1,
  MAP_2,
}

enum TILE_AREA {
  AREA_1,
  AREA_2,
}
