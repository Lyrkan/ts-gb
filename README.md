TS-GB
===

[![Build Status](https://travis-ci.org/Lyrkan/ts-gb.svg?branch=master)](https://travis-ci.org/Lyrkan/ts-gb)

TypeScript Game Boy emulator (WIP)

![Asterix ran on ts-gb](images/asterix.gif)

# How to use it

You can either directly use the embedded electron app or (relatively)
easily implement your own thing on top of the classes provided by `ts-gb`.

## Running the embedded electron app

```
$ git clone git@github.com:lyrkan/ts-gb.git
$ cd ts-gb
$ yarn
$ yarn start
```

## Doing it manually

```
$ yarn add ts-gb
```


```ts
import {
  AddressBus,
  CPU,
  Display,
  GameCartridge,
  Joypad
} from 'ts-gb';

// Initializing main components
const joypad = new Joypad();
const memory = new AddressBus(joypad);
const display = new Display(memory);
const cpu = new CPU(memory, display);

// Loading an optional bootrom
memory.loadBootRom(arrayBuffer);

// Loading a cartridge
const cartridge = new GameCartridge(arrayBuffer);
memory.loadCartridge(cartridge);

// If you decide to change ROMs after
// initializing everything don't forget
// to reset the CPU, the memory and the
// display components:
cpu.reset();
display.reset();
memory.reset();
```

Once that's done you'll have to handle the following things:

* When a button is pressed you'll have to call `joypad.down(button)`
  followed by `joypad.up(button)` when it is released
* The `cpu.tick()` method will need to be called at a 1Mhz frequency

You'll then be able to call `display.getFrontBuffer()` everytime
you want to refresh your screen (the closer from 59.7 FPS the
better).

If you want to see how that can be done take a look at the
[TS-GB Web](https://github.com/Lyrkan/ts-gb-web) implementation.
