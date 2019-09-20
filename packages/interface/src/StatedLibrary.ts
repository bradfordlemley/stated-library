import { Observable } from './Observable';

export type StateEvent<RawState, State, Meta = {}> = {
  state: State;
  rawState: RawState;
  event: string;
  meta?: Meta;
};

export interface StatedLibrary<RawState, State = RawState, Meta = {}> {
  state: State;
  state$: Observable<State>;
  stateEvent$: Observable<StateEvent<RawState, State, Meta>>;
  resetState: (rawState: RawState, event: string, meta?: Meta) => void;
}

export default StatedLibrary;
