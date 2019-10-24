import { devTools, locStorage, mapState } from "@stated-library/core";
import createTodoLib from "./TodoLib";
import createNavLib from "./NavLib";
import createFilterLib from './FilterLib';
export { VISIBILITIES } from './FilterLib';

const nav = createNavLib("todos");
const filter = createFilterLib();
const todos = createTodoLib();
const libs = {
  nav,
  filter,
  todos,
}

// @ts-ignore
Object.keys(libs).map(key => devTools.connect(libs[key], key));
// devTools.connect(todos, "todolib");
// devTools.connect(filterLib, "filterlib");
// devTools.connect(navLib, "navlib");
locStorage.connect(libs.todos, "todolib");

function getVisibleTodos(todoState: typeof libs.todos.state, visibility: typeof libs.filter.state.visibility) {
  switch(visibility) {
    case "completed":
      return todoState.completedTodos;
    case "active":
      return todoState.activeTodos;
    default:
      return todoState.todos;
  }
}

export const actions = {
  addTodo: todos.addTodo,
  toggleTodo: todos.toggle,
  destroyTodo: todos.destroy,
  updateTodo: todos.updateTodo,
  toggleAll: todos.toggleAll,
  clearCompleted: todos.clearCompleted,
  setPage: nav.setPage,
  setVisibility: filter.setVisibility,
};

export const state$ = mapState(
  {todos: todos.state$, filter: filter.state$, nav: nav.state$},
  ({todos, filter, nav}) => ({
    ...todos,
    ...filter,
    ...nav,
    ...actions,
    visibleTodos: getVisibleTodos(todos, filter.visibility),
  })
);

// export const state2$ = flatMapState(
//   libs,
//   ({todos, filter, nav}) => ({
//     visibleTodos: getVisibleTodos(todos, filter.visibility),
//   })
// );

export { locStorage };