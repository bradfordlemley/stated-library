import { devTools, locStorage, mapState } from "@stated-library/core";
import createTodoLib from "./TodoLib";
import createNavLib from "./NavLib";
import createFilterLib from './FilterLib';
export { VISIBILITIES } from './FilterLib';

const navLib = createNavLib("todos");
const filterLib = createFilterLib();
const todoLib = createTodoLib();

devTools.connect(todoLib, "todolib");
devTools.connect(filterLib, "filterlib");
devTools.connect(navLib, "navlib");
locStorage.connect(todoLib, "todolib");

function getVisibleTodos(todoState: typeof todoLib.state, visibility: typeof filterLib.state.visibility) {
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
  addTodo: todoLib.addTodo,
  toggleTodo: todoLib.toggle,
  destroyTodo: todoLib.destroy,
  updateTodo: todoLib.updateTodo,
  toggleAll: todoLib.toggleAll,
  clearCompleted: todoLib.clearCompleted,
  setPage: navLib.setPage,
  setVisibility: filterLib.setVisibility,
};

export const state$ = mapState(
  [todoLib.state$, filterLib.state$, navLib.state$],
  ([todoState, filterState, navState]) => ({
    ...todoState,
    ...filterState,
    ...navState,
    visibleTodos: getVisibleTodos(todoState, filterState.visibility),
  })
);

export { locStorage };