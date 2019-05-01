function makeMapStateTests(mapState, createObs, isRxJs = false) {
  let subs = [];
  beforeEach(() => (subs = []));
  afterEach(() => subs.map(sub => sub.unsubscribe()));

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  test('Emits mapped state for one input', () => {
    const state$ = createObs({ counter: 0 });
    const mapped$ = mapState(state$, state => ({
      counter: state.counter + 100,
    }));
    const stateHandler = jest.fn();

    subs.push(mapped$.subscribe(stateHandler));
    expect(stateHandler).toHaveBeenCalledTimes(1);
    expect(stateHandler).toHaveBeenCalledWith({
      counter: 100,
    });

    state$.next({ counter: 1 });
    expect(stateHandler).toHaveBeenCalledTimes(2);
    expect(stateHandler).toHaveBeenCalledWith({
      counter: 101,
    });
  });

  test(`Doesn't emit unchanged state (shallowEqual) for one input`, () => {
    const state$ = createObs({ counter: 1 });
    const mapped$ = mapState(state$, state => ({
      counter: state.counter + 100,
    }));
    const stateHandler = jest.fn();
    subs.push(mapped$.subscribe(stateHandler));
    expect(stateHandler).toHaveBeenCalledTimes(1);
    expect(stateHandler).toHaveBeenCalledWith({
      counter: 101,
    });

    state$.next({ counter: 2 });
    expect(stateHandler).toHaveBeenCalledTimes(2);
    expect(stateHandler).toHaveBeenCalledWith({
      counter: 102,
    });

    state$.next({ counter: 2 });
    expect(stateHandler).toHaveBeenCalledTimes(2);

    state$.next({ counter: 3 });
    expect(stateHandler).toHaveBeenCalledTimes(3);
    expect(stateHandler).toHaveBeenCalledWith({
      counter: 103,
    });
  });

  test(`Emits mapped state for two inputs`, () => {
    const state1$ = createObs({ counter: 0 });
    const state2$ = createObs({ counter: 100 });
    const state3$ = createObs({ counter: 1000 });
    const mapped$ = mapState(
      [state1$, state2$, state3$],
      ([state1, state2, state3]) => ({
        counter: state1.counter + state2.counter,
      })
    );
    const stateHandler = jest.fn();

    subs.push(mapped$.subscribe(stateHandler));
    expect(stateHandler).toHaveBeenCalledTimes(1);
    expect(stateHandler).toHaveBeenCalledWith({
      counter: 100,
    });

    state1$.next({ counter: 4 });
    expect(stateHandler).toHaveBeenCalledTimes(2);
    expect(stateHandler).toHaveBeenCalledWith({
      counter: 104,
    });

    state1$.next({ counter: 40 });
    expect(stateHandler).toHaveBeenCalledTimes(3);
    expect(stateHandler).toHaveBeenCalledWith({
      counter: 140,
    });

    state2$.next({ counter: 200 });
    expect(stateHandler).toHaveBeenCalledTimes(4);
    expect(stateHandler).toHaveBeenCalledWith({
      counter: 240,
    });

    state2$.next({ counter: 200 });
    expect(stateHandler).toHaveBeenCalledTimes(4);

    state3$.next({ counter: 200 });
    expect(stateHandler).toHaveBeenCalledTimes(4);
  });

  test(`Doesn't emit unchanged (shallowEqual) state for two inputs`, () => {
    const state$ = createObs({ counter: 0 });
    const state2$ = createObs({ counter: 100 });
    const mapped$ = mapState([state$, state2$], ([state, state2]) => ({
      counter: state.counter + state2.counter,
    }));
    const stateHandler = jest.fn();
    subs.push(mapped$.subscribe(stateHandler));
    expect(stateHandler).toHaveBeenCalledTimes(1);
    state$.next({ counter: 1 });
    expect(stateHandler).toHaveBeenCalledTimes(2);

    state$.next({ counter: 1 });
    expect(stateHandler).toHaveBeenCalledTimes(2);

    state2$.next({ counter: 100 });
    expect(stateHandler).toHaveBeenCalledTimes(2);

    state2$.next({ counter: 101 });
    expect(stateHandler).toHaveBeenCalledTimes(3);
    expect(stateHandler).toHaveBeenNthCalledWith(3, {
      counter: 102,
    });
  });

  test(`Can add functions to mapped object`, () => {
    const state$ = createObs({ counter: 0 });
    const state2$ = createObs({ counter: 100 });
    const increment = () => state$.next({ counter: state$.value.counter + 1 });
    let lastState;
    const mapped$ = mapState([state$, state2$], ([state, state2]) => ({
      counter: state.counter + state2.counter,
      increment,
    }));
    const stateHandler = jest.fn(state => (lastState = state));
    subs.push(mapped$.subscribe(stateHandler));
    expect(stateHandler).toHaveBeenCalledTimes(1);
    expect(lastState).toMatchObject({
      counter: 100,
    });

    lastState.increment();
    expect(stateHandler).toHaveBeenCalledTimes(2);
    expect(lastState).toMatchObject({
      counter: 101,
    });
  });

  if (!isRxJs) {
    test(`Gets state without any subscribers`, () => {
      const state1$ = createObs({ counter: 1 });
      const state2$ = createObs({ counter: 100 });
      const mapped$ = mapState([state1$, state2$], ([state1, state2]) => ({
        counter: state1.counter + state2.counter,
      }));

      expect(mapped$.value).toEqual({ counter: 101 });
      state1$.next({ counter: 4 });
      expect(mapped$.value).toEqual({ counter: 104 });
    });

    test(`Gets state with subscribers`, () => {
      const state1$ = createObs({ counter: 1 });
      const state2$ = createObs({ counter: 100 });
      const mapped$ = mapState([state1$, state2$], ([state1, state2]) => ({
        counter: state1.counter + state2.counter,
      }));
      const subscriber = jest.fn();
      subs.push(mapped$.subscribe(subscriber));
      expect(mapped$.value).toEqual({ counter: 101 });
      state1$.next({ counter: 4 });
      expect(mapped$.value).toEqual({ counter: 104 });
    });

    test(`Combined streams with async creates only notification`, async () => {
      const state1$ = createObs({ counter: 0 });
      const plus10$ = mapState(state1$, state => state.counter + 10);
      const plus100$ = mapState(state1$, state => state.counter + 100);
      const mapped$ = mapState(
        [plus10$, plus100$],
        ([plus10, plus100]) => ({
          counter: plus10 + plus100,
        }),
        { async: true }
      );

      const subscriber = jest.fn();
      subs.push(mapped$.subscribe(subscriber));
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith({
        counter: 110,
      });

      state1$.next({ counter: 1 });
      await wait(0);
      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenNthCalledWith(2, {
        counter: 112,
      });
    });
  }

  test(`Combined streams create two notification`, () => {
    const state1$ = createObs({ counter: 0 });
    const plus10$ = mapState(state1$, state => state.counter + 10);
    const plus100$ = mapState(state1$, state => state.counter + 100);
    const mapped$ = mapState([plus10$, plus100$], ([plus10, plus100]) => ({
      counter: plus10 + plus100,
    }));

    const subscriber = jest.fn();
    subs.push(mapped$.subscribe(subscriber));
    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith({
      counter: 110,
    });

    state1$.next({ counter: 1 });
    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(subscriber).toHaveBeenNthCalledWith(3, {
      counter: 112,
    });
  });
}

module.exports = makeMapStateTests;

// export { makeMapStateTests };
