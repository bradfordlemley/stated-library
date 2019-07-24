import { StatedLibBase } from '.';
// @ts-ignore
import makeTests from '../test/makeTests';

class Counter extends StatedLibBase<{ counter: number }> {
  notAFunction;
  constructor(counter: number = 0, deriveState?) {
    super({ counter }, { deriveState });
    this.notAFunction = 1;
    StatedLibBase.bindMethods(this);
  }
  set(counter) {
    this.updateState({ counter }, 'SET');
  }
  async aincrement() {
    await new Promise(resolve => setTimeout(resolve, 50));
    this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
  }
  increment() {
    this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
  }
  decrement() {
    this.updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
  }
}

makeTests(
  (initialValue, deriveState) => new Counter(initialValue, deriveState)
);
