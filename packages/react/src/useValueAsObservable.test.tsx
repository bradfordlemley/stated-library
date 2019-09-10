import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import useValueAs$ from './useValueAsObservable';
import { mapState } from '@stated-library/core';
import use from './use';

test('Props can be converted to props$', () => {
  let aProp = 'a';
  const Comp = (props: { a: string }) => {
    const props$ = useValueAs$(props);
    const mappedProps = use(() => mapState(props$, p => ({ b: p.a })));
    return <div data-testid="b-value">{mappedProps.b}</div>;
  };
  const { getByTestId, rerender } = render(<Comp a={aProp} />);
  expect(getByTestId('b-value').textContent).toBe('a');
  aProp = 'b';
  rerender(<Comp a={aProp} />);
  expect(getByTestId('b-value').textContent).toBe('b');
});
