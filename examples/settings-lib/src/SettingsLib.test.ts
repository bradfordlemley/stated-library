import SettingsLib from './SettingsLib';

let settingsLib: SettingsLib<Settings>;

type Settings = {
  filter: 'all' | 'completed';
  count: number;
};

beforeEach(() => {
  settingsLib = new SettingsLib<Settings>({ filter: 'all', count: 0 });
});

test('Sets filter', () => {
  expect(settingsLib.state.filter).toEqual('all');
  settingsLib.update({ filter: 'completed' });
  expect(settingsLib.state.filter).toEqual('completed');
});

test('Sets filter', () => {
  expect(settingsLib.state.filter).toEqual('all');
  settingsLib.set('filter', 'completed');
  expect(settingsLib.state.filter).toEqual('completed');
  settingsLib.set('count', 5);
  expect(settingsLib.state.count).toEqual(5);
});
