import createNavLib from './NavLib';

let navlib: ReturnType<typeof createNavLib>;

beforeEach(() => {
  navlib = createNavLib('login');
});

test('Sets page', () => {
  navlib.setPage('admin');
  const state1 = navlib.state;
  expect(state1.page).toEqual('admin');

  navlib.setPage('login');
  const state2 = navlib.state;
  expect(state2.page).toEqual('login');
});

test('State doesnt change when setting same page', () => {
  navlib.setPage('login');
  const state1 = navlib.state;

  navlib.setPage('login');
  const state2 = navlib.state;

  expect(state1).toBe(state2);
});
