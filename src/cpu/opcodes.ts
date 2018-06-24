import { CpuRegisters } from './cpu-registers';
import { AddressBus } from '../memory/address-bus';
import { OPCODES_0XCB, OPCODES_0XCB_NAMES } from './opcodes/opcodes-0xCB';
import { OPCODES_DEFAULT, OPCODES_DEFAULT_NAMES } from './opcodes/opcodes-default';

export const OPCODES: { [index: string]: IOpcodesMap } = {
  default: OPCODES_DEFAULT,
  0xCB: OPCODES_0XCB
};

export const OPCODES_NAMES: { [index: string]: IOpcodesNamesMap } = {
  default: OPCODES_DEFAULT_NAMES,
  0xCB: OPCODES_0XCB_NAMES,
};

export interface IOpcodesMap {
  [index: number]: (
    registers: CpuRegisters,
    addressBus: AddressBus,
    cpuCallbacks?: ICPUCallbacks
  ) => number;
}

export interface IOpcodesNamesMap {
  [index: number]: string;
}

export interface ICPUCallbacks {
  stop: () => void;
  halt: () => void;
  enableInterrupts: () => void;
  disableInterrupts: () => void;
}
