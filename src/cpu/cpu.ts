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
  private haltedLastCycle: boolean;

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
    this.haltedLastCycle = false;
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
    // Skip the current cycle if needed
    if (this.skipCyles > 0) {
      this.skipCyles--;
      return;
    }

    // Do nothing if stopped
    if (this.stopped) {
      return;
    }

    // If interrupts are enabled the CPU
    // won't do anything until an interrupt
    // occurs.
    //
    // If interrupts are disabled the halt
    // isn't effective... however we need
    // to know that the last instruction was
    // an HALT to emulate the HALT bug (repeated
    // instruction due to PC not being incremented
    // properly)
    if (this.halted) {
      if (this.interruptsEnabled) {
        return;
      } else {
        this.halted = false;
        this.haltedLastCycle = true;
      }
    } else if (this.haltedLastCycle) {
      this.haltedLastCycle = false;
    }

    // If there are pending interrupts and interrupts
    // are globally enabled, disable further interrupt
    // and execute one of the pending interrupts.
    if (this.interruptsEnabled && ((this.addressBus[0xFF0F].byte && 0x1F) > 0)) {
      this.interruptsEnabled = false;
      this.executeInterrupts();
    }

    // Execute the next OPCode
    this.executeOpcode();
  }

  private executeInterrupts(): void {
    const ieRegister = this.addressBus[0xFFFF].byte;
    const interruptFlags = this.addressBus[0xFF0F].byte;

    // V-Blank
    if ((ieRegister & 1) && (interruptFlags & 1)) {
      this.registers.PC = 0x0040;
      this.addressBus[0xFF0F].byte = this.addressBus[0xFF0F].byte & ~1;
      return;
    }

    // LCD STAT
    if ((ieRegister & 2) && (interruptFlags & 2)) {
      this.registers.PC = 0x0048;
      this.addressBus[0xFF0F].byte = this.addressBus[0xFF0F].byte & ~2;
      return;
    }

    // Timer
    if ((ieRegister & 4) && (interruptFlags & 4)) {
      this.registers.PC = 0x0050;
      this.addressBus[0xFF0F].byte = this.addressBus[0xFF0F].byte & ~4;
      return;
    }

    // Serial
    if ((ieRegister & 8) && (interruptFlags & 8)) {
      this.registers.PC = 0x0058;
      this.addressBus[0xFF0F].byte = this.addressBus[0xFF0F].byte & ~8;
      return;
    }

    // Joypad
    if ((ieRegister & 16) && (interruptFlags & 16)) {
      this.registers.PC = 0x0060;
      this.addressBus[0xFF0F].byte = this.addressBus[0xFF0F].byte & ~16;
      return;
    }
  }

  private executeOpcode(): void {
    // By default we'll use this opcode map
    let opcodesMap = OPCODES.default;

    // Check if the PC targets a prefixed opcode
    let opcodePrefix: number|null = null;
    let opcodeIndex = this.addressBus[this.registers.PC++].byte;

    // HALT bug
    if (this.haltedLastCycle) {
      this.registers.PC--;
    }

    if (opcodeIndex in OPCODES) {
      // Change the current opcode map
      opcodesMap = OPCODES[opcodeIndex];
      this.skipCyles += 4;

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
    this.skipCyles += opcode(this.registers, this.addressBus, this.cpuCallbacks) - 1;
  }
}
