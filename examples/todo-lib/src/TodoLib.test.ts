import createTodoLib from './TodoLib';

let todoLib = null;

beforeEach(() => {
  todoLib = createTodoLib();
});

test('Adds todo', () => {
  todoLib.addTodo('First');
  expect(todoLib.state.todos).toHaveLength(1);
  expect(todoLib.state.completedTodos).toHaveLength(0);
  expect(todoLib.state.activeTodos).toHaveLength(1);
});

test('Toggles todo', () => {
  todoLib.addTodo('First');
  todoLib.toggle(todoLib.state.todos[0].id);
  expect(todoLib.state.todos).toHaveLength(1);
  expect(todoLib.state.completedTodos).toHaveLength(1);
  expect(todoLib.state.activeTodos).toHaveLength(0);
  expect(todoLib.state.todos[0].completed).toBe(true);
});
