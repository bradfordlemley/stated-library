import * as React from 'react';
import { render, fireEvent, cleanup, act } from 'react-testing-library';
import CounterLib from '@stated-library/counter-lib';
import { use } from './index';
import { mapState } from '@stated-library/core';

let counterLib: CounterLib;
let counterLib2: CounterLib;

beforeEach(() => {
  counterLib = new CounterLib();
  counterLib2 = new CounterLib();
});

afterEach(cleanup);

test('Single counter without mapState', () => {
  const CounterComp = () => {
    const counterState = use(() => counterLib.state$);
    return (
      <div>
        <button onClick={() => counterLib.decrement()}>-</button>
        <span data-testid="count-value">{counterState.counter}</span>
        <button onClick={() => counterLib.increment()}>+</button>
      </div>
    );
  };
  const { getByTestId, getByText } = render(<CounterComp />);
  expect(getByTestId('count-value').textContent).toBe('0');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('1');
});

test('Single counter with mapState', async () => {
  const counter$ = mapState(counterLib.state$, state => state.counter);
  const CounterCompMapped = () => {
    const counter = use(counter$);
    return (
      <div>
        <button onClick={() => counterLib.decrement()}>-</button>
        <span data-testid="count-value">{counter}</span>
        <button onClick={() => counterLib.increment()}>+</button>
      </div>
    );
  };
  const { getByTestId, getByText } = render(<CounterCompMapped />);
  expect(getByTestId('count-value').textContent).toBe('0');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('1');
});

test('Mutliple state$ can be combined', () => {
  const TwoCounters = ({ state$ }) => {
    const { counter1, counter2, total } = use(state$);

    return (
      <div>
        <button data-testid="dec1" onClick={() => counterLib.decrement()}>
          -
        </button>
        <span data-testid="count-value">{counter1}</span>
        <button data-testid="inc1" onClick={() => counterLib.increment()}>
          +
        </button>
        <button data-testid="dec2" onClick={() => counterLib2.decrement()}>
          -
        </button>
        <span data-testid="count2-value">{counter2}</span>
        <button data-testid="inc2" onClick={() => counterLib2.increment()}>
          +
        </button>
        <span data-testid="total-value">{total}</span>
      </div>
    );
  };

  const mappedState$ = mapState(
    [counterLib.state$, counterLib2.state$],
    ([counter1State, counter2State]) => ({
      counter1: counter1State.counter,
      counter2: counter2State.counter,
      total: counter1State.counter + counter2State.counter,
    })
  );

  const { getByTestId } = render(<TwoCounters state$={mappedState$} />);
  expect(getByTestId('count-value').textContent).toBe('0');
  expect(getByTestId('count2-value').textContent).toBe('0');
  expect(getByTestId('total-value').textContent).toBe('0');
  fireEvent.click(getByTestId('inc1'));
  expect(getByTestId('count-value').textContent).toBe('1');
  expect(getByTestId('count2-value').textContent).toBe('0');
  expect(getByTestId('total-value').textContent).toBe('1');
});

test('Local counter', () => {
  const LocalCounter = () => {
    const { counter, increment, decrement } = use(() => {
      const lib = new CounterLib(42);
      return mapState(lib.state$, state => ({
        decrement: lib.decrement.bind(lib),
        increment: lib.increment.bind(lib),
        counter: state.counter,
      }));
    });
    return (
      <div>
        <button onClick={() => decrement()}>-</button>
        <span data-testid="count-value">{counter}</span>
        <button onClick={() => increment()}>+</button>
      </div>
    );
  };
  const { getByTestId, getByText } = render(<LocalCounter />);
  expect(getByTestId('count-value').textContent).toBe('42');
  fireEvent.click(getByText('+'));
  expect(getByTestId('count-value').textContent).toBe('43');
});

test('Throws if no observable given', () => {
  const CounterComp = () => {
    const counterState = use(() => undefined);
    return <div />;
  };
  expect(() => render(<CounterComp />)).toThrow(/Invalid/);
});

test('Mutliple state$ can be combined', () => {
  const TwoCounters = ({ state$ }) => {
    const { counter1, counter2, total } = use(state$);

    return (
      <div>
        <button data-testid="dec1" onClick={() => counterLib.decrement()}>
          -
        </button>
        <span data-testid="count-value">{counter1}</span>
        <button data-testid="inc1" onClick={() => counterLib.increment()}>
          +
        </button>

        <button data-testid="dec2" onClick={() => counterLib2.decrement()}>
          -
        </button>
        <span data-testid="count2-value">{counter2}</span>
        <button data-testid="inc2" onClick={() => counterLib2.increment()}>
          +
        </button>

        <span data-testid="total-value">{total}</span>
      </div>
    );
  };

  const MockedComp = jest.fn(TwoCounters);

  const total$ = mapState(
    [counterLib.state$, counterLib2.state$],
    ([counter1State, counter2State]) =>
      counter1State.counter + counter2State.counter
  );

  const mappedState$ = mapState(
    [counterLib.state$, counterLib2.state$, total$],
    ([counter1State, counter2State, total]) => ({
      counter1: counter1State.counter,
      counter2: counter2State.counter,
      total,
    })
  );

  const { getByTestId } = render(<MockedComp state$={mappedState$} />);
  expect(MockedComp).toHaveBeenCalledTimes(1);
  expect(getByTestId('count-value').textContent).toBe('0');
  expect(getByTestId('count2-value').textContent).toBe('0');
  expect(getByTestId('total-value').textContent).toBe('0');
  act(() => counterLib.increment());
  expect(MockedComp).toHaveBeenCalledTimes(2);
  expect(getByTestId('count-value').textContent).toBe('1');
  expect(getByTestId('count2-value').textContent).toBe('0');
  expect(getByTestId('total-value').textContent).toBe('1');
});
