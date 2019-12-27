TS-GB
===

[![Build Status](https://travis-ci.org/Lyrkan/ts-gb.svg?branch=master)](https://travis-ci.org/Lyrkan/ts-gb)

TypeScript Game Boy emulator (WIP)

![Asterix ran on ts-gb](images/screenshots.png)

# How to use it

You can easily use all the classes provided by `ts-gb` to integrate
it into a website or an electron app.

## Wiring everything manually

```
$ yarn add ts-gb
```


```ts
import { System } from 'ts-gb/dist/system';

// Initializing a System instance that holds
// all the necessary components. You can also
// initialize each one of them manually if you
// want to.
const system = new System();

// Loading an optional bootrom
system.loadBootRom(arrayBuffer);

// Loading a game
system.loadGame(arrayBuffer);

// If you decide to change ROMs after
// initializing everything don't forget
// to reset all the components (CPU,
// memory, display, DMA handler)
system.reset();
```

Once that's done you'll have to handle the following things:

* When a button is pressed you'll have to call `system.joypad.down(button)`
  followed by `system.joypad.up(button)` when it is released
* The `system.tick()` method will have to be called at a
  frequency of 1MHz.

You'll then be able to use one of the [two provided graphic
renderers](src/display/renderers) or to directly read the
data returned by the `system.display.getFrontBuffer()` method
everytime you want to refresh your screen (the closer from
59.7 FPS the better).

The audio is a bit harder to implement since you have to
basically create all the noises yourself based on the state of
the various channels of the `Audio` component. Luckily ` ts-gb`
also provides a basic [`Tone.js` renderer](src/audio/renderers/tonejs-renderer.ts)
that is probably accurate enough for most games.

If you want to see how all of that can be done take a look at the
[TS-GB Web](https://github.com/Lyrkan/ts-gb-web) implementation.
