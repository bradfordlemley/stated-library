import { createStatedLib } from '.';
import makeTests from '../test/makeTests';

const createCounter = (counter = 0, deriveState) =>
  createStatedLib(
    { counter },
    ({ updateState }) => ({
      increment() {
        updateState(state => ({ counter: state.counter + 1 }), 'INCREMENT');
      },
      set(counter) {
        updateState({ counter }, 'SET');
      },
      decrement() {
        updateState(state => ({ counter: state.counter - 1 }), 'DECREMENT');
      },
      async aincrement() {
        await new Promise(resolve => setTimeout(resolve, 10));
        updateState(state => ({ counter: state.counter + 1 }), 'INCREMENT');
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
