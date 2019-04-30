import StatedLibBase from './StatedLibBase';

import makeTests from '../test/makeTests';

class Counter extends StatedLibBase<{ counter: number }> {
  notAFunction;
  constructor(counter: number = 0) {
    super({ counter });
    this.notAFunction = 1;
    StatedLibBase.bindMethods(this);
  }
  set(counter) {
    this.updateState({ counter }, 'SET');
  }
  increment() {
    this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
  }
  decrement() {
    this.updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
  }
}

makeTests((initial?) => new Counter(initial));

test(`bindMethods skips non-function properties`, () => {
  function Thing() {}
  Thing.prototype.name = 'defaultThing';
  const thing = new Thing();
  StatedLibBase.bindMethods(thing);
});
