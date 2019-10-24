import createObs from '../src/observable';
import { mapState } from '../dist';

test('Maps mapped observables', () => {
  const c1$ = createObs({ counter: 0 });
  const c2$ = createObs({ counter: 0 });

  const mapped$ = mapState({
    c1: c1$,
    c2: c2$,
  });

  mapped$.subscribe(res => {
    // $ExpectType { c1: { counter: number; }; c2: { counter: number; }; }
    res;
    // $ExpectError
    console.log(res.c3);
  });
});
