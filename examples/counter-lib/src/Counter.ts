import { createStatedLib } from '@stated-library/base';

export const createCounter = (counter = 0) =>
  createStatedLib({ counter }, ({ updateState }) => ({
    increment() {
      updateState(state => ({ counter: state.counter + 1 }), 'INCREMENT');
    },
    set(counter) {
      updateState({ counter }, 'SET');
    },
    decrement() {
      updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
    },
  }));

export default createCounter;
