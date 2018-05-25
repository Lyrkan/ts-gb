import { AddressBus } from '../memory/address-bus';
import { CpuRegisters } from './cpu-registers';
import { OPCODES } from './opcodes';

export class CPU {
  // Registers
  private registers: CpuRegisters;

  // Memory
  private addressBus: AddressBus;

  // How many cycles the CPU should skip
  private skipCyles: number;

  /**
   * Instanciate a new CPU.
   *
   * @param addressBus Mapped memory (ROM, RAM, VRAM, IO, ...)
   */
  public constructor(addressBus: AddressBus) {
    this.addressBus = addressBus;
    this.reset();
  }

  /**
   * Reset all registers
   */
  public reset(): void {
    this.registers = new CpuRegisters();
    this.skipCyles = 0;

    // If there isn't any boot ROM, directly
    // jump to 0x0100.
    if (this.addressBus.hasBootRom) {
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
      let errorMessage = `No opcode found for selector ${opcodeIndex}`;

      if (opcodePrefix) {
        errorMessage += ` (prefix ${opcodePrefix})`;
      }

      throw new Error(errorMessage);
    }

    // Run the opcode
    this.skipCyles = opcode(this.registers, this.addressBus) - 1;
  }
}
