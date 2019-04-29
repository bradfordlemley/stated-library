import createObs from '../src/observable';

export const createLib = initial => ({
  state: initial,
  state$: createObs(initial),
  stateEvent$: createObs({
    event: 'INIT',
    rawState: initial,
    state: initial,
  }),
  setState(state, event) {
    this.state = state;
    this.stateEvent$.next({ rawState: state, state, event });
    this.state$.next(state);
  },
  resetState(state, event) {
    this.setState(state, event);
  },
});

export const createCounterLib = () => ({
  ...createLib({ counter: 0 }),
  increment: function() {
    this.setState({ counter: this.state.counter + 1 }, 'INCREMENT');
  },
  decrement: function() {
    this.setState({ counter: this.state.counter - 1 }, 'DECREMENT');
  },
});
