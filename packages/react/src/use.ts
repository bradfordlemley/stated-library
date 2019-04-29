import * as React from 'react';
import { Observable } from '@stated-library/interface';
import { getValue } from '@stated-library/core';

export default function use<R>(
  value$OrFunc: Observable<R> | (() => Observable<R>)
): R {
  const value$Ref = React.useRef(undefined);
  if (value$Ref.current === undefined) {
    value$Ref.current =
      typeof value$OrFunc === 'function' ? value$OrFunc() : value$OrFunc;
    if (!value$Ref.current) {
      throw new Error(`Invalid value$: ${value$Ref.current}`);
    }
  }

  const value$ = value$Ref.current;
  /*
    Initial value will be set properly for observables that carry a value or 
    observables that emit the latest value immediately upon subscription.
  */
  const [value, setValue] = React.useState(() => getValue(value$));

  React.useEffect(() => {
    const subscription = value$.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [value$]);

  return value;
}

export { use };
