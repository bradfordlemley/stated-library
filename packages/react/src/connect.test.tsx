import * as React from 'react';
import connect from './connect';
import CounterLib from '@stated-library/counter-lib';
import { render, fireEvent, cleanup } from 'react-testing-library';
import { mapState } from '@stated-library/core';

let counterLib = CounterLib();
let counterLib2 = CounterLib();

beforeEach(() => {
  counterLib = CounterLib();
  counterLib2 = CounterLib();
});

afterEach(cleanup);

type CounterProps = {
  counter: number;
  increment: () => void;
  decrement: () => void;
};

const Counter: React.ComponentType<CounterProps> = ({
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

class StatefulCounter extends React.Component<CounterProps> {
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

test('Extra ', () => {
  const Counter2: React.ComponentType<CounterProps & {counter2: number}> = props =>
    <div></div>

  const props$ = mapState(counterLib.state$,
    state => ({
      ...state,
      counter2: state.counter * 2,
    }))
  
  const CounterComp = connect(props$)(Counter2);
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
      <button data-testid="dec1" onClick={() => decrement1()}>
        -
      </button>
      <span data-testid="count-value">{counter1}</span>
      <button data-testid="inc1" onClick={() => increment1()}>
        +
      </button>
      <button data-testid="dec2" onClick={() => decrement2()}>
        -
      </button>
      <span data-testid="count2-value">{counter2}</span>
      <button data-testid="inc2" onClick={() => increment2()}>
        +
      </button>
      <span data-testid="total-value">{total}</span>
    </div>
  );

  const total$ = mapState(
    [counterLib.state$, counterLib2.state$],
    ([counter1State, counter2State]) =>
      counter1State.counter + counter2State.counter
  );

  const prop$ = mapState(
    [counterLib.state$, counterLib2.state$, total$],
    ([c1State, c2State, total]) => ({
      counter1: c1State.counter,
      counter2: c2State.counter,
      total,
      increment1: counterLib.increment,
      decrement1: counterLib.decrement,
      increment2: counterLib2.increment,
      decrement2: counterLib2.decrement,
    })
  );
  const MockCounter2 = jest.fn(Counter2);
  const TwoCounters = connect(prop$)(MockCounter2);
  const { getByTestId, getByText } = render(<TwoCounters />);
  expect(MockCounter2).toHaveBeenCalledTimes(1);
  expect(getByTestId('count-value').textContent).toBe('0');
  expect(getByTestId('count2-value').textContent).toBe('0');
  expect(getByTestId('total-value').textContent).toBe('0');
  fireEvent.click(getByTestId('inc1'));
  expect(getByTestId('count-value').textContent).toBe('1');
  expect(getByTestId('count2-value').textContent).toBe('0');
  expect(getByTestId('total-value').textContent).toBe('1');
});

/*
<PresComp>
  <Child1 />
  <Child2 />
</PresComp>
*/

test('State derived from props', () => {
  const PresComp:React.FunctionComponent<{injectProp: number, passthruProp: string}> = (props) => 
    <>
      <div data-testid="injectProp">{props.injectProp}</div>
      <div data-testid="passthruProp">{props.passthruProp}</div>
      {props.children}
    </>
  const Comp = connect(props$ => 
    mapState(props$,
      props => ({injectProp: props.hocProp * 2})
    ))
    (PresComp);
  const { getByTestId, getByText } = render(
    <Comp hocProp={2} passthruProp={"hi"}>
      <div data-testid="child1">Child</div>
    </Comp>
  );
  expect(getByTestId('injectProp').textContent).toBe('4');
  expect(getByTestId('passthruProp').textContent).toBe('hi');
  expect(getByTestId('child1').textContent).toBe('Child');
  // fireEvent.click(getByText('+'));
  // expect(getByTestId('count-value').textContent).toBe('1');
});
