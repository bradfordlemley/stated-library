import {connect} from '../dist';
import React from 'react';
import CounterLib from '@stated-library/counter-lib';

test('Hoc invoked without all non-injected props for wrapped', () => {
  const Wrapped: React.ComponentType<{counter: number, counter2: number}> = props =>
    <div>
    </div>
  const Hoc = connect(CounterLib().state$)(Wrapped)
  const App = (props: any) =>
    <div>
      // $ExpectError
      <Hoc />  // counter2 is missing
    </div>
});

test('Hoc provides prop with incorrect type', () => {
  const Wrapped: React.ComponentType<{counter: string}> = props =>
    <div>
    </div>
  // $ExpectError
  const T = connect(CounterLib().state$)(Wrapped)
});