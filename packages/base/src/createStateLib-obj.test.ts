import { createStatedLib } from '.';
import makeTests from '../test/makeTests';

const createCounter = (counter = 0, deriveState) =>
  createStatedLib(
    { counter },
    {
      increment() {
        this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
      },
      set(counter) {
        this.updateState({ counter }, 'SET');
      },
      decrement() {
        this.updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
      },
      async aincrement() {
        await new Promise(resolve => setTimeout(resolve, 10));
        this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
      },
    },
    { deriveState }
  );

makeTests(createCounter);

test(`Handles non-function properties`, () => {
  createStatedLib(
    { counter: 1 },
    {
      name: 'name',
      increment() {
        this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
      },
    }
  );
});
