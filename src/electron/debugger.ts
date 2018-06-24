// tslint:disable:no-console
import { CPU } from '../cpu/cpu';
import { AddressBus } from '../memory/address-bus';
import { OPCODES, OPCODES_NAMES } from '../cpu/opcodes';

export class Debugger {
  private cpu: CPU;
  private addressBus: AddressBus;
  private paused: boolean;
  private mode: DEBUGGER_MODE;
  private breakpoints: Breakpoint[];
  private previousPC: number;

  public constructor(cpu: CPU, addressBus: AddressBus) {
    this.cpu = cpu;
    this.addressBus = addressBus;
    this.paused = false;
    this.mode = DEBUGGER_MODE.NORMAL;
    this.breakpoints = [];
    this.previousPC = -1;
  }

  public tick(): void {
    // Because a CPU instruction can extend over multiple
    // ticks, don't do anything if the PC hasn't changed
    // since the last call.
    if (this.cpu.getRegisters().PC !== this.previousPC) {
      for (const breakpoint of this.breakpoints) {
        // Pause if a breakpoint check returns true
        if (breakpoint.check(this.cpu, this.addressBus)) {
          console.log(`[Debugger] Breakpoint: ${breakpoint.name}`);
          this.paused = true;
        }
      }

      if (this.mode >= DEBUGGER_MODE.TRACE) {
        this.dumpOpcode();
      }

      if (this.mode >= DEBUGGER_MODE.DETAILLED) {
        this.dumpRegisters();
      }

      this.previousPC = this.cpu.getRegisters().PC;
    }
  }

  public pause(): void {
    console.log('[Debug] Pausing emulation');
    this.paused = true;
  }

  public unpause(): void {
    console.log('[Debugger] Unpausing emulation');
    this.paused = false;
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public setMode(mode: DEBUGGER_MODE) {
    console.log(`[Debugger] New mode: `, mode);
    this.mode = mode;
  }

  public addBreakpoint(name: string, check: BreakpointCheck): void {
    console.log(`[Debugger] Adding new breakpoint "${name}"`);
    this.breakpoints.push({
      name,
      check,
    });
  }

  public dumpOpcode(): void {
    let opcodesNamesMap = OPCODES_NAMES.default;
    let opcodePrefix: number|null = null;
    let opcodeIndex = this.addressBus.getByte(this.cpu.getRegisters().PC);
    if (opcodeIndex in OPCODES) {
      opcodesNamesMap = OPCODES_NAMES[opcodeIndex];
      opcodePrefix = opcodeIndex;
      opcodeIndex = this.addressBus.getByte(this.cpu.getRegisters().PC + 1);
    }

    let opcodeDescription = `0x${opcodeIndex.toString(16)} - ${opcodesNamesMap[opcodeIndex]}`;
    if (opcodePrefix !== null) {
      opcodeDescription = `0x${opcodePrefix.toString(16)} ${opcodeDescription}`;
    }

    console.log(`[Debugger] ${opcodeDescription}`);
  }

  public dumpRegisters(): void {
    const registers = this.cpu.getRegisters();

    console.log(`[Debugger] Registers state:
      A=0x${registers.A.toString(16)}, F=0x${registers.F.toString(16)},
      B=0x${registers.B.toString(16)}, C=0x${registers.C.toString(16)},
      D=0x${registers.D.toString(16)}, E=0x${registers.E.toString(16)},
      H=0x${registers.H.toString(16)}, L=0x${registers.L.toString(16)},
      PC=0x${registers.PC.toString(16)}, SP=0x${registers.SP.toString(16)}
      Z=${registers.flags.Z}, N=${registers.flags.N}, H=${registers.flags.H}, C=${registers.flags.C}
    `);
  }

  public dumpVram(): void {
    console.log(new Uint8Array(this.addressBus.getVideoRamSegment().data));
  }
}

export interface Breakpoint {
  name: string;
  check: BreakpointCheck;
}

export type BreakpointCheck = (cpu: CPU, addressBus: AddressBus) => boolean;

export enum DEBUGGER_MODE {
  NORMAL = 0,
  TRACE = 1,
  DETAILLED = 2,
}
