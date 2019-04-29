import createMulti from './multiConnect';
import { createCounterLib } from '../test/createLib';

test('throws if already connected', () => {
  const onState = jest.fn();
  const multi = createMulti({ onState });
  const c1 = createCounterLib();
  multi.connect(c1, 'c1');
  expect(() => multi.connect(c1, 'c1')).toThrow();
  multi.disconnect();
});

test('connects with only onStateEvent', () => {
  const onStateEvent = jest.fn();
  const multi = createMulti({ onStateEvent });
  const c1 = createCounterLib();
  multi.connect(c1, 'c1');
  expect(onStateEvent).toHaveBeenCalledTimes(1);
  multi.disconnect();
});

test('disconnects individual lib', () => {
  const onState = jest.fn();
  const onDisconnectLib = jest.fn();
  const multi = createMulti({ onState, onDisconnectLib });
  const c1 = createCounterLib();
  const c2 = createCounterLib();
  const sub1 = multi.connect(c1, 'c1');
  multi.connect(c2, 'c2');
  expect(onState).toHaveBeenCalledTimes(2);
  c1.increment();
  c2.increment();
  expect(onState).toHaveBeenCalledTimes(4);
  expect(onDisconnectLib).toHaveBeenCalledTimes(0);
  sub1.disconnect();
  expect(onDisconnectLib).toHaveBeenCalledTimes(1);
  c1.increment();
  expect(onState).toHaveBeenCalledTimes(4);
  c2.increment();
  expect(onState).toHaveBeenCalledTimes(5);
  multi.disconnect();
});

test('Connects state$ and stateEvent$', () => {
  const onStateEvent = jest.fn();
  const onState = jest.fn();
  const multi = createMulti({ onStateEvent, onState });
  const c1 = createCounterLib();
  const c2 = createCounterLib();
  multi.connect(c1, 'c1');
  expect(onState).toHaveBeenCalledTimes(1);
  expect(onStateEvent).toHaveBeenCalledTimes(1);
  expect(onStateEvent).toHaveBeenCalledWith(
    {
      state: { counter: 0 },
      rawState: { counter: 0 },
      event: 'INIT',
    },
    'c1',
    c1
  );
  multi.connect(c2, 'c2');
  expect(onState).toHaveBeenCalledTimes(2);
  expect(onStateEvent).toHaveBeenCalledTimes(2);
  expect(onStateEvent).toHaveBeenCalledWith(
    {
      state: { counter: 0 },
      rawState: { counter: 0 },
      event: 'INIT',
    },
    'c2',
    c2
  );
  c1.increment();
  expect(onState).toHaveBeenCalledTimes(3);
  expect(onStateEvent).toHaveBeenCalledTimes(3);
  multi.disconnect();
});
