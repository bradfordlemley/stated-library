import * as React from 'react';
import connect from './connect';
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

type Props2 = {
  counter1: number;
  counter2: number;
  increment1: () => void;
  decrement1: () => void;
  increment2: () => void;
  decrement2: () => void;
  total: number;
};

const Counter2 = ({
  counter1,
  increment1,
  decrement1,
  counter2,
  increment2,
  decrement2,
  total,
}: Props2) => (
  <div>
    <button onClick={() => decrement1()}>-</button>
    <span data-testid="count-value">{counter1}</span>
    <button onClick={() => increment1()}>+</button>
    <button onClick={() => decrement2()}>-</button>
    <span data-testid="count2-value">{counter2}</span>
    <button onClick={() => increment2()}>+</button>
    <span data-testid="total-value">{total}</span>
  </div>
);

type Props = {
  counter: number;
  increment: () => void;
  decrement: () => void;
};

const Counter: React.ComponentType<Props> = ({
  counter,
  increment,
  decrement,
}) => (
  <div>
    <button onClick={() => decrement()}>-</button>
    <span data-testid="count-value">{counter}</span>
    <button onClick={() => increment()}>+</button>
  </div>
);

class StatefulCounter extends React.Component<Props> {
  // static displayName = "Stateful-Counter";
  render() {
    const { increment, decrement, counter } = this.props;
    return (
      <div>
        <button onClick={() => decrement()}>-</button>
        <span data-testid="count-value">{counter}</span>
        <button onClick={() => increment()}>+</button>
      </div>
    );
  }
}

test('Single counter without mapState', () => {
  const CounterComp = connect(counterLib.state$)(Counter);
  const { getByTestId, getByText } = render(
    <CounterComp
      increment={() => counterLib.increment()}
      decrement={() => counterLib.decrement()}
    />
  );
  expect(getByTestId('count-value').textContent).toBe('0');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('1');
});

test('Single counter map only counter', () => {
  const prop$ = mapState(counterLib.state$, ({ counter }) => ({
    counter,
  }));
  const CounterComp = connect(prop$)(Counter);
  const { getByTestId, getByText } = render(
    <CounterComp
      increment={() => counterLib.increment()}
      decrement={() => counterLib.decrement()}
    />
  );
  expect(getByTestId('count-value').textContent).toBe('0');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('1');
});

test('Single counter map all', () => {
  const prop$ = mapState(counterLib.state$, ({ counter }) => ({
    counter,
    increment: () => counterLib.increment(),
    decrement: () => counterLib.decrement(),
  }));
  const CounterComp = connect(prop$)(Counter);
  const { getByTestId, getByText } = render(<CounterComp />);
  expect(getByTestId('count-value').textContent).toBe('0');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('1');
});

test('Works with stateful component', () => {
  const prop$ = mapState(counterLib.state$, ({ counter }) => ({
    counter,
    increment: () => counterLib.increment(),
    decrement: () => counterLib.decrement(),
  }));

  const CounterComp = connect(prop$)(StatefulCounter);
  const { getByTestId, getByText } = render(<CounterComp />);
  expect(getByTestId('count-value').textContent).toBe('0');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('1');
});

test('Two counters with mapState', () => {
  const prop$ = mapState(
    [counterLib.state$, counterLib2.state$],
    ([c1State, c2State]) => ({
      counter1: c1State.counter,
      counter2: c2State.counter,
      total: c1State.counter + c2State.counter,
      increment1: counterLib.increment.bind(counterLib),
      decrement1: counterLib.decrement.bind(counterLib),
      increment2: counterLib2.increment.bind(counterLib2),
      decrement2: counterLib2.decrement.bind(counterLib2),
    })
  );

  const TwoCounters = connect(prop$)(Counter2);
  const { getByTestId, getByText } = render(<TwoCounters />);
  expect(getByTestId('count-value').textContent).toBe('0');
  expect(getByTestId('count2-value').textContent).toBe('0');
  expect(getByTestId('total-value').textContent).toBe('0');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('1');
  expect(getByTestId('count2-value').textContent).toBe('0');
  expect(getByTestId('total-value').textContent).toBe('1');
});
