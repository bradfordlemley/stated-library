import React from 'react';
import { connect } from '../dist';
import { mapState } from '@stated-library/core';
import { Observable } from '@stated-library/interface';
import CounterLib from '@stated-library/counter-lib';

test('Fails when Hoc invoked without all required passThru props', () => {
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
 
test('Fails when Hoc injects prop with incorrect type', () => {
  const Wrapped: React.ComponentType<{counter: string}> = props =>
    <div>
      {props.counter}
    </div>
  // $ExpectError
  const T = connect(CounterLib().state$)(Wrapped) // string not assignable to number
});

test('Fails when Hoc given extra props', () => {
  const Wrapped: React.ComponentType<{counter: number}> = props =>
    <div>
      {props.counter}
    </div>
  const Hoc = connect(CounterLib().state$)(Wrapped)
  const App = (props: any) =>
    <div>
      // $ExpectError
      <Hoc extraProp={3}/>  // extraProp is not a prop
    </div>
});

test('Fails when unknown Hoc props type causes missing props', () => {
  const Wrapped: React.ComponentType<{fromProps: number}> = props =>
    <div>
      {props.fromProps}
    </div>
  const Hoc = connect(props$ => mapState(
    props$,
    props => ({
      ...props
    })))(Wrapped)

    const App = (props: any) =>
    <div>
      // $ExpectError
      <Hoc />  // fromProps is missing in {} but required by Hoc/Wrapped
    </div>
});

test('Fails when unknow Hoc props type is used', () => {
  const Wrapped: React.ComponentType<{fromProps: number}> = props =>
    <div>
      {props.fromProps}
    </div>
  const Hoc = connect(props$ => mapState(
    props$,
    props => ({
      // $ExpectError
      fromProps: props.aProperty, // aProperty does not exist on type {}
    })))(Wrapped)
});

test('Fails when props type is unknown', () => {
  const Wrapped: React.ComponentType<{fromProps: number}> = props =>
    <div>
      {props.fromProps}
    </div>
  const Hoc = connect((props$: Observable<{a: string}>) => mapState(
    props$,
    props => ({
      // $ExpectError
      fromProps: props.b, // b does not exist on type {a: string}
    })))(Wrapped)
});