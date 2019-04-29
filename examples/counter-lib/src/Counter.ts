import LibBase from '@stated-library/base';

export default class Counter extends LibBase<{ counter: number }> {
  constructor(counter: number = 0) {
    super({ counter });
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
