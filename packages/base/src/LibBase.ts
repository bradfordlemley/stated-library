import { shallowEqual } from '@stated-library/core';

import {
  StatedLibrary,
  StatedLibraryObservable,
  StateEvent,
} from '@stated-library/interface';

type DeriveState<RawState, State> = (state: RawState) => State;

type LibOpts<RawState, State> = {
  deriveState?: DeriveState<RawState, State>;
};

// Minimal Observable
interface Observable<Value> extends StatedLibraryObservable<Value> {
  next: (value: Value) => void;
}

type ObservableCtor<Value> = (initialValue: Value) => Observable<Value>;

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

function bindMethodsFromProto(obj) {
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

class LibBase<RawState, State = RawState, Meta = {}>
  implements StatedLibrary<RawState, State, Meta> {
  opts: LibOpts<RawState, State>;
  stateEvent$: StatedLibraryObservable<StateEvent<RawState, State, Meta>>;
  state$: StatedLibraryObservable<State>;

  constructor(
    createObs: ObservableCtor<any>,
    initialState?: RawState,
    opts?: LibOpts<RawState, State>
  ) {
    this.opts = opts || {};
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
      (this.state$ as Observable<State>).next(stateData.state);
    }
    (this.stateEvent$ as Observable<StateEvent<RawState, State, Meta>>).next(
      stateData
    );
  }

  updateState(updates: Partial<RawState>, event: string, meta?: Meta) {
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

// const createLibBase = <RawState, State=RawState, Meta={}> (
//   createObs: CreateObservable<RawState, State, Meta>,
//   initialState?: RawState,
//   opts?: LibOpts<RawState, State>
// ) => ({
//   stateEvent$: createObs(makeStateEvent(initialState, "INIT", {}, opts)),
//   setState: function(rawState: RawState, event: string, meta?: Meta) {
//     const stateData = makeStateEvent(rawState, event, meta, opts);
//     this.state = stateData.state;
//     this.stateEvent$.next(stateData);
//   },
//   updateState: function (updates: Partial<RawState>, event: string, meta?: Meta) {
//     const rawState = Object.assign({}, this.stateEvent$.value.rawState, updates);
//     this.setState(rawState, event, meta);
//   },
// })

export default LibBase;

export { LibBase };
