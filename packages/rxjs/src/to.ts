import {
  StatedLibraryInterface,
  StateEvent,
  MinObservable,
} from '@stated-library/interface';
import { from, BehaviorSubject, Observable, ObservableInput } from 'rxjs';
import { multicast } from 'rxjs/operators';

function createMulticast(source, initialValue) {
  const subject = new BehaviorSubject(initialValue);
  const multicasted = source.pipe(multicast(subject));
  multicasted.connect();
  return multicasted;
}

export function to$<V>(
  psuedoObservable: MinObservable<V> | Observable<V>
): Observable<V> {
  return from(psuedoObservable as ObservableInput<V>);
}

export function toStateEvent$<RawState, State, Meta>(
  lib: StatedLibraryInterface<RawState, State, Meta>
): BehaviorSubject<StateEvent<RawState, State, Meta>> {
  return createMulticast(to$(lib.stateEvent$), lib.stateEvent$.value);
}

export function toState$<RawState, State, Meta>(
  lib: StatedLibraryInterface<RawState, State, Meta>
): BehaviorSubject<State> {
  return createMulticast(to$(lib.state$), lib.state$.value);
}
