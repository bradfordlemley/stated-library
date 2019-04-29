import LibBase from './LibBase';
import { createObservable } from '@stated-library/core';

export default class StatedLibBase<
  RawState,
  State = RawState,
  Meta = {}
> extends LibBase<RawState, State, Meta> {
  constructor(...args) {
    super(initialState => createObservable(initialState), ...args);
  }
}
