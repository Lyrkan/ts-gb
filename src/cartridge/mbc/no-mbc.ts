import { IGameCartridgeMBC } from '../game-cartridge';
import { IMemorySegment } from '../../memory/memory-segment';
import { STATIC_FFFF_SEGMENT } from '../../memory/static-memory-segment';
import { MemorySegmentDecorator } from '../../memory/memory-segment-decorator';

export class NoMBC implements IGameCartridgeMBC {
  public readonly ramBank: IMemorySegment;
  private romBanks: IMemorySegment[];

  public constructor(romBanks: IMemorySegment[], ramBanks: IMemorySegment[]) {
    // Make sure nothing can write into ROM banks.
    // This can lead to issues with some games such as Tetris.
    this.romBanks = romBanks.slice(0, 2).map(bank =>
      new MemorySegmentDecorator(bank, {
        setByte: () => {  /* Do nothing */ }
      })
    );

    while (this.romBanks.length < 2) {
      this.romBanks.push(STATIC_FFFF_SEGMENT);
    }

    this.ramBank = ramBanks[0];
    if (!this.ramBank) {
      this.ramBank = STATIC_FFFF_SEGMENT;
    }
  }

  public get staticRomBank() {
    return this.romBanks[0];
  }

  public get switchableRomBank() {
    return this.romBanks[1];
  }
}
