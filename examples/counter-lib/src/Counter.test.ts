import Counter from './';

test('Initializes with default', () => {
  const counterLib = new Counter();
  expect(counterLib.state.counter).toEqual(0);
});

test('Initializes with value', () => {
  const counterLib = new Counter(34);
  expect(counterLib.state.counter).toEqual(34);
});

test('Increments', () => {
  const counterLib = new Counter();
  counterLib.increment();
  expect(counterLib.state.counter).toEqual(1);
});

test('Decrements', () => {
  const counterLib = new Counter();
  counterLib.decrement();
  expect(counterLib.state.counter).toEqual(-1);
});
