import { AbstractMBC } from './abstract-mbc';
import { IMemorySegment } from '../../memory/memory-segment';
import { STATIC_FFFF_SEGMENT } from '../../memory/static-memory-segment';
import { MemorySegmentDecorator } from '../../memory/memory-segment-decorator';
import { IGameCartridgeInfo } from '../game-cartridge-info';

export class NoMBC extends AbstractMBC {
  private decoratedRomBanks: IMemorySegment[];
  private decoratedRamBank: IMemorySegment;

  public constructor(
    cartridgeInfo: IGameCartridgeInfo,
    romBanks: IMemorySegment[],
    ramBanks: IMemorySegment[]
  ) {
    super(cartridgeInfo, romBanks, ramBanks);

    // Make sure nothing can write into ROM banks.
    // This can lead to issues with some games such as Tetris.
    this.decoratedRomBanks = this.romBanks.slice(0, 2).map(bank =>
      new MemorySegmentDecorator(bank, {
        setByte: () => {  /* Do nothing */ }
      })
    );

    while (this.decoratedRomBanks.length < 2) {
      this.decoratedRomBanks.push(STATIC_FFFF_SEGMENT);
    }

    // No MBC = no RAM
    this.decoratedRamBank = STATIC_FFFF_SEGMENT;
  }

  public get staticRomBank() {
    return this.decoratedRomBanks[0];
  }

  public get switchableRomBank() {
    return this.decoratedRomBanks[1];
  }

  public get ramBank() {
    return this.decoratedRamBank;
  }
}
