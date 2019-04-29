import { combineLatest, from, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { isArray, shallowEqual } from '@stated-library/core';
import { to$ } from './to';

import { MinObservable } from '@stated-library/interface';

type Obs<T> = MinObservable<T> | Observable<T>;

export declare type ValueOf<O> = O extends MinObservable<infer T>
  ? T
  : O extends Observable<infer T>
  ? T
  : never;

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

function mapState(streamOrStreams$, mapFunc) {
  if (!isArray(streamOrStreams$)) {
    return to$(streamOrStreams$).pipe(
      map(mapFunc),
      distinctUntilChanged(shallowEqual)
    );
  }
  return combineLatest(...streamOrStreams$).pipe(
    map(mapFunc),
    distinctUntilChanged(shallowEqual)
  );
}

export { mapState };
