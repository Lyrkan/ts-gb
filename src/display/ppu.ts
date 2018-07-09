import { AddressBus, EMULATION_MODE } from '../memory/address-bus';
import { SCREEN_WIDTH, Display } from './display';
import { uint8ToInt8 } from '../utils';

export const PPU = {
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
          vramBank: (spriteFlags >> 3) & 1,
          cgbPalette: (spriteFlags & 0b111)
        });
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
    const oamData = addressBus.getOamSegment().data;

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
      const isWindowPixel = lcdControl.windowEnabled && (winPosY <= line) && (winPosX <= i);
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
                addressBus.getCgbSpritePalettes(),
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
        const mapPosX = Math.floor((bgScrollX + i) / 8) % 32;
        const mapPosY = Math.floor((bgScrollY + line) / 8) % 32;

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

        let tileColumn = (i + bgScrollX) % 8;
        let tileLine = (line + bgScrollY) % 8;

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
            addressBus.getCgbBackgroundPalettes(),
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
        const mapPosX = Math.floor((i - winPosX) / 8) % 32;
        const mapPosY = Math.floor((line - winPosY) / 8) % 32;

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

        let tileColumn = (i - winPosX) % 8;
        let tileLine = (line - winPosY) % 8;

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
            addressBus.getCgbBackgroundPalettes(),
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
