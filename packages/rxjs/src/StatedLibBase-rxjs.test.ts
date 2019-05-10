import StatedLibRxJs from './StatedLibBase-rxjs';

import makeTests from '../../base/test/makeTests';

class Counter extends StatedLibRxJs<{ counter: number }> {
  notAFunction;
  constructor(counter: number = 0, deriveState?) {
    super({ counter }, { deriveState });
    this.notAFunction = 1;
    StatedLibRxJs.bindMethods(this);
  }
  set(counter) {
    this.updateState({ counter }, 'SET');
  }
  increment() {
    this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
  }
  async aincrement() {
    await new Promise(resolve => setTimeout(resolve, 50));
    this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
  }
  decrement() {
    this.updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
  }
}

makeTests((initial, deriveState) => new Counter(initial, deriveState), true);
