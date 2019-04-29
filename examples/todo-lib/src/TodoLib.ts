import StatedLibBase from '@stated-library/base';
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

const deriveState = (state: RawState): State => {
  return {
    ...state,
    get activeTodos() {
      return getActiveTodos(state);
    },
    get completedTodos() {
      return getCompletedTodos(state);
    },
  };
};

const DEFAULT_STATE: RawState = {
  todos: [],
};

export default class TodoLib extends StatedLibBase<RawState, State> {
  constructor(state?: Partial<RawState>) {
    super(
      {
        ...DEFAULT_STATE,
        ...state,
      },
      { deriveState, name: 'TodoLib' }
    );
  }

  addTodo(text: string) {
    this.updateState(
      {
        todos: this.state.todos.concat(makeTodo(text)),
      },
      'ADDTODO'
    );
  }

  toggle(id: string) {
    this.updateState(
      {
        todos: this.state.todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
      },
      'TOGGLE_TODO'
    );
  }

  toggleAll(completed: boolean) {
    this.updateState(
      {
        todos: this.state.todos.map(todo =>
          todo.completed === completed ? todo : { ...todo, completed }
        ),
      },
      'TOGGLE_ALL'
    );
  }

  updateTodo(id: string, updates: Partial<Todo>) {
    this.updateState(
      {
        todos: this.state.todos.map(todo =>
          todo.id === id ? { ...todo, ...updates } : todo
        ),
      },
      'UPDATE_TODO'
    );
  }

  destroy(id: string) {
    this.updateState(
      {
        todos: this.state.todos.filter(todo => todo.id !== id),
      },
      'DESTROY_TODO'
    );
  }

  clearCompleted() {
    this.updateState(
      {
        todos: this.state.todos.filter(todo => !todo.completed),
      },
      'CLEAR_COMPLETED'
    );
  }
}
