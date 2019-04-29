import { toState$, toStateEvent$ } from './index';
import CounterLib from '@stated-library/counter-lib';

let counterLib: CounterLib;
let subs = [];

beforeEach(() => {
  subs = [];
  counterLib = new CounterLib();
});

afterEach(() => {
  subs.forEach(sub => sub.unsubscribe);
});

test(`toState$ observable emits state`, () => {
  const counterState$ = toState$(counterLib);
  const stateHandler = jest.fn();
  subs.push(counterState$.subscribe(stateHandler));
  expect(stateHandler).toHaveBeenCalledTimes(1);
  expect(stateHandler).toHaveBeenNthCalledWith(1, { counter: 0 });
  counterLib.increment();
  expect(stateHandler).toHaveBeenCalledTimes(2);
  expect(stateHandler).toHaveBeenNthCalledWith(2, { counter: 1 });
});

test(`toStateEvent$ observable supports multiple subscriptions`, () => {
  const counterState$ = toStateEvent$(counterLib);
  const stateHandler = jest.fn();
  const stateHandler2 = jest.fn();
  subs.push(counterState$.subscribe(stateHandler));
  subs.push(counterState$.subscribe(stateHandler2));

  expect(stateHandler).toHaveBeenCalledTimes(1);
  expect(stateHandler2).toHaveBeenCalledTimes(1);

  counterLib.increment();
  expect(stateHandler).toHaveBeenCalledTimes(2);
  expect(stateHandler).toHaveBeenCalledWith({
    event: 'INCREMENT',
    state: { counter: 1 },
    rawState: { counter: 1 },
  });
  expect(stateHandler2).toHaveBeenCalledTimes(2);
  expect(stateHandler2).toHaveBeenCalledWith({
    event: 'INCREMENT',
    state: { counter: 1 },
    rawState: { counter: 1 },
  });
});

test(`toStateEvent$ observable emits only the latest state event`, () => {
  const counterState$ = toStateEvent$(counterLib);
  const stateHandler = jest.fn();
  const stateHandler2 = jest.fn();

  counterLib.increment();
  counterLib.increment();
  subs.push(counterState$.subscribe(stateHandler2));
  expect(stateHandler2).toHaveBeenCalledTimes(1);
  expect(stateHandler2).toHaveBeenCalledWith({
    event: 'INCREMENT',
    state: { counter: 2 },
    rawState: { counter: 2 },
  });

  counterLib.increment();
  subs.push(counterState$.subscribe(stateHandler));
  expect(stateHandler).toHaveBeenCalledTimes(1);
  expect(stateHandler).toHaveBeenCalledWith({
    event: 'INCREMENT',
    state: { counter: 3 },
    rawState: { counter: 3 },
  });
  expect(stateHandler2).toHaveBeenCalledTimes(2);
  expect(stateHandler2).toHaveBeenCalledWith({
    event: 'INCREMENT',
    state: { counter: 3 },
    rawState: { counter: 3 },
  });

  counterLib.increment();
  expect(stateHandler).toHaveBeenCalledTimes(2);
  expect(stateHandler).toHaveBeenCalledWith({
    event: 'INCREMENT',
    state: { counter: 4 },
    rawState: { counter: 4 },
  });
});

test(`toState$ only emits state if it changes`, () => {
  const counterState$ = toState$(counterLib);
  const counterEvent$ = toStateEvent$(counterLib);
  const stateHandler = jest.fn();
  const eventHandler = jest.fn();

  subs.push(counterState$.subscribe(stateHandler));
  subs.push(counterEvent$.subscribe(eventHandler));

  expect(stateHandler).toHaveBeenCalledTimes(1);
  expect(stateHandler).toHaveBeenNthCalledWith(1, { counter: 0 });

  expect(eventHandler).toHaveBeenCalledTimes(1);
  expect(eventHandler).toHaveBeenNthCalledWith(1, {
    rawState: { counter: 0 },
    state: { counter: 0 },
    event: 'INIT',
  });

  counterLib.increment();

  expect(stateHandler).toHaveBeenCalledTimes(2);
  expect(stateHandler).toHaveBeenCalledWith({ counter: 1 });

  expect(eventHandler).toHaveBeenCalledTimes(2);
  expect(eventHandler).toHaveBeenCalledWith({
    rawState: { counter: 1 },
    state: { counter: 1 },
    event: 'INCREMENT',
  });

  counterLib.set(1);

  expect(stateHandler).toHaveBeenCalledTimes(2);
  expect(eventHandler).toHaveBeenCalledTimes(3);
  expect(eventHandler).toHaveBeenCalledWith({
    rawState: { counter: 1 },
    state: { counter: 1 },
    event: 'SET',
  });
});
