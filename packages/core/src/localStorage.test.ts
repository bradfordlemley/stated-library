import CounterLib from '@stated-library/counter-lib';
import ls from './localStorage';

let locStore: typeof ls;
beforeEach(() => {
  jest.resetModules();
  locStore = require('./localStorage').default;
});
afterEach(() => {
  locStore.disconnect();
});

const js = o => JSON.stringify(o);
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

test('stores to local storage', async () => {
  const counterLib = new CounterLib();
  locStore.connect(counterLib, 'counter');
  counterLib.increment();
  await delay();
  expect(localStorage.getItem('counter')).toEqual(js({ counter: 1 }));
  counterLib.increment();
  await delay();
  expect(localStorage.getItem('counter')).toEqual(js({ counter: 2 }));
});

test('initializes from local storage', async () => {
  const counterLib = new CounterLib();
  localStorage.setItem('counter', JSON.stringify({ counter: 10 }));
  locStore.connect(counterLib, 'counter');
  expect(counterLib.state).toEqual({ counter: 10 });
});

test('initializes from corrupt local storage', async () => {
  const counterLib = new CounterLib();
  localStorage.setItem('counter', 'w{}');
  locStore.connect(counterLib, 'counter');
  expect(counterLib.state).toEqual({ counter: 0 });
});

test('clears individual local storage', async () => {
  const counterLib = new CounterLib();
  const sub = locStore.connect(counterLib, 'counter');
  counterLib.increment();
  expect(localStorage.getItem('counter')).not.toEqual(null);
  sub.clear();
  expect(localStorage.getItem('counter')).toEqual(null);
});

test('clears all local storage', async () => {
  const counterLib = new CounterLib();
  const counterLib2 = new CounterLib();
  locStore.connect(counterLib, 'counter');
  locStore.connect(counterLib2, 'counter2');

  counterLib.increment();
  counterLib2.increment();
  expect(localStorage.getItem('counter')).not.toEqual(null);
  expect(localStorage.getItem('counter2')).not.toEqual(null);
  locStore.clear();
  expect(localStorage.getItem('counter')).toEqual(null);
  expect(localStorage.getItem('counter2')).toEqual(null);
});
