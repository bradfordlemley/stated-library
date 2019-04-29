import * as React from 'react';
import { Observable } from '@stated-library/interface';
import { getValue } from '@stated-library/core';

type Link = {
  connect: () => void;
  disconnect: () => void;
};

function link<State>(
  component: React.Component<any, State>,
  state$: Observable<State>
) {
  let comp = component;
  let subscription;
  comp.state = {
    ...(comp.state || {}),
    ...getValue(state$),
  };
  return {
    connect: () => {
      subscription = state$.subscribe(state => comp.setState({ ...state }));
    },
    disconnect: () => {
      subscription.unsubscribe();
      comp = null;
    },
  };
}

export default link;

export { link };
