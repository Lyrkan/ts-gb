import { AddressBus } from '../memory/address-bus';
import { CpuRegisters } from './cpu-registers';
import { OPCODES, ICPUCallbacks } from './opcodes';

export class CPU {
  // Registers
  private registers: CpuRegisters;

  // Memory
  private addressBus: AddressBus;

  // How many cycles the CPU should skip
  private skipCyles: number;

  // Callbacks that can be used by opcodes
  private cpuCallbacks: ICPUCallbacks;

  // Whether or not the processor is stopped.
  // Should resume after a button is pressed.
  private stopped: boolean;

  // Whether or not the processor is halted.
  // Should resume
  private halted: boolean;

  // Whether or not interrupts are enabled.
  private interruptsEnabled: boolean;

  /**
   * Instanciate a new CPU.
   *
   * @param addressBus Mapped memory (ROM, RAM, VRAM, IO, ...)
   */
  public constructor(addressBus: AddressBus) {
    this.addressBus = addressBus;
    this.cpuCallbacks = {
      stop: () => { this.stopped = true; },
      halt: () => { this.halted = true; },
      enableInterrupts: () => { this.interruptsEnabled = true; },
      disableInterrupts: () => { this.interruptsEnabled = false; },
    };

    this.reset();
  }

  /**
   * Reset all registers
   */
  public reset(): void {
    this.registers = new CpuRegisters();
    this.skipCyles = 0;
    this.stopped = false;
    this.halted = false;
    this.interruptsEnabled = true;

    // If there isn't any boot ROM, directly
    // jump to 0x0100.
    if (this.addressBus.hasBootRom()) {
      this.registers.SP = 0xFFFE;
      this.registers.PC = 0x0100;
    }
  }

  /**
   * Run a single CPU cycle.
   */
  public tick(): void {
    // Do nothing if halted or stopped
    if (this.halted || this.stopped) {
      return;
    }

    // Skip the current cycle if needed
    if (this.skipCyles > 0) {
      this.skipCyles--;
      return;
    }

    // Process interrupts
    if (this.interruptsEnabled) {
      // TODO
    }

    // By default we'll use this opcode map
    let opcodesMap = OPCODES.default;

    // Check if the PC targets a prefixed opcode
    let opcodePrefix: number|null = null;
    let opcodeIndex = this.addressBus[this.registers.PC++].byte;

    if (opcodeIndex in OPCODES) {
      // Change the current opcode map
      opcodesMap = OPCODES[opcodeIndex];

      opcodePrefix = opcodeIndex;
      opcodeIndex = this.addressBus[this.registers.PC++].byte;
    }

    // Retrieve the actual opcode to check
    const opcode = opcodesMap[opcodeIndex];

    if (!opcode) {
      let errorMessage = `No opcode found for selector 0x${opcodeIndex.toString(16).toUpperCase()}`;

      if (opcodePrefix) {
        errorMessage += ` (prefix 0x${opcodePrefix.toString(16).toUpperCase()})`;
      }

      throw new Error(errorMessage);
    }

    // Run the opcode
    this.skipCyles = opcode(this.registers, this.addressBus, this.cpuCallbacks) - 1;
  }
}
