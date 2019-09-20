import { createStatedLib } from "@stated-library/base";

export const VISIBILITIES_ENUM = {
  all: 1,
  active: 2,
  completed: 3,
}

export type Visibility = keyof typeof VISIBILITIES_ENUM;

export const VISIBILITIES = Object.keys(VISIBILITIES_ENUM) as Array<Visibility>;

export default function createFilterLib(initial?: Visibility) {
  return createStatedLib(
    {
      visibility: (initial || VISIBILITIES[0]) as Visibility,
    },
    base => ({
      setVisibility(visibility: Visibility) {
        base.updateState({ visibility }, "SET_VISIBILITY");
      }
    })
  );
}
