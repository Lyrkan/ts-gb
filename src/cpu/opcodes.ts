import { CpuRegisters } from './cpu-registers';
import { AddressBus } from '../memory/address-bus';
import { OPCODES_0XCB } from './opcodes/opcodes-0xCB';
import { OPCODES_DEFAULT } from './opcodes/opcodes-default';

export const OPCODES: { [index: string]: IOpcodesMap } = {
  default: OPCODES_DEFAULT,
  0xCB: OPCODES_0XCB
};

export interface IOpcodesMap {
  [index: number]: (registers: CpuRegisters, addressBus: AddressBus) => number;
}
