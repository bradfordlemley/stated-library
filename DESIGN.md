## Naming
Options: Stated Libraries, Stated Objects, Observable State Objects, Reactive State Programming

## Combine Methods And State
### Pros
* Terse: fewer variables, state + functions in one place
* Some methods depend on state anyways
### Cons
* Wrapping const methods inside state causes some extra work to retrieve the method when state changes
```
import state$ from '../state';

function Comp() {
  const { doSomething } = useObservable(state$);
  const { doSomething } = useObservable(() =>
    mapState(state$, ({ doSomething }) => ({ doSomething }))
  );
  // ... blah
}
```

## Standardize interface for all Observable objects
### Discussion
This is the biggest change in v2.  In v1, library objects had state$ and stateEvent$ observable properties, emitting State and StateEvent respectively, but weren't observables themselves.  Composed state observables (e.g. mapState) emitted State.
### Pros
* Objects can be treated the same whether they are "source" objects or compose objects.
### Cons
* Operating on state requires pulling out the state property of the StateEvent
### Other Options
```
// use Observable<State> as common interface and extend like:
StatedLibrary inherits Observable<State> {
  stateEvent$: StateEvent
}
```

## Observer vs Pub/Sub
### Discussion
Pub/sub would be subscribe('state', cb) or subscribe('stateEvent', cb)
