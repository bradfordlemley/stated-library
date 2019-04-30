function makeTests(createCounter, isRxJs = false) {
  let subs;

  beforeEach(() => (subs = []));

  afterEach(() => subs.map(sub => sub.unsubscribe()));

  test('Initializes with default', () => {
    const counterLib = createCounter();
    expect(counterLib.state.counter).toEqual(0);
  });

  test('Initializes with value', () => {
    const counterLib = createCounter(34);
    expect(counterLib.state.counter).toEqual(34);
  });

  test('Increments', () => {
    const counterLib = createCounter();
    counterLib.increment();
    expect(counterLib.state.counter).toEqual(1);
  });

  test('Decrements', () => {
    const counterLib = createCounter();
    counterLib.decrement();
    expect(counterLib.state.counter).toEqual(-1);
  });

  test('Methods are bound', () => {
    const counterLib = createCounter();
    const counterLib2 = createCounter();
    const { decrement, increment } = counterLib;
    const { decrement: decrement2, increment: increment2 } = counterLib2;
    increment();
    expect(counterLib.state.counter).toEqual(1);
  });

  if (!isRxJs) {
    test('Attempting to modify state directly throws', () => {
      const counterLib = createCounter();
      // @ts-ignore
      expect(() => (counterLib.state = { counter: 23 })).toThrow();
      expect(counterLib.state.counter).toEqual(0);
    });

    test('Attempting to modify state property directly throws', () => {
      const counterLib = createCounter();
      expect(() => (counterLib.state.counter = 23)).toThrow();
      expect(counterLib.state.counter).toEqual(0);
    });
  }

  test('Notifies state$ and stateEvent$ observers', () => {
    const counterLib = createCounter();
    const eventHandler = jest.fn();
    const stateHandler = jest.fn();
    subs.push(counterLib.stateEvent$.subscribe(eventHandler));
    subs.push(counterLib.state$.subscribe(stateHandler));

    expect(eventHandler).toHaveBeenCalledTimes(1);
    expect(eventHandler).toHaveBeenNthCalledWith(1, {
      state: { counter: 0 },
      rawState: { counter: 0 },
      event: 'INIT',
    });

    expect(stateHandler).toHaveBeenCalledTimes(1);
    expect(stateHandler).toHaveBeenNthCalledWith(1, {
      counter: 0,
    });

    counterLib.increment();
    expect(counterLib.state.counter).toEqual(1);
    expect(eventHandler).toHaveBeenCalledTimes(2);
    expect(eventHandler).toHaveBeenNthCalledWith(2, {
      state: { counter: 1 },
      rawState: { counter: 1 },
      event: 'INCREMENT',
    });

    expect(stateHandler).toHaveBeenCalledTimes(2);
    expect(stateHandler).toHaveBeenNthCalledWith(2, {
      counter: 1,
    });
  });

  test(`Doesn't notify subscribers after they unsubscribe`, () => {
    const counterLib = createCounter();
    const eventHandler = jest.fn();
    const stateHandler = jest.fn();
    subs.push(counterLib.stateEvent$.subscribe(eventHandler));
    subs.push(counterLib.state$.subscribe(stateHandler));

    expect(eventHandler).toHaveBeenCalledTimes(1);
    expect(stateHandler).toHaveBeenCalledTimes(1);

    counterLib.increment();
    expect(eventHandler).toHaveBeenCalledTimes(2);
    expect(stateHandler).toHaveBeenCalledTimes(2);

    subs[0].unsubscribe();
    subs[1].unsubscribe();

    counterLib.increment();
    expect(counterLib.state.counter).toEqual(2);
    expect(eventHandler).toHaveBeenCalledTimes(2);
    expect(stateHandler).toHaveBeenCalledTimes(2);

    counterLib.increment();
    expect(counterLib.state.counter).toEqual(3);
    expect(eventHandler).toHaveBeenCalledTimes(2);
    expect(stateHandler).toHaveBeenCalledTimes(2);
  });

  test(`Setting same state fires stateEvent$ but not state$`, () => {
    const counterLib = createCounter();
    const stateHandler = jest.fn();
    const eventHandler = jest.fn();
    subs.push(counterLib.stateEvent$.subscribe(eventHandler));
    subs.push(counterLib.state$.subscribe(stateHandler));
    counterLib.increment();
    expect(stateHandler).toHaveBeenCalledTimes(2);
    expect(eventHandler).toHaveBeenCalledTimes(2);
    const firstState = counterLib.state;
    counterLib.set(1);
    expect(firstState).toBe(counterLib.state);
    expect(counterLib.stateEvent$.value.event).toBe('SET');
    expect(eventHandler).toHaveBeenCalledTimes(3);
    expect(eventHandler).toHaveBeenCalledWith({
      state: { counter: 1 },
      rawState: { counter: 1 },
      event: 'SET',
    });
    expect(stateHandler).toHaveBeenCalledTimes(2);
  });

  test(`Can reset state`, () => {
    const counterLib = createCounter();
    const eventHandler = jest.fn();
    const stateHandler = jest.fn();
    subs.push(counterLib.stateEvent$.subscribe(eventHandler));
    subs.push(counterLib.state$.subscribe(stateHandler));

    counterLib.increment();
    expect(eventHandler).toHaveBeenCalledTimes(2);
    expect(stateHandler).toHaveBeenCalledTimes(2);

    counterLib.resetState({ counter: 42 }, 'COUNTER-RESET');
    expect(eventHandler).toHaveBeenCalledTimes(3);
    expect(eventHandler).toHaveBeenCalledWith({
      state: { counter: 42 },
      rawState: { counter: 42 },
      event: 'COUNTER-RESET',
    });
    expect(stateHandler).toHaveBeenCalledTimes(3);
    expect(stateHandler).toHaveBeenCalledWith({
      counter: 42,
    });
  });

  test(`Works with NODE_ENV==='production'`, () => {
    const { env } = process;
    function setNodeEnv(e, nodeEnv) {
      e.NODE_ENV = nodeEnv;
    }
    setNodeEnv(env, 'production');
    const counterLib = createCounter();
    const eventHandler = jest.fn();
    const stateHandler = jest.fn();
    subs.push(counterLib.stateEvent$.subscribe(eventHandler));
    subs.push(counterLib.state$.subscribe(stateHandler));
  });
}

module.exports = makeTests;
