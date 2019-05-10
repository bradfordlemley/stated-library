
import {getValue} from '@stated-library/core';

import * as s from './state';

let state: typeof s;
beforeEach(() => {
  jest.resetModules();
  state = require('./state');
});

afterEach(() => state.locStorage.clear())

test('visibleTodos$ contains todos filtered thru visibilityFilter', () => {
  const { todoLib, filterLib, visibleTodos$, visibility$ } = state;

  expect(todoLib.state.todos).toHaveLength(0);
  expect(filterLib.state.visibility).toEqual("all")
  todoLib.addTodo("First");
  todoLib.addTodo("Second");

  expect(getValue(visibility$)).toEqual("all");
  expect(getValue(visibleTodos$)).toHaveLength(2);

  filterLib.setVisibility("completed");
  expect(getValue(visibleTodos$)).toHaveLength(0);

  todoLib.toggle(todoLib.state.todos[0].id);
  expect(getValue(visibleTodos$)).toHaveLength(1);

  filterLib.setVisibility("active");
  expect(getValue(visibleTodos$)).toHaveLength(1);

  todoLib.toggle(todoLib.state.todos[1].id);
  expect(getValue(visibleTodos$)).toHaveLength(0);

  filterLib.setVisibility("completed");
  expect(getValue(visibleTodos$)).toHaveLength(2);

  filterLib.setVisibility("all");
  expect(getValue(visibleTodos$)).toHaveLength(2);

});

test('visibleTodos$ contains todos filtered thru visibilityFilter', () => {
  const { todoLib, filterLib, visibleTodos$, visibility$ } = state;

  expect(todoLib.state.todos).toHaveLength(0);
  todoLib.addTodo("First");
  expect(todoLib.state.todos).toHaveLength(1);
})