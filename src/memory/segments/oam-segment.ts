import { MemorySegment } from './memory-segment';
import { OAM_LENGTH } from '../address-bus';
import { ISprite, SPRITE_PRIORITY } from '../../display/ppu';

const SPRITES_COUNT = 40;

export class OAMSegment extends MemorySegment {
  public readonly spriteCache: ISprite[];

  public constructor() {
    super (OAM_LENGTH);

    // Init an empty sprite cache
    this.spriteCache = [];
    for (let i = 0; i < SPRITES_COUNT; i++) {
      this.spriteCache.push({
        y: 0,
        x: 0,
        tile: 0,
        priority: SPRITE_PRIORITY.ABOVE_BG,
        yFlip: false,
        xFlip: false,
        palette: 0,
        vramBank: 0,
        cgbPalette: 0,
      });
    }
  }

  public setByte(offset: number, value: number) {
    super.setByte(offset, value);

    const sprite = this.spriteCache[Math.floor(offset / 4)];
    const attributeIndex = (offset % 4);

    if (attributeIndex === 0) {
      sprite.y = value - 16;
    } else if (attributeIndex === 1) {
      sprite.x = value - 8;
    } else if (attributeIndex === 2) {
      sprite.tile = value;
    } else if (attributeIndex === 3) {
      sprite.priority = (value >> 7) & 1;
      sprite.yFlip = ((value >> 6) & 1) === 1;
      sprite.xFlip = ((value >> 5) & 1) === 1;
      sprite.palette = (value >> 4) & 1;
      sprite.vramBank = (value >> 3) & 1;
      sprite.cgbPalette = value & 0b111;
    }
  }
}
