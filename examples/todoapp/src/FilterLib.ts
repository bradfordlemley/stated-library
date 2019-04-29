import SettingsLib from "@stated-library/settings-lib";

export const VISIBILITIES = {
  all: 1,
  active: 2,
  completed: 3,
};

type VisFilter = {
  visibility: keyof typeof VISIBILITIES;
}

export default class FilterLib extends SettingsLib<VisFilter> {
  setVisibility(visibility: VisFilter["visibility"]) {
    this.update({visibility})
  }
}