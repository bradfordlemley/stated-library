import React from 'react';
import { Observable } from '@stated-library/interface';
import { createObservable } from '@stated-library/core';

export default function useValueAs$<T>(value: T): Observable<T> {
  const [obs$] = React.useState(() => createObservable(value));
  if (obs$.value !== value) {
    obs$.next(value);
  }
  return obs$;
}

export { useValueAs$ };
