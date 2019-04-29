import getDisplayName from './getDisplayName';

test('Comp without name', () => {
  expect(getDisplayName({})).toEqual('Component');
});
