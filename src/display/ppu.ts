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

  retrieveSprites: (attributes: Uint8Array, line: number, spritesSize: SPRITE_SIZE): ISprite[] => {
    const sprites: ISprite[] = [];
    const spritesHeight = (spritesSize === SPRITE_SIZE.SIZE_8x8) ? 8 : 16;

    for (let i = 0; i < 40; i++) {
      // Only 10 sprites can be displayed for a given line
      if (sprites.length >= 10) {
        break;
      }

      const yPos = attributes[i * 4] - 16;
      const xPos = attributes[(i * 4) + 1] - 8;

      // Filter sprites based on the current line
      if ((yPos <= line) && (yPos + spritesHeight >= line)) {
        const spriteFlags = attributes[(i * 4) + 3];

        sprites.push({
          y: yPos,
          x: xPos,
          tile: attributes[(i * 4) + 2],
          priority: (spriteFlags >> 7) & 1,
          yFlip: (spriteFlags >> 6) & 1,
          xFlip: (spriteFlags >> 5) & 1,
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

    const spriteAttributeTable = new Uint8Array(oamData.slice(0, 0x9F));
    const tileSets = new Uint8Array(vramData.slice(0, 0x17FF));
    const tileMap1 = new Uint8Array(vramData.slice(0x1800, 0x1BFF));
    const tileMap2 = new Uint8Array(vramData.slice(0x1C00, 0x1FFF));

    const backgroundMap = (lcdControl.backgroundTileMap === TILE_MAP.MAP_1) ? tileMap1 : tileMap2;
    const windowMap = (lcdControl.windowTileMap === TILE_MAP.MAP_1) ? tileMap1 : tileMap2;

    const bgScrollX = lcdPositions.backgroundScrollX;
    const bgScrollY = lcdPositions.backgroundScrollY;

    const winPosX = lcdPositions.windowPositionX;
    const winPosY = lcdPositions.windowPositionY;

    // Retrieve sprites for the current line
    let sprites: ISprite[] = [];
    if (lcdControl.spritesEnabled) {
      sprites = PPU.retrieveSprites(spriteAttributeTable, line, lcdControl.spritesSize);
    }

    // Render current line
    for (let i = 0; i < SCREEN_WIDTH; i++) {
      // Check if a sprite should be rendered
      let spriteColorIndex = 0;
      let spritePriority = SPRITE_PRIORITY.BELOW_BG;
      let spritePalette = palettes.spritePalette0;
      for (const sprite of sprites) {
        if (i >= sprite.x && i <= (sprite.x + 8)) {
          spritePriority = sprite.priority;
          spritePalette = sprite.palette ? palettes.spritePalette1 : palettes.spritePalette0;

          // TODO Retrieve color index
          spriteColorIndex = 1;
          break;
        }
      }

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
        const colorIndex = (color2 << 1) | color1;

        // Check if the background should be drawn.
        // That's the case if:
        //   - The current sprite (if there is one) is located below it
        //     and either the current background pixel has a color index
        //     greater than 0 or the current sprite pixel has a color index
        //     equals to 0.
        //   - The sprite is located above the background and its current
        //     pixel has a color index equals to 0.
        const isSpriteBelow = (spritePriority === SPRITE_PRIORITY.BELOW_BG);
        const drawBg =
          (isSpriteBelow && ((colorIndex > 0) || (spriteColorIndex === 0))) ||
          (spriteColorIndex === 0);

        if (drawBg) {
          const pixelColor = palettes.backgroundPalette[colorIndex];
          screenBuffer[(line * SCREEN_WIDTH) + i] = pixelColor;
        }
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
        const colorIndex = (color2 << 1) | color1;

        // Check if the background should be drawn.
        // The check are the same than for the background.
        const isSpriteBelow = (spritePriority === SPRITE_PRIORITY.BELOW_BG);
        const drawWindow =
          (isSpriteBelow && ((colorIndex > 0) || (spriteColorIndex === 0))) ||
          (spriteColorIndex === 0);

        if (drawWindow) {
          const pixelColor = palettes.backgroundPalette[(color2 << 1) | color1];
          screenBuffer[(line * SCREEN_WIDTH) + i] = pixelColor;
        }
      }

      // Render sprite if there is one
      if (spriteColorIndex > 0) {
        const pixelColor = spritePalette[spriteColorIndex];
        screenBuffer[(line * SCREEN_WIDTH) + i] = pixelColor;
      }
    }
  }
};

enum SPRITE_SIZE  {
  SIZE_8x8,
  SIZE_8x16
}

enum SPRITE_PRIORITY {
  ABOVE_BG,
  BELOW_BG,
}

enum TILE_MAP {
  MAP_1,
  MAP_2,
}

enum TILE_AREA {
  AREA_1,
  AREA_2,
}

interface ISprite {
  y: number;
  x: number;
  tile: number;
  priority: SPRITE_PRIORITY;
  yFlip: number;
  xFlip: number;
  palette: number;
}
