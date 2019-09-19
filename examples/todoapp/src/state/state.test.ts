import * as s from '.';

let stateMod: typeof s;
beforeEach(() => {
  jest.resetModules();
  stateMod = require('./');
});

afterEach(() => stateMod.locStorage.clear())

test('visibleTodos$ contains todos filtered thru visibilityFilter', () => {
  const { state$, actions } = stateMod;

  expect(state$.value.todos).toHaveLength(0);
  expect(state$.value.visibility).toEqual("all")
  actions.addTodo("First");
  actions.addTodo("Second");

  expect(state$.value.visibleTodos).toHaveLength(2);

  actions.setVisibility("completed");
  expect(state$.value.visibleTodos).toHaveLength(0);

  actions.toggleTodo(state$.value.todos[0].id);
  expect(state$.value.visibleTodos).toHaveLength(1);

  actions.setVisibility("active");
  expect(state$.value.visibleTodos).toHaveLength(1);

  actions.toggleTodo(state$.value.todos[1].id);
  expect(state$.value.visibleTodos).toHaveLength(0);

  actions.setVisibility("completed");
  expect(state$.value.visibleTodos).toHaveLength(2);

  actions.setVisibility("all");
  expect(state$.value.visibleTodos).toHaveLength(2);

});

test('visibleTodos$ contains todos filtered thru visibilityFilter', () => {
  const { state$, actions } = stateMod;

  expect(state$.value.todos).toHaveLength(0);
  actions.addTodo("First");
  expect(state$.value.todos).toHaveLength(1);
})