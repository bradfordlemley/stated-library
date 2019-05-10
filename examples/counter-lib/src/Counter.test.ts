import { createCounter } from './';

test('Initializes with default', () => {
  const counterLib = createCounter();
  expect(counterLib.state.counter).toEqual(0);
});

test('Initializes with value', () => {
  const counterLib = createCounter(34);
  expect(counterLib.state.counter).toEqual(34);
});

test('Increments', () => {
  const counterLib = createCounter();
  counterLib.increment();
  expect(counterLib.state.counter).toEqual(1);
});

test('Decrements', () => {
  const counterLib = createCounter();
  counterLib.decrement();
  expect(counterLib.state.counter).toEqual(-1);
});

test('Increment is bound', () => {
  const counterLib = createCounter();
  const {increment} = counterLib;
  increment();
  expect(counterLib.state.counter).toEqual(1);
});
