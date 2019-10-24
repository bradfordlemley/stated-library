import shallowEquals from './shallowEqual';
import { isArray, getValueOrValues, isObservable } from './utils';
import createObservable from './observable';

import { Observable } from '@stated-library/interface';

type Obs<T> = Observable<T>;

type ValueOf<O> = O extends Observable<infer T> ? T : never;

type ObjKeyof<T> = T extends object ? keyof T : never;
type KeyofKeyof<T> = ObjKeyof<T> | { [K in keyof T]: ObjKeyof<T[K]> }[keyof T];
type Lookup<T, K> = T extends any ? (K extends keyof T ? T[K] : never) : never;

type Flatten<T extends object> = {
  [K in KeyofKeyof<T>]: { [P in keyof T]: Lookup<T[P], K> }[keyof T]
};

export function flatten<T extends object>(objMap: T): Flatten<T> {
  return Object.keys(objMap).reduce(
    (acc, k) => Object.assign(acc, objMap[k]),
    {}
  );
}

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

function mapState<
  O1 extends Obs<any>,
  O2 extends Obs<any>,
  O3 extends Obs<any>,
  R
>(
  streams$: [O1, O2, O3],
  mapFunc: (vals: [ValueOf<O1>, ValueOf<O2>, ValueOf<O3>]) => R
): Observable<R>;

function mapState<T>(libs: T): Obs<{ [P in keyof T]: ValueOf<T[P]> }>;

function mapState<T, R>(
  libs: T,
  mapper: (val: { [P in keyof T]: ValueOf<T[P]> }) => R
): Obs<R>;

function mapState(streamOrStreams, mapper?, opts?) {
  let valueOrValues;
  let value;
  let subscriptions;
  let isSubscribed = false;

  const iOpts = Object.assign({}, opts);

  function updateValue(updateSourceValues = false) {
    if (updateSourceValues) {
      valueOrValues = getValueOrValues(streamOrStreams);
    }
    const newValue = mapper ? mapper(valueOrValues) : valueOrValues;
    if (!shallowEquals(newValue, value)) {
      value = newValue;
    }
    return value;
  }

  const mapped$ = createObservable(updateValue(true), {
    onUnsubscribe: () => {
      if (isArray(subscriptions)) {
        subscriptions.map(sub => sub.unsubscribe());
      } else {
        Object.keys(subscriptions).map(sub => subscriptions[sub].unsubscribe());
      }
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
      } else if (isObservable(streamOrStreams)) {
        subscriptions = [
          streamOrStreams.subscribe(value => {
            valueOrValues = value;
            update();
          }),
        ];
      } else {
        subscriptions = Object.keys(streamOrStreams).reduce((subs, key) => {
          subs[key] = streamOrStreams[key].subscribe(value => {
            valueOrValues[key] = value;
            update();
          });
          return subs;
        }, {});
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
