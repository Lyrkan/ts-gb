export enum MBC_TYPE {
  NONE = 'NONE',
  MBC1 = 'MBC1',
  MBC2 = 'MBC2',
  MBC3 = 'MBC3',
  MBC5 = 'MBC5',
}

export const CARTRIDGE_INFO_MAP: { [index: number]: IPartialCartridgeInfo } = {
  0x00: { mbcType: MBC_TYPE.NONE, hasRam: false, hasTimer: false, hasRumble: false },
  0x01: { mbcType: MBC_TYPE.MBC1, hasRam: false, hasTimer: false, hasRumble: false },
  0x02: { mbcType: MBC_TYPE.MBC1, hasRam: true, hasTimer: false, hasRumble: false },
  0x03: { mbcType: MBC_TYPE.MBC1, hasRam: true, hasTimer: false, hasRumble: false },
  0x05: { mbcType: MBC_TYPE.MBC2, hasRam: false, hasTimer: false, hasRumble: false },
  0x06: { mbcType: MBC_TYPE.MBC2, hasRam: true, hasTimer: false, hasRumble: false },
  0x08: { mbcType: MBC_TYPE.NONE, hasRam: true, hasTimer: false, hasRumble: false },
  0x09: { mbcType: MBC_TYPE.NONE, hasRam: true, hasTimer: false, hasRumble: false },
  0x0F: { mbcType: MBC_TYPE.MBC3, hasRam: false, hasTimer: true, hasRumble: false },
  0x10: { mbcType: MBC_TYPE.MBC3, hasRam: true, hasTimer: true, hasRumble: false },
  0x11: { mbcType: MBC_TYPE.MBC3, hasRam: false, hasTimer: false, hasRumble: false },
  0x12: { mbcType: MBC_TYPE.MBC3, hasRam: true, hasTimer: false, hasRumble: false },
  0x13: { mbcType: MBC_TYPE.MBC3, hasRam: true, hasTimer: false, hasRumble: false },
  0x19: { mbcType: MBC_TYPE.MBC5, hasRam: false, hasTimer: false, hasRumble: false },
  0x1A: { mbcType: MBC_TYPE.MBC5, hasRam: true, hasTimer: false, hasRumble: false },
  0x1B: { mbcType: MBC_TYPE.MBC5, hasRam: true, hasTimer: false, hasRumble: false },
  0x1C: { mbcType: MBC_TYPE.MBC5, hasRam: false, hasTimer: false, hasRumble: false },
  0x1D: { mbcType: MBC_TYPE.MBC5, hasRam: false, hasTimer: false, hasRumble: true },
  0x1E: { mbcType: MBC_TYPE.MBC5, hasRam: false, hasTimer: false, hasRumble: true },
};

export interface IPartialCartridgeInfo {
  mbcType: MBC_TYPE;
  hasRam: boolean;
  hasTimer: boolean;
  hasRumble: boolean;
}

export interface IGameCartridgeInfo extends IPartialCartridgeInfo {
  gameTitle: string;
  romSize: number;
  ramSize: number;
}
