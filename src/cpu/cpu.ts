import { AddressBus } from '../memory/address-bus';
import { CpuRegisters } from './cpu-registers';
import { OPCODES, ICPUCallbacks } from './opcodes';
import { CpuTimer } from './cpu-timer';
import { Display } from '../display/display';
import { checkBit } from '../utils';

export class CPU {
  // Registers
  private registers: CpuRegisters;

  // Memory
  private addressBus: AddressBus;

  // Display
  private display: Display;

  // Whether or not this is the first cycle
  private firstCycle: boolean;

  // How many cycles the CPU should skip
  private skipCycles: number;

  // Callbacks that can be used by opcodes
  private cpuCallbacks: ICPUCallbacks;

  // Whether or not the processor is stopped.
  // Should resume after a button is pressed.
  private stopped: boolean;

  // Whether or not the processor is halted.
  private halted: boolean;
  private haltBug: boolean;

  // Whether or not interrupts are enabled.
  private interruptsEnabled: boolean;

  // Timer management
  private timer: CpuTimer;

  /**
   * Instanciate a new CPU.
   *
   * @param addressBus Mapped memory (ROM, RAM, VRAM, IO, ...)
   */
  public constructor(addressBus: AddressBus, display: Display) {
    this.addressBus = addressBus;
    this.display = display;
    this.timer = new CpuTimer(this.addressBus);
    this.cpuCallbacks = {
      stop: () => { this.stopped = true; },
      halt: () => {
        if (this.interruptsEnabled) {
          // If the interrupt master flag is true, the HALT
          // is executed normally.
          this.halted = true;
        } else {
          const interruptFlags = this.addressBus.getByte(0xFF0F);
          const ieRegister = this.addressBus.getByte(0xFFFF);
          if ((interruptFlags & ieRegister & 0x1F) === 0) {
            // If the interrupt master flag if false and no interrupt
            // is currently triggered, HALT mode is entered.
            // It will exit once an enabled interrupt is triggered but
            // the interrupt will not be serviced and the interrupt flag
            // will not be cleared.
            this.halted = true;
          } else {
            // If the interrupt master flag is false and an enabled
            // interrupt is triggered then the HALT mode is not entered
            // but the CPU will encounter the HALT bug (PC not incremented
            // for the 1st byte of the next instruction).
            this.haltBug = true;
          }
        }
      },
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
    this.timer.reset();
    this.skipCycles = 0;
    this.firstCycle = true;
    this.stopped = false;
    this.halted = false;
    this.haltBug = false;
    this.interruptsEnabled = false;
  }

  /**
   * Run a single CPU cycle.
   */
  public tick(): void {
    if (this.firstCycle) {
      // If there isn't any boot ROM, directly
      // jump to 0x0100.
      if (!this.addressBus.hasBootRom()) {
        this.registers.AF = 0x01B0;
        this.registers.BC = 0x0013;
        this.registers.DE = 0x00D8;
        this.registers.HL = 0x014D;
        this.registers.SP = 0xFFFE;
        this.registers.PC = 0x0100;
      }

      this.firstCycle = false;
    }

    // Update timers
    this.timer.tick();
    this.display.tick();

    // Skip the current cycle if needed
    // (but still update the timer)
    if (this.skipCycles > 0) {
      this.skipCycles--;
      return;
    }

    // Execute pending interrupts (if enabled)
    // If the CPU is halted it may result in it
    // leaving this state.
    this.executeInterrupts();
    if (this.skipCycles > 0) {
      this.skipCycles--;
      return;
    }

    // Do nothing if stopped until a button
    // is pressed.
    if (this.stopped) {
      if (!checkBit(4, this.addressBus.getByte(0xFF0F))) {
        return;
      }

      this.stopped = false;
    }

    // If the CPU is halted but interrupts are not
    // globally enabled, check if an enabled interrupt
    // has been triggered. This won't execute the
    // interrupt but will make the CPU leave that state.
    if (this.halted) {
      if (!this.interruptsEnabled) {
        // Check if an interrupt is enabled
        const interruptFlags = this.addressBus.getByte(0xFF0F);
        if ((interruptFlags & 0x1F) === 0) {
          return;
        }

        // Check if an enabled interrupt has been triggered
        const ieRegister = this.addressBus.getByte(0xFFFF);
        for (let bit = 0; bit < 5; bit++) {
          if (checkBit(bit, ieRegister) && checkBit(bit, interruptFlags)) {
            // If interrupts are globally disabled we need
            // to know that the last instruction was an
            // HALT to emulate the HALT bug (repeated
            // instruction due to PC not being incremented
            // properly)
            this.halted = false;
            break;
          }
        }
      }

      return;
    }

    // Execute the next OPCode
    this.executeOpcode();
  }

  /**
   * Retrieve CPU registers.
   */
  public getRegisters(): CpuRegisters {
    return this.registers;
  }

  private executeInterrupts(): void {
    // Check if interrupts are globally enabled
    if (!this.interruptsEnabled) {
      return;
    }

    // Check if there is at least one pending interrupt
    const interruptFlags = this.addressBus.getByte(0xFF0F);
    if ((interruptFlags & 0x1F) === 0) {
      return;
    }

    // Check each interrupt state
    const ieRegister = this.addressBus.getByte(0xFFFF);

    for (let bit = 0; bit < 5; bit++) {
      if (checkBit(bit, ieRegister) && checkBit(bit, interruptFlags)) {
        // An interrupt takes 5 cycles to dispatch
        this.skipCycles = 5;

        // Disable further interrupts.
        this.interruptsEnabled = false;

        // Disable halt
        // It takes one more cycle
        if (this.halted) {
          this.halted = false;
          this.skipCycles += 1;
        }

        // Push PC into stack
        this.registers.SP -= 2;
        this.addressBus.setWord(this.registers.SP, this.registers.PC);

        // Jump to the interrupt address
        this.registers.PC = 0x0040 + (8 * bit);

        // Disable this interrupt
        this.addressBus.setByte(0xFF0F, interruptFlags & ~(1 << bit));
        return;
      }
    }
  }

  private executeOpcode(): void {
    // By default we'll use this opcode map
    let opcodesMap = OPCODES.default;

    // Check if the PC targets a prefixed opcode
    let opcodePrefix: number|null = null;
    let opcodeIndex = this.addressBus.getByte(this.registers.PC++);

    // HALT bug
    if (this.haltBug) {
      this.registers.PC--;
      this.haltBug = false;
    }

    if (opcodeIndex in OPCODES) {
      // Change the current opcode map
      opcodesMap = OPCODES[opcodeIndex];
      this.skipCycles += 1;

      opcodePrefix = opcodeIndex;
      opcodeIndex = this.addressBus.getByte(this.registers.PC++);
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
    this.skipCycles += opcode(this.registers, this.addressBus, this.cpuCallbacks) - 1;
  }
}

export const CPU_CLOCK_FREQUENCY = 1024 * 1024;
