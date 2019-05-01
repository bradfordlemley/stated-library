import * as React from 'react';
import shallowEquals from './shallowEqual';
import { isArray, getValueOrValues } from './utils';
import createObservable from './observable';

import { Observable } from '@stated-library/interface';

function getMappedState(stateOrStates, mapState) {
  return mapState(stateOrStates);
}

type Obs<T> = Observable<T>;

type ValueOf<O> = O extends Observable<infer T> ? T : never;

function mapState<O1 extends Obs<any>, R>(
  stream$: O1,
  mapFunc: (val: ValueOf<O1>) => R
): Observable<R>;

function mapState<O1 extends Obs<any>, R>(
  streams$: [O1],
  mapFunc: (vals: [ValueOf<O1>]) => R
): Observable<R>;

function mapState<O1 extends Obs<any>, O2 extends Obs<any>, R>(
  streams$: [O1, O2],
  mapFunc: (vals: [ValueOf<O1>, ValueOf<O2>]) => R
): Observable<R>;

function mapState<
  O1 extends Obs<any>,
  O2 extends Obs<any>,
  O3 extends Obs<any>,
  R
>(
  streams$: [O1, O2, O3],
  mapFunc: (vals: [ValueOf<O1>, ValueOf<O2>, ValueOf<O3>]) => R
): Observable<R>;

function mapState<
  O1 extends Obs<any>,
  O2 extends Obs<any>,
  O3 extends Obs<any>,
  O4 extends Obs<any>,
  R
>(
  streams$: [O1, O2, O3, O4],
  mapFunc: (vals: [ValueOf<O1>, ValueOf<O2>, ValueOf<O3>, ValueOf<O4>]) => R
): Observable<R>;

function mapState<
  O1 extends Obs<any>,
  O2 extends Obs<any>,
  O3 extends Obs<any>,
  O4 extends Obs<any>,
  O5 extends Obs<any>,
  R
>(
  streams$: [O1, O2, O3, O4, O5],
  mapFunc: (
    vals: [ValueOf<O1>, ValueOf<O2>, ValueOf<O3>, ValueOf<O4>, ValueOf<O5>]
  ) => R
): Observable<R>;

function mapState<
  O1 extends Obs<any>,
  O2 extends Obs<any>,
  O3 extends Obs<any>,
  O4 extends Obs<any>,
  O5 extends Obs<any>,
  O6 extends Obs<any>,
  R
>(
  streams$: [O1, O2, O3, O4, O5, O6],
  mapFunc: (
    vals: [
      ValueOf<O1>,
      ValueOf<O2>,
      ValueOf<O3>,
      ValueOf<O4>,
      ValueOf<O5>,
      ValueOf<O6>
    ]
  ) => R
): Observable<R>;

function mapState<
  O1 extends Obs<any>,
  O2 extends Obs<any>,
  O3 extends Obs<any>,
  O4 extends Obs<any>,
  O5 extends Obs<any>,
  O6 extends Obs<any>,
  O7 extends Obs<any>,
  R
>(
  streams$: [O1, O2, O3, O4, O5, O6, O7],
  mapFunc: (
    vals: [
      ValueOf<O1>,
      ValueOf<O2>,
      ValueOf<O3>,
      ValueOf<O4>,
      ValueOf<O5>,
      ValueOf<O6>,
      ValueOf<O7>
    ]
  ) => R
): Observable<R>;

function mapState<
  O1 extends Obs<any>,
  O2 extends Obs<any>,
  O3 extends Obs<any>,
  O4 extends Obs<any>,
  O5 extends Obs<any>,
  O6 extends Obs<any>,
  O7 extends Obs<any>,
  O8 extends Obs<any>,
  R
>(
  streams$: [O1, O2, O3, O4, O5, O6, O7, O8],
  mapFunc: (
    vals: [
      ValueOf<O1>,
      ValueOf<O2>,
      ValueOf<O3>,
      ValueOf<O4>,
      ValueOf<O5>,
      ValueOf<O6>,
      ValueOf<O7>,
      ValueOf<O8>
    ]
  ) => R
): Observable<R>;

function mapState<
  O1 extends Obs<any>,
  O2 extends Obs<any>,
  O3 extends Obs<any>,
  O4 extends Obs<any>,
  O5 extends Obs<any>,
  O6 extends Obs<any>,
  O7 extends Obs<any>,
  O8 extends Obs<any>,
  O9 extends Obs<any>,
  R
>(
  streams$: [O1, O2, O3, O4, O5, O6, O7, O8, O9],
  mapFunc: (
    vals: [
      ValueOf<O1>,
      ValueOf<O2>,
      ValueOf<O3>,
      ValueOf<O4>,
      ValueOf<O5>,
      ValueOf<O6>,
      ValueOf<O7>,
      ValueOf<O8>,
      ValueOf<O9>
    ]
  ) => R
): Observable<R>;

function mapState<
  O1 extends Obs<any>,
  O2 extends Obs<any>,
  O3 extends Obs<any>,
  O4 extends Obs<any>,
  O5 extends Obs<any>,
  O6 extends Obs<any>,
  O7 extends Obs<any>,
  O8 extends Obs<any>,
  O9 extends Obs<any>,
  O10 extends Obs<any>,
  R
>(
  streams$: [O1, O2, O3, O4, O5, O6, O7, O8, O9, O10],
  mapFunc: (
    vals: [
      ValueOf<O1>,
      ValueOf<O2>,
      ValueOf<O3>,
      ValueOf<O4>,
      ValueOf<O5>,
      ValueOf<O6>,
      ValueOf<O7>,
      ValueOf<O8>,
      ValueOf<O9>,
      ValueOf<O10>
    ]
  ) => R
): Observable<R>;

function mapState(streamOrStreams, mapState, opts?) {
  let valueOrValues;
  let value;
  let subscriptions;
  let isSubscribed = false;

  const iOpts = Object.assign({}, opts);

  function updateValue(updateSourceValues = false) {
    if (updateSourceValues) {
      valueOrValues = getValueOrValues(streamOrStreams);
    }
    const newValue = getMappedState(valueOrValues, mapState);
    if (!shallowEquals(newValue, value)) {
      value = newValue;
    }
    return value;
  }

  const mapped$ = createObservable(updateValue(true), {
    onUnsubscribe: () => {
      subscriptions.map(sub => sub.unsubscribe());
      isSubscribed = false;
    },
    onSubscribe: () => {
      updateValue(true);
      if (isArray(streamOrStreams)) {
        subscriptions = streamOrStreams.map((s, i) => {
          valueOrValues[i] = s.value;
          return s.subscribe(val => {
            valueOrValues[i] = val;
            update();
          });
        });
      } else {
        subscriptions = [
          streamOrStreams.subscribe(value => {
            valueOrValues = value;
            update();
          }),
        ];
      }
      isSubscribed = true;
    },
    getValue: () => (isSubscribed ? value : updateValue(true)),
  });

  function notify(newValue) {
    if (iOpts.async) {
      setTimeout(() => {
        if (newValue === value) {
          mapped$.next(value);
        }
      }, 0);
    } else {
      mapped$.next(value);
    }
  }

  function update() {
    const oldValue = value;
    const newValue = updateValue();
    if (newValue !== oldValue) {
      notify(newValue);
    }
  }

  return mapped$;
}

export default mapState;
export { mapState };
