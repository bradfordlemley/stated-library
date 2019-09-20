import {
  shallowEqual,
  createObservable,
  ObservableWithNext,
} from '@stated-library/core';

import {
  StatedLibrary,
  Observable,
  StateEvent,
} from '@stated-library/interface';

export type LibOpts<RawState, State> = {
  deriveState?: (state: RawState) => State;
  createObs?: ObservableCtor<any>;
};

export type GetUpdates<State, RawState> = (state: State) => Partial<RawState>;

// // Minimal Observable
// interface Observable<Value> extends StatedLibraryObservable<Value> {
//   next: (value: Value) => void;
// }

type ObservableCtor<Value> = (initialValue: Value) => ObservableWithNext<Value>;

const identity = x => x;

function makeStateEvent(rawState, event, meta, opts) {
  const deriveState = (opts && opts.deriveState) || identity;
  const stateData = {
    rawState,
    event,
    state: deriveState(rawState),
    meta,
  };
  if (process.env.NODE_ENV !== 'production') {
    Object.freeze(stateData);
    Object.freeze(stateData.state);
    Object.freeze(stateData.rawState);
  }
  return stateData;
}

export function bindMethodsFromProto(obj) {
  const proto = Object.getPrototypeOf(obj);
  const descriptors = Object.getOwnPropertyDescriptors(proto);
  for (const key of Object.keys(descriptors)) {
    if (key === 'constructor') {
      continue;
    }
    if (typeof descriptors[key].value === 'function') {
      obj[key] = obj[key].bind(obj);
    }
  }
}

class StatedLibBase<RawState, State = RawState, Meta = {}>
  implements StatedLibrary<RawState, State, Meta> {
  opts: LibOpts<RawState, State>;
  stateEvent$: ObservableWithNext<StateEvent<RawState, State, Meta>>;
  state$: ObservableWithNext<State>;

  constructor(initialState: RawState, opts?: LibOpts<RawState, State>) {
    this.opts = Object.assign({}, opts);
    const createObs = this.opts.createObs || createObservable;
    const initialEvent = makeStateEvent(initialState, 'INIT', undefined, opts);
    this.stateEvent$ = createObs(initialEvent);
    this.state$ = createObs(initialEvent.state);
  }

  static bindMethods(obj) {
    bindMethodsFromProto(obj);
  }

  get state() {
    return this.stateEvent$.value.state;
  }

  setState(rawState: RawState, event: string, meta?: Meta) {
    const stateData = shallowEqual(rawState, this.stateEvent$.value.rawState)
      ? {
          ...this.stateEvent$.value,
          event,
          meta,
        }
      : makeStateEvent(rawState, event, meta, this.opts);
    if (!Object.is(stateData.state, this.state$.value)) {
      this.state$.next(stateData.state);
    }
    this.stateEvent$.next(stateData);
  }

  updateState(
    updatesOrGetUpdates: Partial<RawState> | GetUpdates<State, RawState>,
    event: string,
    meta?: Meta
  ) {
    const updates =
      typeof updatesOrGetUpdates === 'function'
        ? updatesOrGetUpdates(this.state)
        : updatesOrGetUpdates;
    const rawState = Object.assign(
      {},
      this.stateEvent$.value.rawState,
      updates
    );
    this.setState(rawState, event, meta);
  }

  resetState(rawState: RawState, event: string, meta?: Meta) {
    this.setState(rawState, event, meta);
  }
}

export default StatedLibBase;

export { StatedLibBase };
