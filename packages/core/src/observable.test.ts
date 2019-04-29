import { from, ObservableInput } from 'rxjs';
import createObs from './observable';
import { getValue } from './index';

test('Can create rxjs observable', () => {
  const obs$ = createObs({ counter: 0 });
  const rxjsObs$ = from(obs$ as ObservableInput<{ counter: number }>);
  const value = getValue(rxjsObs$);
  expect(value).toEqual({ counter: 0 });
});

test('Calls onSubscribe and onUnsubscribe', () => {
  const onSubscribe = jest.fn();
  const onUnsubscribe = jest.fn();
  const subscriber = jest.fn();
  const subscriber2 = jest.fn();
  const obs$ = createObs({ counter: 0 }, { onSubscribe, onUnsubscribe });

  const sub = obs$.subscribe(subscriber);
  expect(onSubscribe).toBeCalledTimes(1);
  expect(onUnsubscribe).toBeCalledTimes(0);

  const sub2 = obs$.subscribe(subscriber2);
  expect(onSubscribe).toBeCalledTimes(1);
  expect(onUnsubscribe).toBeCalledTimes(0);

  sub.unsubscribe();
  expect(onSubscribe).toBeCalledTimes(1);
  expect(onUnsubscribe).toBeCalledTimes(0);

  sub2.unsubscribe();
  expect(onSubscribe).toBeCalledTimes(1);
  expect(onUnsubscribe).toBeCalledTimes(1);
});

test('Calls getValue', () => {
  const getValue = () => ({ counter: 10 });
  const obs$ = createObs({ counter: 0 }, { getValue });
  expect(obs$.value).toEqual({ counter: 10 });
});
