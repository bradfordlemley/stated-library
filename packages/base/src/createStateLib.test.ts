import { createStatedLib } from '.';
import makeTests from '../test/makeTests';

const createCounter = (counter = 0, deriveState) =>
  createStatedLib(
    { counter },
    ({ updateState }) => ({
      increment() {
        updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
      },
      decrement() {
        updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
      },
      set(counter) {
        updateState({ counter }, 'SET');
      },
      async aincrement() {
        await new Promise(resolve => setTimeout(resolve, 10));
        updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
      },
    }),
    { deriveState }
  );

makeTests(createCounter);

// test(`bindMethods skips non-function properties`, () => {
//   function Thing() {}
//   Thing.prototype.name = 'defaultThing';
//   const thing = new Thing();
//   StatedLibBase.bindMethods(thing);
// });
