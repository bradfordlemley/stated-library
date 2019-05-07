import LibBase from '@stated-library/base';
import { createStatedLib } from '@stated-library/base';

export default class Counter extends LibBase<{ counter: number }> {
  constructor(counter: number = 0) {
    super({ counter });
    LibBase.bindMethods(this);
  }
  increment() {
    this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
  }
  set(counter) {
    this.updateState({ counter }, 'SET');
  }
  decrement() {
    this.updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
  }
}

export const createCounter2 = (counter = 0) => createStatedLib<{ counter: number }>(
  { counter },
  ({updateState}) => ({
    increment() {
      updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
    },
    set(counter) {
      updateState({ counter }, 'SET');
    },
    decrement() {
      updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
    }
  })
)

export const createCounter = (counter = 0) => createStatedLib<{ counter: number }>(
  { counter },
  ({updateState}) => ({
    increment() {
      updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
    },
    set(counter) {
      updateState({ counter }, 'SET');
    },
    decrement() {
      updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
    }
  })
)
