import * as React from 'react';
import { link } from './index';
import CounterLib from '@stated-library/counter-lib';
import { render, fireEvent, cleanup } from 'react-testing-library';
import { mapState } from '@stated-library/core';

let counterLib: CounterLib;
let counterLib2: CounterLib;

beforeEach(() => {
  counterLib = new CounterLib();
  counterLib2 = new CounterLib();
});

afterEach(cleanup);

class CounterComp extends React.Component<{}, { counter: number }> {
  link;

  constructor(props) {
    super(props);
    // hook up state updates
    this.link = link(this, counterLib.state$);
  }

  componentDidMount() {
    // hook up state updates
    this.link.connect();
  }

  componentWillUnmount() {
    // unhook state updates
    this.link.disconnect();
  }

  render() {
    const { counter } = this.state;
    return (
      <div>
        <button onClick={() => counterLib.decrement()}>-</button>
        <span data-testid="count-value">{counter}</span>
        <button onClick={() => counterLib.increment()}>+</button>
      </div>
    );
  }
}

class CounterCompMapped extends React.Component<{}, { counterState: any }> {
  link;

  constructor(props) {
    super(props);
    // hook up state updates
    this.link = link(
      this,
      mapState(counterLib.state$, counterState => ({ counterState }))
    );
  }

  componentDidMount() {
    // hook up state updates
    this.link.connect();
  }

  componentWillUnmount() {
    // unhook state updates
    this.link.disconnect();
  }

  render() {
    const { counterState } = this.state;
    return (
      <div>
        <button onClick={() => counterLib.decrement()}>-</button>
        <span data-testid="count-value">{counterState.counter}</span>
        <button onClick={() => counterLib.increment()}>+</button>
      </div>
    );
  }
}

class TwoCounters extends React.Component<
  {},
  { counter1: number; counter2: number; total: number }
> {
  link;

  constructor(props) {
    super(props);
    // hook up state updates
    this.link = link(
      this,
      mapState(
        [counterLib.state$, counterLib2.state$],
        ([counter1State, counter2State]) => ({
          counter1: counter1State.counter,
          counter2: counter2State.counter,
          total: counter1State.counter + counter2State.counter,
        })
      )
    );
  }

  componentDidMount() {
    // hook up state updates
    this.link.connect();
  }

  componentWillUnmount() {
    // unhook state updates
    this.link.disconnect();
  }

  render() {
    const { counter1, counter2, total } = this.state;
    return (
      <div>
        <button onClick={() => counterLib.decrement()}>-</button>
        <span data-testid="count-value">{counter1}</span>
        <button onClick={() => counterLib.increment()}>+</button>
        <button onClick={() => counterLib2.decrement()}>-</button>
        <span data-testid="count2-value">{counter2}</span>
        <button onClick={() => counterLib2.increment()}>+</button>
        <span data-testid="total-value">{total}</span>
      </div>
    );
  }
}

test('Single counter without mapState', () => {
  const { getByTestId, getByText } = render(<CounterComp />);
  expect(getByTestId('count-value').textContent).toBe('0');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('1');
});

test('Single counter with mapState', () => {
  const { getByTestId, getByText } = render(<CounterCompMapped />);
  expect(getByTestId('count-value').textContent).toBe('0');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('1');
});

test('Two counters with mapState', () => {
  const { getByTestId, getByText } = render(<TwoCounters />);
  expect(getByTestId('count-value').textContent).toBe('0');
  expect(getByTestId('count2-value').textContent).toBe('0');
  expect(getByTestId('total-value').textContent).toBe('0');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('1');
  expect(getByTestId('count2-value').textContent).toBe('0');
  expect(getByTestId('total-value').textContent).toBe('1');
});
