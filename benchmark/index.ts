// tslint:disable:no-console
import { CPU_CLOCK_FREQUENCY } from '../src/cpu/cpu';
import { System } from '../src/system';

const fs = require('fs');
const process = require('process');
const ora = require('ora');
const yargs = require('yargs');

let currentSpinner: any = null;

/**
 * Run a single test and return its duration in microseconds.
 *
 * @param romPath Path of the ROM
 * @param ticks How many CPU ticks should be executed
 */
function runSingleTest(romPath: string, ticks: number): number {
  const system = new System();
  const fileBuffer = fs.readFileSync(romPath);

  if (!fileBuffer) {
    throw new Error(`Could not open ROM file "${romPath}"`);
  }

  system.loadGame(
    fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength
    )
  );

  const start = process.hrtime();
  for (let i = 0; i < ticks; i++) {
    if (currentSpinner && (i % CPU_CLOCK_FREQUENCY) === 0) {
      currentSpinner.render();
    }

    system.tick();
  }

  const delta = process.hrtime(start);
  return (delta[0] * 1000000) + (delta[1] / 1000);
}

// Set-up command line arguments parser
const argv = yargs
  .usage('$0 <rom> [options]', 'Run a benchmark', (conf: any) => {
    conf.positional('rom', {
      describe: 'Path to the ROM that should be used',
      type: 'string',
    });
  })
  .help('help').alias('help', 'h')
  .version('1.0.0', 'version').alias('version', 'v')
  .options({
    iterations: {
      description: 'How many times the test should be executed',
      required: false,
      alias: 'i',
      type: 'number',
    },
    ticks: {
      description: 'How many ticks should be executed for a single test',
      required: false,
      alias: 't',
      type: 'number',
    },
  })
  .default('iterations', 1)
  .default('ticks', CPU_CLOCK_FREQUENCY * 10)
  .argv;

console.log(`
---------------------------
  Starting benchmark

  ROM: ${argv.rom}
  Iterations: ${argv.iterations}
  Ticks: ${argv.ticks}
---------------------------
`);

const results: number[] = [];
for (let i = 0; i < argv.iterations; i++) {
  currentSpinner = ora(`Running iteration ${i}`);
  results.push(runSingleTest(argv.rom, argv.ticks));
  currentSpinner.succeed();
}

const expectedTime = (argv.ticks / CPU_CLOCK_FREQUENCY) * 1000;
const total = results.reduce((prev, current) => prev + current, 0);
const mean = total / argv.iterations;
const meanFrequency = ((expectedTime * CPU_CLOCK_FREQUENCY) / mean) / 1000;

console.log(`
---------------------------
  Results
---------------------------

${results.map((res, index) => {
  const frequency = ((expectedTime * CPU_CLOCK_FREQUENCY) / res) / 1000;
  return `[${index}] ${Math.round(res)}μs (${frequency.toFixed(4)}Mhz)`;
}).join('\n')}

Mean: ${Math.round(mean)}μs (${meanFrequency.toFixed(4)}MHz)
`);
