import { StatedLibraryInterface } from '@stated-library/interface';

import { StatedLibBase, bindMethodsFromProto, LibOpts } from './StatedLib';

type GetMethods<Methods> = (base: any) => Methods;

export function createStatedLib<RawState, Meta, Methods, State = RawState>(
  initialState: RawState,
  methodsOrGetMethods: GetMethods<Methods>,
  // opts?: {deriveState: (raw: RawState) => State},
  opts?: LibOpts<RawState, State>
): StatedLibraryInterface<RawState, State, Meta> & Methods;

export function createStatedLib<RawState, State, Meta, Methods>(
  initialState: RawState,
  methodsOrGetMethods: Methods,
  opts?
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
  Object.assign(obj, base, methods);

  Object.keys(methods).forEach(method => (obj[method] = obj[method].bind(obj)));

  // @ts-ignore
  return obj;
}
