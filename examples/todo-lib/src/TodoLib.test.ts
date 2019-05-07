import createTodoLib, { makeTodo } from './TodoLib';

let todolib = null;

beforeEach(() => {
  todolib = createTodoLib({
    todos: [makeTodo('first'), makeTodo('second')],
  });
});

test('Adds todo', () => {
  expect(todolib.state.todos).toHaveLength(2);
  todolib.addTodo('Third one');
  expect(todolib.state.todos).toHaveLength(3);
});

test('Toggles todo', () => {
  const { todos } = todolib.state;
  expect(todolib.state.completedTodos).toHaveLength(0);
  expect(todolib.state.activeTodos).toHaveLength(2);
  todolib.toggle(todos[0].id);
  expect(todolib.state.todos[0].completed).toBe(true);
  expect(todolib.state.completedTodos).toHaveLength(1);
  expect(todolib.state.activeTodos).toHaveLength(1);
});
