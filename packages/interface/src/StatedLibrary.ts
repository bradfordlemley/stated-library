import { Observable } from './Observable';

export type StateEvent<RawState, State, Meta = {}> = {
  state: State;
  rawState: RawState;
  event: string;
  meta?: Meta;
};

export type StateObservable<RawState, State, Meta = {}> = 
  Observable<StateEvent<State, RawState, Meta>>;

export interface StatedLibrary<RawState, State = RawState, Meta = {}> extends Observable<StateEvent<RawState, State, Meta>> {
  state: State;
  resetState: (rawState: RawState, event: string, meta?: Meta) => void;
}

export interface StatedLibrary2<RawState, State = RawState, Meta = {}> extends Observable<State> {
  state: State;
  stateEvent$: Observable<StateEvent<RawState, State, Meta>>;
  resetState: (rawState: RawState, event: string, meta?: Meta) => void;
}

export default StatedLibrary;
