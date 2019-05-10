import { createStatedLib } from '@stated-library/base';
import { createSelector } from 'reselect';
// @ts-ignore: cuid has no default export
import cuid from 'cuid';

export const makeTodo = (text: string, completed?: boolean) => ({
  id: cuid(),
  text,
  completed: Boolean(completed),
});

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type RawState = {
  todos: Todo[];
};

type State = RawState & {
  activeTodos: Todo[];
  completedTodos: Todo[];
};

const getActiveTodos = createSelector<RawState, Todo[], Todo[]>(
  state => state.todos,
  todos => todos.filter(todo => !todo.completed)
);

const getCompletedTodos = createSelector<RawState, Todo[], Todo[]>(
  state => state.todos,
  todos => todos.filter(todo => todo.completed)
);

function deriveState(state: RawState): State {
  return {
    ...state,
    get activeTodos() {
      return getActiveTodos(state);
    },
    get completedTodos() {
      return getCompletedTodos(state);
    },
  };
}

const DEFAULT_STATE: RawState = {
  todos: [],
};

const createTodoLib = () =>
  createStatedLib(
    DEFAULT_STATE,
    ({ updateState }) => ({
      addTodo(text: string) {
        updateState(
          state => ({
            todos: state.todos.concat(makeTodo(text)),
          }),
          'ADDTODO'
        );
      },

      toggle(id: string) {
        updateState(
          state => ({
            todos: state.todos.map(todo =>
              todo.id === id ? { ...todo, completed: !todo.completed } : todo
            ),
          }),
          'TOGGLE_TODO'
        );
      },

      toggleAll(completed: boolean) {
        updateState(
          state => ({
            todos: state.todos.map(todo =>
              todo.completed === completed ? todo : { ...todo, completed }
            ),
          }),
          'TOGGLE_ALL'
        );
      },

      updateTodo(id: string, updates: Partial<Todo>) {
        updateState(
          state => ({
            todos: state.todos.map(todo =>
              todo.id === id ? { ...todo, ...updates } : todo
            ),
          }),
          'UPDATE_TODO'
        );
      },

      destroy(id: string) {
        updateState(
          state => ({
            todos: state.todos.filter(todo => todo.id !== id),
          }),
          'DESTROY_TODO'
        );
      },

      clearCompleted() {
        updateState(
          state => ({
            todos: state.todos.filter(todo => !todo.completed),
          }),
          'CLEAR_COMPLETED'
        );
      },
    }),

    { deriveState }
  );

export default createTodoLib;
