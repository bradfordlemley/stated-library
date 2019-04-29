import StatedLibBase from '@stated-library/base';

export default class SettingsLib<Settings extends object> extends StatedLibBase<
  Settings
> {
  constructor(defaultState: Settings) {
    super(Object.assign({}, defaultState));
  }

  update(updates: Partial<Settings>) {
    this.updateState(updates, `UPDATE`);
  }

  set<K extends keyof Settings>(key: K, value: Settings[K]) {
    // @ts-ignore
    this.updateState({ [key]: value }, `SET_${key}`);
  }
}
