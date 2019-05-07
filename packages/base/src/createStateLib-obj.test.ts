import { createStatedLib } from '.';
import makeTests from '../test/makeTests';

const createCounter = (counter = 0) =>
  createStatedLib<{ counter: number }>(
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
    }
  );

makeTests(createCounter);

// test(`bindMethods skips non-function properties`, () => {
//   function Thing() {}
//   Thing.prototype.name = 'defaultThing';
//   const thing = new Thing();
//   StatedLibBase.bindMethods(thing);
// });
