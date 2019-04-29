import TodoLib, { makeTodo } from './TodoLib';

let todolib = null;

beforeEach(() => {
  todolib = new TodoLib({
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
  todolib.toggle(todos[0].id);
  expect(todolib.state.todos[0].completed).toBe(true);
});
