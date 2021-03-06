import { AddressBus, EMULATION_MODE } from '../memory/address-bus';
import { SCREEN_WIDTH, Display } from './display';
import { uint8ToInt8 } from '../utils';

export const PPU = {
  retrieveSprites: (oamSprites: ISprite[], line: number, spritesHeight: number): ISprite[] => {
    const sprites: ISprite[] = [];

    for (const oamSprite of oamSprites) {
      // Only 10 sprites can be displayed for a given line
      if (sprites.length >= 10) {
        break;
      }

      if ((oamSprite.y <= line) && (oamSprite.y + spritesHeight > line)) {
        sprites.push(oamSprite);
      }
    }

    return sprites;
  },

  readCgbPaletteColor: (palettes: number[], paletteIndex: number, colorIndex: number): number[] => {
    const color =
      palettes[(paletteIndex * 8) + (colorIndex * 2) + 1] << 8 |
      palettes[(paletteIndex * 8) + (colorIndex * 2)];

    return [
      (color & 0x1F) * 8,
      ((color >> 5) & 0x1F) * 8,
      ((color >> 10) & 0x1F) * 8,
    ];
  },

  renderLine: (
    display: Display,
    addressBus: AddressBus,
    line: number
  ): void => {
    const lcdControl = display.getLcdControl();
    const screenBuffer = display.getBackBuffer();
    const isCgbMode = addressBus.getEmulationMode() === EMULATION_MODE.CGB;

    const vramData = addressBus.getVideoRamBanks().map(bank => bank.data);
    const oamSprites = addressBus.getOamSegment().spriteCache;

    const bgMapOffset = (lcdControl.backgroundTileMap === TILE_MAP.MAP_1) ? 0x1800 : 0x1C00;
    const winMapOffset = (lcdControl.windowTileMap === TILE_MAP.MAP_1) ? 0x1800 : 0x1C00;

    const { backgroundScrollX, backgroundScrollY } = display.getLcdPosition();
    const { windowPositionX, windowPositionY } = display.getLcdPosition();

    const palettes = display.getLcdPalettes();
    const cgbSpritePalettes = display.getCgbSpritePalettes();
    const cgbBackgroundPalettes = display.getCgbBackgroundPalettes();

    // Retrieve sprites for the current line
    let sprites: ISprite[] = [];
    if (lcdControl.spritesEnabled) {
      sprites = PPU.retrieveSprites(oamSprites, line, lcdControl.spritesHeight);

      if (!isCgbMode) {
        // In Non-CGB mode sprites are sorted on
        // their x position coordinate.
        sprites.sort((a, b) => {
          return a.x - b.x;
        });
      }
    }

    // Render current line
    for (let i = 0; i < SCREEN_WIDTH; i++) {
      const isWindowPixel =
        lcdControl.windowEnabled &&
        (windowPositionY <= line) &&
        (windowPositionX <= i);
      const isBackgroundPixel = (isCgbMode || lcdControl.backgroundEnabled) && !isWindowPixel;
      const screenBufferIndex = (line * (SCREEN_WIDTH * 3)) + (i * 3);

      let pixelIsFree = true;

      // Check if a sprite should be rendered
      let hasVisibleSprite = false;
      let spriteColor = [255, 255, 255];
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

          const tileOffset = tileStartOffset + (tileLine * 2);

          const vramSpriteData = isCgbMode ? vramData[sprite.vramBank] : vramData[0];
          const color1 = (vramSpriteData[tileOffset] >> (7 - tileColumn)) & 1;
          const color2 = (vramSpriteData[tileOffset + 1] >> (7 - tileColumn)) & 1;
          const colorIndex = (color2 << 1) | color1;

          if (colorIndex !== 0) {
            hasVisibleSprite = true;
            spritePriority = sprite.priority;

            if (isCgbMode) {
              spriteColor = PPU.readCgbPaletteColor(
                cgbSpritePalettes,
                sprite.cgbPalette,
                colorIndex
              );
            } else {
              const dmgPalette = sprite.palette ? palettes.spritePalette1 : palettes.spritePalette0;
              spriteColor = [
                DMG_COLORS[dmgPalette[colorIndex]],
                DMG_COLORS[dmgPalette[colorIndex]],
                DMG_COLORS[dmgPalette[colorIndex]],
              ];
            }
            break;
          }
        }
      }

      // Render background
      if (isCgbMode || isBackgroundPixel) {
        const mapPosX = Math.floor((backgroundScrollX + i) / 8) % 32;
        const mapPosY = Math.floor((backgroundScrollY + line) / 8) % 32;

        let tileIndex = vramData[0][bgMapOffset + mapPosY * 32 + mapPosX];
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileIndex = uint8ToInt8(tileIndex);
        }

        let tileStartOffset = (16 * tileIndex);
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileStartOffset += 0x1000;
        }

        let paletteIndex = 0;
        let vramBankIndex = 0;
        let xFlip = false;
        let yFlip = false;
        let forceAbove = false;

        if (isCgbMode) {
          const tileAttributes = vramData[1][bgMapOffset + mapPosY * 32 + mapPosX];
          paletteIndex = tileAttributes & 0b111;
          vramBankIndex = (tileAttributes >> 3) & 1;
          xFlip = ((tileAttributes >> 5) & 1) === 1;
          yFlip = ((tileAttributes >> 6) & 1) === 1;
          forceAbove = ((tileAttributes >> 7) & 1) === 1;
        }

        let tileColumn = (i + backgroundScrollX) % 8;
        let tileLine = (line + backgroundScrollY) % 8;

        if (xFlip) {
          tileColumn = 7 - tileColumn;
        }

        if (yFlip) {
          tileLine = 7 - tileLine;
        }

        const tileOffset = tileStartOffset + (tileLine * 2);
        const color1 = (vramData[vramBankIndex][tileOffset] >> (7 - tileColumn)) & 1;
        const color2 = (vramData[vramBankIndex][tileOffset + 1] >> (7 - tileColumn)) & 1;
        const colorIndex = (color2 << 1) | color1;

        if (isCgbMode) {
          const color = PPU.readCgbPaletteColor(
            cgbBackgroundPalettes,
            paletteIndex,
            colorIndex
          );

          screenBuffer[screenBufferIndex] = color[0];
          screenBuffer[screenBufferIndex + 1] = color[1];
          screenBuffer[screenBufferIndex + 2] = color[2];
        } else {
          const pixelColor = palettes.backgroundPalette[colorIndex];
          screenBuffer[screenBufferIndex] = DMG_COLORS[pixelColor];
          screenBuffer[screenBufferIndex + 1] = DMG_COLORS[pixelColor];
          screenBuffer[screenBufferIndex + 2] = DMG_COLORS[pixelColor];
        }

        if (colorIndex !== 0) {
          pixelIsFree = false;
        }

        if (forceAbove) {
          spritePriority = SPRITE_PRIORITY.BELOW_BG;
        }
      } else {
        screenBuffer[screenBufferIndex] = DMG_COLORS[0];
        screenBuffer[screenBufferIndex + 1] = DMG_COLORS[0];
        screenBuffer[screenBufferIndex + 2] = DMG_COLORS[0];
      }

      // Render window
      if (isWindowPixel) {
        const mapPosX = Math.floor((i - windowPositionX) / 8) % 32;
        const mapPosY = Math.floor((line - windowPositionY) / 8) % 32;

        let tileIndex = vramData[0][winMapOffset + mapPosY * 32 + mapPosX];
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileIndex = uint8ToInt8(tileIndex);
        }

        let tileStartOffset = (16 * tileIndex);
        if (lcdControl.backgroundTileArea === TILE_AREA.AREA_1) {
          tileStartOffset += 0x1000;
        }

        let paletteIndex = 0;
        let vramBankIndex = 0;
        let xFlip = false;
        let yFlip = false;
        let forceAbove = false;

        if (isCgbMode) {
          const tileAttributes = vramData[1][winMapOffset + mapPosY * 32 + mapPosX];
          paletteIndex = tileAttributes & 0b111;
          vramBankIndex = (tileAttributes >> 3) & 1;
          xFlip = ((tileAttributes >> 5) & 1) === 1;
          yFlip = ((tileAttributes >> 6) & 1) === 1;
          forceAbove = ((tileAttributes >> 7) & 1) === 1;
        }

        let tileColumn = (i - windowPositionX) % 8;
        let tileLine = (line - windowPositionY) % 8;

        if (xFlip) {
          tileColumn = 7 - tileColumn;
        }

        if (yFlip) {
          tileLine = 7 - tileLine;
        }

        const tileOffset = tileStartOffset + (tileLine * 2);
        const color1 = (vramData[vramBankIndex][tileOffset] >> (7 - tileColumn)) & 1;
        const color2 = (vramData[vramBankIndex][tileOffset + 1] >> (7 - tileColumn)) & 1;
        const colorIndex = (color2 << 1) | color1;

        if (isCgbMode) {
          const color = PPU.readCgbPaletteColor(
            cgbBackgroundPalettes,
            paletteIndex,
            colorIndex
          );

          screenBuffer[screenBufferIndex] = color[0];
          screenBuffer[screenBufferIndex + 1] = color[1];
          screenBuffer[screenBufferIndex + 2] = color[2];
        } else {
          const pixelColor = palettes.backgroundPalette[colorIndex];
          screenBuffer[screenBufferIndex] = DMG_COLORS[pixelColor];
          screenBuffer[screenBufferIndex + 1] = DMG_COLORS[pixelColor];
          screenBuffer[screenBufferIndex + 2] = DMG_COLORS[pixelColor];
        }

        if (colorIndex !== 0) {
          pixelIsFree = false;
        }

        if (forceAbove) {
          spritePriority = SPRITE_PRIORITY.BELOW_BG;
        }
      }

      // In CGB mode if the BG display flag is off the background
      // and the window lose their priority.
      if (isCgbMode && !lcdControl.backgroundEnabled) {
        spritePriority = SPRITE_PRIORITY.ABOVE_BG;
      }

      // Render sprite if there is one and if one of the two
      // following conditions is true:
      //   - Its priority is equal to "above background"
      //   - The current color (set by either the background
      //     or the window) is equal to 0
      if (hasVisibleSprite) {
        const spriteIsAbove = (spritePriority === SPRITE_PRIORITY.ABOVE_BG);

        if (spriteIsAbove || pixelIsFree) {
          screenBuffer[screenBufferIndex] = spriteColor[0];
          screenBuffer[screenBufferIndex + 1] = spriteColor[1];
          screenBuffer[screenBufferIndex + 2] = spriteColor[2];
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
  vramBank: number;
  cgbPalette: number;
}

const DMG_COLORS = [230, 160, 80, 20];
