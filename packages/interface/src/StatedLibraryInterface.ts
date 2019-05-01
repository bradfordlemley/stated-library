export type ValueHandler<T> = (value: T) => void;

export interface MinObserver<T> {
  next: ValueHandler<T>;
}

export interface Subscription {
  unsubscribe(): void;
}

export interface MinObservable<T> {
  subscribe: (observer: ValueHandler<T> | MinObserver<T>) => Subscription;
}

export interface MinObservableWithValue<T> extends MinObservable<T> {
  value?: T;
}

export type Observable<T> = MinObservableWithValue<T> | MinObservable<T>;

export interface StatedLibraryObservable<T> extends MinObservable<T> {
  value: T;
}

export type StateEvent<RawState, State, Meta = {}> = {
  state: State;
  rawState: RawState;
  event: string;
  meta?: Meta;
};

export interface StatedLibraryInterface<RawState, State = RawState, Meta = {}> {
  state: State;
  state$: StatedLibraryObservable<State>;
  stateEvent$: StatedLibraryObservable<StateEvent<RawState, State, Meta>>;
  resetState: (rawState: RawState, event: string, meta?: Meta) => void;
}

export default StatedLibraryInterface;
