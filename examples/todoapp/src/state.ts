import TodoLib from "@stated-library/todo-lib";
import NavLib from "@stated-library/nav-lib";
import FilterLib from './FilterLib';
export {VISIBILITIES} from './FilterLib';

import { devTools, locStorage, mapState } from "@stated-library/core";

export type Page = "todos"|"acct";

export const navLib = new NavLib<Page>({page: "todos"});
export const filterLib = new FilterLib({visibility: "all"});
export const todoLib = new TodoLib();

devTools.connect(todoLib, "todolib");
devTools.connect(filterLib, "filterlib");
devTools.connect(navLib, "navlib");

locStorage.connect(todoLib, "todolib");

export const visibility$ = mapState(filterLib.state$, ({visibility}) => visibility);

export const visibleTodos$ = mapState(
  [todoLib.state$, visibility$],
  ([todoState, visibility]) => {
    switch(visibility) {
      case "completed":
        return todoState.completedTodos;
      case "active":
        return todoState.activeTodos;
      default:
        return todoState.todos;
    }
  } )

export const page$ = mapState(navLib.state$, ({page}) => page);
