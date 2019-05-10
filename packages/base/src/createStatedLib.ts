import { StatedLibraryInterface } from '@stated-library/interface';

import {
  StatedLibBase,
  bindMethodsFromProto,
  LibOpts,
  GetUpdates,
} from './StatedLib';

type GetMethods<Methods, State, RawState, Meta> = (base: {
  updateState: (
    update: Partial<RawState> | GetUpdates<State, RawState>,
    event: string,
    meta?: Meta
  ) => void;
  base: StatedLibraryInterface<RawState, State, Meta>;
}) => Methods;

export function createStatedLib<RawState, Meta, Methods, State = RawState>(
  initialState: RawState,
  methodsOrGetMethods: GetMethods<Methods, State, RawState, Meta> | Methods,
  opts?: LibOpts<RawState, State>
): StatedLibraryInterface<RawState, State, Meta> & Methods;

export function createStatedLib(initialState, methodsOrGetMethods, opts?) {
  const base = new StatedLibBase(initialState, opts);
  bindMethodsFromProto(base);

  const methods =
    typeof methodsOrGetMethods === 'function'
      ? methodsOrGetMethods(base)
      : methodsOrGetMethods;

  const obj = {
    get state() {
      return this.stateEvent$.value.state;
    },
  };
  Object.assign(obj, base);

  Object.keys(methods).forEach(method => {
    if (typeof methods[method] === 'function') {
      obj[method] = methods[method].bind(obj);
    }
  });

  // @ts-ignore
  return obj;
}
