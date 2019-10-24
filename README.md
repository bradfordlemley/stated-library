# :dart: Stated Libraries
**The Alternative to "State Management", sensibly bridging the gap between function and state.**

 [![Build Status][build-badge]][build] [![Code Coverage][coverage-badge]][coverage] [![PRs welcome][prs-welcome-badge]][prs] [![License][license-badge]][license] ![Types][types-badge]

[build]: https://dev.azure.com/bradfordlemley/stated-library/_build/latest?definitionId=1&branchName=master

[build-badge]: https://img.shields.io/azure-devops/build/bradfordlemley/stated-library/1/master.svg

[coverage]: https://codecov.io/github/bradfordlemley/stated-library/branch/master

[coverage-badge]: https://img.shields.io/codecov/c/gh/bradfordlemley/stated-library/master.svg

[coverage-badge-az]: https://img.shields.io/azure-devops/coverage/bradfordlemley/stated-library/1/master.svg

[license-badge]: https://img.shields.io/github/license/bradfordlemley/stated-library.svg

[license]: https://github.com/bradfordlemley/stated-library/blob/master/LICENSE

[prs]: https://github.com/bradfordlemley/stated-library/pulls

[prs-welcome-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg

[types-badge]: https://img.shields.io/npm/types/typescript.svg

# Overview

Stated Libraries are based on **observable state** -- listeners subscribe to library state.  Library state is changed by calling a library method, resulting in **unidirectional data flow**.

Here's a quick demonstration of the concepts:
```js
todoLib.state$.subscribe(state => console.log(`State is ${JSON.stringify(state)}`));
// out: State is {todos: [], isFetching: false}  <-- current state is emitted upon subscribing
todoLib.addTodo('Drop Redux');
// out: State is {todos: [{title: 'Drop Redux', completed: false, id: 1}], isFetching: false}
todoLib.completeTodo(1);
// out: State is {todos: [{title: 'Drop Redux', completed: true, id: 1}], isFetching: false}
```

A Stated Library is a completely standalone module, developed and tested independently.  Stated Libraries can perform *async functionality* and *cause side effects*.  No boilerplate, no restrictions, no middleware.

## Using Stated Libraries
Stated Libraries are application-framework-agnostic.  Observable state is a generic mechanism and can be interfaced to any application framework update mechanism; for example, a React hook.

This example shows a React todo app using a todo stated library.  `useObservable` is a generic React binding that works for any observable state.
```jsx
const TodoApp = () => {
  const { todos } = useObservable(todoLib.state$);
  const [text, setText] = useState("");
  return <div>
    <input value={text} onChange={ e => setText(e.target.value) } />
    <button onClick={() => todoLib.addTodo(text)}>Add</button>
    <ul>
      {todos.map( ({id, title}) => <li key={id}>{title}</li> )}
    </ul>
  </div>
}
```

## Combining State
Obserservable state is **composable** and **reactive**.  Observable states can be combined together to produce a new observable state.

Stated Libraries supports a `mapState` function for composing observable state.

> In reactive programming, functions that takes observable(s) as input and create a new observable are called **reactive operators**.  `mapState` is a reactive operator.  Reactive programming frameworks like RxJS include many reactive operators. `mapState` is the only reactive operator included with Stated Libraries and probably the only operator you'll need.

This example extends the React todo app from above to filter visible todos.  Todo library and visiblity library observable states are composed together to create `visibleTodos$` observable state.
```jsx
const visibleTodos$ = mapState(
  [todoLib.state$, visibilityLib.state$],
  ([todoState, visibilityState]) => {
    switch (visibilityState) {
      case 'active':
        return todoState.todos.filter(todo => !todo.completed);
      case 'completed':
        return todoState.todos.filter(todo => todo.completed);
      default:
        return todoState.todos;
    }
  }
);

const TodoApp = () => {
  const { todos } = useObservable(visibleTodos$);
  const [text, setText] = useState("");
  return <div>
    <input value={text} onChange={ e => setText(e.target.value) } />
    <button onClick={() => todoLib.addTodo(text)}>Add</button>
    <ul>
      {todos.map( ({id, title}) => <li key={id}>{title}</li> )}
    </ul>
    <button onClick={() => visiblityLib.setFilter('all')}>Show all</button>
    <button onClick={() => visiblityLib.setFilter('active')}>Show active</button>
  </div>
}
```

Composable means that composed observable state can be used to compose observable state.  This example shows how `visibleTodos$` could be combined some search text observable:

```js
// ...
const matchingTodos$ = mapState(
  [visibleTodos$, searchText$],
  ([visibleTodos, searchText]) => visibleTodos.filter(todo => todo.title.includes(searchText))
);
```

State composition is application-framework-agnostic, meaning that all of the state composition logic can be implemented and tested without the application view and outside any application framework.

## Implementing a Stated Library
A Stated Library is an object that includes standard state-related properties (`state`, `state$`, `stateEvent$`, and `resetState()`) and extends these to include library-specific methods.  The full type definition of a Stated Library can be found at [@stated-library/interface](#@stated-library/interface).

While it's not too difficult to build a Stated Library from scratch, [@stated-library/base](#@stated-library/base) provides easy helpers.

This example demonstrates one way to create a Todo Stated Library:
```js
// TodoLib.js
import { createStatedLib } from '@stated-library/base';
import cuid from 'cuid';

export default () => createStatedLib(
  // initial state
  {
    todos: [],
    isFetching: false,
  },
  // methods
  base => ({
    addTodo(text) {
      base.updateState(
        {
          todos: base.state.todos.concat({ title, completed: false, id: cuid() }),
        },
        'ADD_TODO'
      );
    },
    completeTodo(id) {
      base.updateState(
        {
          todos: base.state.todos.map(todo => todo.id === id ? { ...todo, completed: true } : todo),
        },
        'COMPLETE_TODO'
      );
    },
    async fetchTodos() {
      base.updateState({ isFetching: true }, 'START_FETCH_TODOS');
      const fetchedTodos = await fetchTodos();
      base.updateState(
        {
          todos: this.state.todos.concat(fetchedTodos),
          isFetching: false,
        },
        'COMPLETE_FETCH_TODOS'
      );
    }
  }),
);
```
Each library method updates the library's state.  The `fetchTodos` method updates state twice: once synchronously before fetching todos, and once asynchronously after fetching is complete.

Each call to `updateState` cause the `state$` observable to emit a new state and the `stateEvent$` observable to emit a new state event.  Each call to `updateState` includes a human-readable reason which does not affect `state`, but is included in state events and is useful for debugging.

> Library method return values are currently only used for testing -- use cases and best practices for library method return values is TBD.

Since each Stated Library is a completely independent object, they are very easy to test.  Here's how the Todo library could be tested:
```js
// TodoLib.test.js
import TodoLib from './TodoLib';

test('Initial state', () => {
  const todoLib = TodoLib();
  expect(todoLib.state.todos).toHaveLength(0);
});

test('Adds todo', () => {
  const todoLib = TodoLib();
  todoLib.addTodo('Drop Redux');
  expect(todoLib.state.todos).toHaveLength(1);
  expect(todoLib.state.todods[0]).toMatchObject({
    title: 'Drop Redux',
    completed: false,
  });
});

test('Fetches todos', async () => {
  const todoLib = TodoLib();
  const fetchPromise = todoLib.fetchTodos();
  expect(todoLib.state.isFetching).toBe(true);
  await fetchPromise;
  expect(todoLib.state.isFetching).toBe(false);
  expect(todoLib.state.todos.length).toBeGreaterThan(0);
});
```

## Why Use Stated Libraries?
Ultimately Stated Libraries helps you develop high-quality, well-tested applications more quickly than other solutions.  This is mainly because Stated Libraries are easy and fast to develop and test, are truly modular, and are easy to integrate and test together.

Read more about the motivation and design process for `Stated Libraries` in:
* [Observable State: The Untapped Composable State Solution for React](https://medium.com/@bradfordlemley/observable-state-feac950850b?sk=62f0d6cf7842ca32513fceb205b3c933)
* [Why State Management Is All Wrong](https://medium.com/@bradfordlemley/why-state-management-is-all-wrong-ca9f3bbde869?source=friends_link&sk=5e2d7de65bf45c46133db6c437bb9a1e)


| Feature               | Stated<br/>Libraries | Redux             |
| -------------         |:-------------:       |:-------------:|
| Easy to learn         | :white_check_mark:   | :x:                |
| Easy to test          | :white_check_mark:   | :x:                |
| Modular               | :white_check_mark:   | :shit:             |
| Typescript            | :white_check_mark:   | :white_check_mark: |
| 100% coverage         | :white_check_mark:   | :x:                |
| No Boilerplate        | :white_check_mark:   | :x:                |
| Framework agnostic    | :white_check_mark:   | :eggplant:         |
| Time-travel debug     | :white_check_mark:   | :white_check_mark: |
| Local state           | :white_check_mark:   | :x:                |
| Large community       | Needs help           | :white_check_mark: |
| Cool name             | :x:                  | :white_check_mark: |

### Comparisons
The best way to compare solutions is probably to take examples and re-write them with Stated Libraries, making an effort to keep them as apples-to-apples as possible.  Metrics like SLOC, performance, etc., can be helpful, too.  But, none of the info is definitive, so you have to use your eyes :eyes:, brain :anguished:, and crystal ball :crystal_ball:.

Here are some examples ported from other solutions:
* https://github.com/bradfordlemley/redux/tree/slib/examples/todomvc

### Full TodoMVC Example
The [TodoApp example](https://github.com/bradfordlemley/stated-library/tree/master/examples/todoapp) is a [TodoMVC](http://todomvc.com/) app that demonstrates many features of Stated Libraries, including derived state, memoization, multiple libraries, Redux DevTools, and Local State Hydration.

Try it out here: [![Edit @stated-library/todoapp](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/bradfordlemley/stated-library/tree/master/examples/todoapp?fontsize=14), and be sure to check out time-travel debugging with Redux DevTools.


# Advanced Topics
## Immutable State
Stated Libraries utilize immutable state.  Immutable state enables performance optimizations, supports quantized and trackable state changes, supports unidirectional data flow, and is well-established in the React community.  Besides javascript itself, familiarity with immutabile data is probably the only pre-requesite knowledge for working with Stated Libraries.  Redux docs have great information on [immutable data](https://redux.js.org/faq/immutable-data).

## Best Practices
Probably the best feature of Stated Libraries is that **_all_** application logic can be developed and tested outside the application itself, without views.
* Each Stated Library should be fully tested independently
* Global application functionality should be co-located in a single module and tested directly
* View Components should import global state-related items directly from the single global state module
For example:
```
  src/
    components/
      App.js  <-- import { stuff } from '../state';
    state/
      index.js       <-- global app logic
      index.test.js  <-- global app logic tests
      todo-lib.js
      todo-lib.test.js
      visibility-lib.js
      visibility-lib.test.js
```
> Best practices are very preliminary and expected to evolve significantly.

> Best practices and usage of Stated Libraries for local state are still developing.

## Global Application Logic
A typically application would utilize a single module for global state and functionality.

The typical global application logic module would:
* Create global Stated Library instances
* Compose additional Observable State
* Implement Business Logic
* Connect Tooling

...and might look like this:
```js
// state.js
import { from } from 'rxjs';
import { distinctUntilKeyChanged, filter } from 'rxjs/operators';
import { devTools, mapState } from '@stated-library/core';
import createAuthLib from './AuthLib';
import createTodoLib from './TodoLib';
import createVisibilityLib from './VisibilityLib';

const todoLib = createTodoLib();
const visLib = createVisibilityLib();
const authLib = createAuthLib();

// State Composition
const visibleTodos$ = mapState(
  [todoLib.state$, visLib.state$],
  ([todoLibState, visLibState]) => {
    switch (visLibState.visibility) {
      case 'active':
        return todoLibState.activeTodos;
      case 'completed':
        return todoLibState.completedTodos;
      default:
        return todoLibState.todos;
    }
  });

const getFilteredTodos = memoize(
  (todos, searchTerm) =>
    searchTerm != null
      ? todos.filter(todo => todo.title.indexOf(searchTerm) !== -1)
      : todos;
);

const filteredTodos$ = mapState(
  [visibleTodos$, visLib.state$],
  ([visibleTodos, visLibState]) =>
    getFilteredTodos(visibleTodos, visLibState.searchTerm)
);

const appState$ = mapState(
  [todoLib.state$, filteredTodos$],
  ([todoLibState, filteredTodos]) => ({
    todos: filteredTodos,
    addTodo: todoLibState.addTodo,
  }));

// Business Logic
from(todoLib.state$).pipe(
  distinctUntilKeyChanged('authFailed'),
  filter(state => state.authFailed),
).subscribe( () => authLib.refreshAuth() );

from(authLib.state$).pipe(
  distinctUntilKeyChanged('user'),
).subscribe( authState => todoLib.setUser(authState.user) );

// DevTools
devTools.connect(authLib, 'authLib');
devTools.connect(todoLib, 'todoLib');
devTools.connect(visLib, 'visLib');
devTools.connectState(filteredTodos$, 'filteredTodos');
devTools.connectState(visibleTodos$, 'visibleTodos');

export {authLib, todoLib, visLib};

export {visibleTodos$, filteredTodos$};
```

### Testing Global Application Logic
The entirity of global application logic can be tested directly:
```js
// state.test.js
// reset state module for each test
let state;
beforeEach(() => {
  jest.resetModules();
  state = require('./state');
});

test('Visible Todos', () => {
  const { todoLib, visLib, visibleTodos$ } = state;
  todoLib.add('Drop Redux');
  expect(visibleTodos$.value).toHaveLength(1);
  visLib.setFilter('completed');
  expect(visibleTodos$.value).toHaveLength(0);
})
```

## Functions as Part of State
Functions can be included in state and are treated like any other piece of state, no special handling required.  This can be convenient because it keeps both state and state-related functions in one place, allowing them to be passed around together.  This also supports a cleaner layer of abstraction between functionality and view.

A Stated Library can include functions in its state and/or functions can be included via `mapState`.  All Stated Library methods are required to operate as stand-alone functions so they can be used as state, meaning that they must be pre-bound if they use `this`.

The following example modifies a TodoApp example from above, including functions in state instead of using library methods directly.

```jsx
const appState$ = mapState(visibleTodos$, visibleTodos => ({
  todos: visibleTodos,
  addTodo: todoLib.addTodo,
  setVisibility: visibilityLib.setFilter,
}));

const TodoApp = () => {
  const { addTodo, todos, setVisibility } = useObservable(appState$);
  const [text, setText] = useState("");
  return <div>
    <input value={text} onChange={ e => setText(e.target.value) } />
    <button onClick={() => addTodo(text)}>Add</button> // was todoLib.addTodo
    <ul>
      {todos.map( ({id, title}) => <li key={id}>{title}</li> )}
    </ul>
    <button onClick={() => setVisibility('all')}>Show all</button> // was visibilityLib.setFilter
    <button onClick={() => setVisibility('active')}>Show active</button> // was visibilityLib.setFilter
  </div>
}
```

A function may be constant like a Stated Library method or it can be created with state.  If a function depends on the current state, a new function generally needs to be created with each state change.  The following example demonstrates:
```jsx
const appState$ = mapState(
  [visibleTodos$, visibilityLib.state$],
  ([visibleTodos, visLibState]) => ({
    todos: visibleTodos,
    addTodo: todoLib.addTodo,
    toggleVisibility: () => visibilityLib.setVisibility(
      visLibState.visibility === 'all' ? 'active': 'all'
    ),
  }));

const TodoApp = () => {
  const { addTodo, todos, toggleVisibility } = useObservable(appState$);
  const [text, setText] = useState("");
  return <div>
    <input value={text} onChange={ e => setText(e.target.value) } />
    <button onClick={() => addTodo(text)}>Add</button> // was todoLib.addTodo
    <ul>
      {todos.map( ({id, title}) => <li key={id}>{title}</li> )}
    </ul>
    <button onClick={toggleVisibility}>Toggle visibililty</button>
  </div>
}
```

## Derived State
Stated Libraries support derived state transparently and efficiently.  State can be derived as part of state composition as shown above.  Individual Stated Libraries can also include derived state transparently as part of their state.

`@stated-library/base` base implementations support derived state by specifying a `deriveState` function.  The `deriveState` function is called every time state changes.

This example adds `completedTodos` and `activeTodos` to the Todo library's `state`.

```js
// TodoLib.js
import { createStatedLib } from '@stated-library/base';
import createTodo from './createTodo';
import fetchTodosFromCloud from './fetchTodosFromCloud';

function deriveState(rawState) {
  return {
    ...rawState,
    activeTodos: rawState.todos.filter(todo => !todo.completed),
    completedTodos: rawState.todos.filter(todo => todo.completed),
  }
}

const createTodoLib = () => createStatedLib(
  { todos: [] },
  base => ({
   // ... same as above ...
  }),
  { deriveState }
);

export default createTodoLib;
```

### Testing Derived State
Derived state is completely transparent and can be tested just like any other part of `state`.

```js
// TodoLib.test.js
import TodoLib from './TodoLib';
// ...
expect("Active and completed todos", () => {
  todoLib.addTodo('my first todo');
  todoLib.addTodo('my second todo');
  expect(todoLib.state.activeTodos).toHaveLength(2);
  expect(todoLib.state.completedTodos).toHaveLength(0);
  todoLib.toggleTodo(todoLib.state.todos[0].id);
  expect(todoLib.state.activeTodos).toHaveLength(1);
  expect(todoLib.state.completedTodos).toHaveLength(1);
});
 
```

### Memoization and Getters
To make derived state more efficient, [memoization](https://en.wikipedia.org/wiki/Memoization) and [getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) can be used.
Memoization is a technique used to achieve performance gains for computations by caching results for previous calculations.  Memoization requires a function call, but a getter can be used to make the function call transparent to the client.  Additionally, getters are lazy, so the calculation will only be performed if the property is actually used.

```js
// TodoLib.js
import memoize from 'memoize-one';
import { createStatedLib } from '@stated-library/base';
import createTodo from './createTodo';
import fetchTodosFromCloud from './fetchTodosFromCloud';

export default function createTodoLib() {

  const getCompletedTodos = memoize(
    todos => todos.filter(todo => todo.completed)
  );

  const getActiveTodos = memoize(
    todos => todos.filter(todo => !todo.completed)
  );

  function deriveState(rawState) {
    return {
      ...rawState,
      get activeTodos() {
        return getActiveTodos(rawState.todos);
      },
      get completedTodos() {
        return getCompletedTodos(rawState.todos);
      },
    }
  }

  return createStatedLib(
    { todos: [] },
    base => ({

      addTodo(text) {
        base.updateState({
            todos: base.state.todos.concat(makeTodo(text)),
          }, 'ADD_TODO');
      },

      toggleTodo(id) {
        base.updateState({
          todos: base.state.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo)
        }, 'TOGGLE_TODO');
      },

      async fetchTodos() {
        base.updateState({ isFetching: true }, 'FETCH_TODOS_START');
        const newTodos = await fetchTodosFromCloud();
        base.updateState({
          todos: base.state.todos.concat(newTodos),
          isFetching: false,
        }, 'FETCH_TODOS_COMPLETE');
      },
    }),
  { deriveState });

```

## Business Logic
Business logic, or "glue" logic, is a layer of functionality that ties together independent functionality modules.  For example, a method in ModuleA may need to be invoked when some event or state occurs in ModuleB.  A Stated Library can support custom methods to enable interactions with other modules, but it is also possible to achieve such interactions generically by monitoring `state$` and/or `stateEvent$`.

```js
// state.js
import createAuthLib from './AuthLib';
import createTodoLib from './TodoLib';

const todoLib = createTodoLib();
const authLib = createAuthLib();

authLib.state$.subscribe(state => {
  // send auth state updates to todoLib
  todoLib.setUser(state.user);
  todoLib.setLoggedIn(state.loggedIn);
});

todoLib.state$.subscribe(state => {
  // refresh auth when todolib encounters auth-related failure
  if (state.authFailed) {
    authLib.refreshAuth();
  }
});

export { todoLib, authLib };
```

### Reactive Programming Business Logic
Business logic can become quite cumbersome and verbose -- usually state changes need to be detected, requiring extra variables to remember last states, etc.

Reactive programming operators, like those from RxJS, can make the implementation of these interactions much easier.  For example, the [distinctUntilKeyChanged](https://rxjs.dev/api/operators/distinctUntilKeyChanged) operator can be used to detect when a particular part of `state` changes, whereas implementing such functionality by hand requires significantly more code.  The purple circle in the diagram represents reactive operator(s).  You don't have to use reactive operators, but they generally enable complex functionality to be implemented with very little code.

```js
// state.js
import { from } from 'rxjs';
import { distinctUntilKeyChanged, filter } from 'rxjs/operators';
import createAuthLib from './AuthLib';
import createTodoLib from './TodoLib';

const todoLib = createTodoLib();
const authLib = createAuthLib();

from(todoLib.state$).pipe(
  distinctUntilKeyChanged('authFailed'),
  filter(state => state.authFailed),
).subscribe( () => authLib.refreshAuth() );

from(authLib.state$).pipe(
  distinctUntilKeyChanged('user'),
).subscribe( authState => todoLib.setUser(authState.user) );
```

### Reactive Programming in Stated Library Implementations
The reactive programming discussed above is for implementing interactions **_between_** libraries.  Reactive programming can be used internally in Stated Library implementations, too.  Since Stated Library implementations can implement async functionality and side effects, there is nothing special required, no middleware, just do it.

## React Component Props as Observable State
A component's props can converted into an observable `props$` and then used like any observable state.
```jsx
import { useValueAs$ } from '@stated-library/react';

const MyComp = ({ itemId }) => {
  const props$ = useValueAs$(props);
  const item = use(() => mapState(
    [props$, itemsLib.state$],
    ([props,  itemsLibState]) => itemsLibState.items[prop.itemId]
  );
  return <div>{item.desc}</div>
}
```

This is also supported with `connect`:
```jsx
import { mapState } from '@stated-library/core';
import { connect } from '@stated-library/react';

const ItemPres = ({ item }) =>
  <div>{item.desc}</div>

const ItemContainer = connect(props$ =>
  mapState(
    [props$, itemsLib.state$],
    ([props,  itemsLibState]) => ({item: itemsLibState.items[prop.itemId]})
  ))
  (ItemPres);
```

## Tooling Overview
Stated Libraries' `stateEvent$` and `resetState` enable generic tooling like DevTools (time travel debugging), state hydrators (local or SSR), analytics, etc., that works with any Stated Library.

## Time-travel Debugging

Stated Libraries can be connected to the [Redux DevTools extension](https://github.com/zalmoxisus/redux-devtools-extension) to enable **time-travel debugging**.

Additionally, any state observable can be connected to Redux Devtools, allowing state composition to be monitored as well.

The DevTools extension allows developers to view the `state` history of all connected Stated Libraries and reset their `state` to any point in history.

```js
// state.js
import { devTools } from '@stated-library/core';
import createTodoLib from './TodoLib';
import createVisibilityLib from './VisibilityLib';

const todoLib = createTodoLib();
devTools.connect(todoLib, 'todoLib');

const visLib = createVisibilityLib();
devTools.connect(visLib, 'visLib');
```
Note that the standard time-travel debugging caveat for side-effects applies.  Whenever there are side effects involved, resetting to a particular `state` is not exactly equivalent to the original `state` because it does not undo side effects.  That includes server interactions, etc.  There's no support for undoing side effects.  

## Local Storage
A Stated Library's state can be saved to local storage and then hydrated on start up using the `locStorage` tooling.

```js
// state.js
import { locStorage } from '@stated-library/core';
import createTodoLib from './TodoLib';
import createVisibilityLib from './VisibilityLib';

const todoLib = createTodoLib();
locStorage.connect(todoLib, '**todolib-state**');
```

## SSR
TBD

## Local State
Stated Libraries were originally designed as an alternative to global state management solutions like Redux.
All of the concepts apply to local state, too.

This example shows how a local instance of an auto complete library could be used.

```jsx
// AutoComplete.js
import { mapState } from '@stated-library/core';
import { use } from '@stated-library/react';
import createAutoCompleteLib from './AutoCompleteLib';

const AutoComplete = () => {
  const ({setSearchText, searchText, results}) = use(() => {
    const autoLib = createAutoCompleteLib();
    return mapState(autoLib.state$, state => ({
      searchText: state.searchText,
      results: state.results,
      setSearchText: autoLib.setSearchText,
    }));
  });
  return <div>
    <input onChange={setText} value={searchText} />
    <ul>
      {results.map(opt => <li>{opt}</li>)}
    </ul>
  </div>;
};

export default AutoComplete;
```

All of the tooling -- time travel debugging, etc. -- can be applied to local state, too.

Use cases and best pracitces for local usage of Stated Libraries is still being developed...

## Getting Started
### Implementing a Stated Library

It is possible to implement a Stated Library from scratch, but the easiest way to implement a Stated Library is to utilize a base implementation, e.g. from [@stated-library/base](#@stated-library/base).

```npm install @stated-library/base```

```js
// TodoLib.js
import { createStatedLib } from '@stated-library/base';
import createTodo from './createTodo';
import fetchTodosFromCloud from './fetchTodosFromCloud';

const createTodoLib = () => createStatedLib(
  { todos: [] },
  base => ({

    addTodo(text) {
      base.updateState({
          todos: base.state.todos.concat(makeTodo(text)),
        }, 'ADD_TODO');
    },

    toggleTodo(id) {
      base.updateState({
        todos: base.state.todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo)
      }, 'TOGGLE_TODO');
    },

    async fetchTodos() {
      base.updateState({ isFetching: true }, 'FETCH_TODOS_START');
      const newTodos = await fetchTodosFromCloud();
      base.updateState({
        todos: base.state.todos.concat(newTodos),
        isFetching: false,
      }, 'FETCH_TODOS_COMPLETE');
    },
  )});

export default createTodoLib;
```

### Testing a Stated Library
A typical Stated Library test invokes a library's methods and verifies the library's `state`.

```js
// TodoLib.test.js
import createTodoLib from './TodoLib';
let todoLib;

beforeEach(() => todoLib = createTodoLib());

expect("Adds a todo", () => {
  todoLib.addTodo('my first todo');
  expect(todoLib.state.todos[0]).toEqual({
    id: todoLib.state.todos[0].id,
    title: 'my first todo',
    completed: false,
  });
});

expect("Toggles a todo", () => {
  todoLib.addTodo('my first todo');
  todoLib.toggleTodo(todoLib.state.todos[0].id);
  expect(todoLib.state.todos[0]).toEqual({
    id: todoLib.state.todos[0].id,
    title: 'my first todo',
    completed: true,
  });
});

expect("Fetches todos from cloud", async () => {
  const fecthPromise = todoLib.fetchTodos();
  expect(todoLib.state.isFetching).toBe(true);
  
  await fetchPromise;
  expect(todoLib.state.isFetching).toBe(false);
  expect(todoLib.state.todos.length).toBeGreaterThan(0);
});
```

### Testing Composed State

```js
import { getValue } from '@stated-library/core';

// reset state module for each test
let state;
beforeEach(() => {
  jest.resetModules();
  state = require('./state');
})

test('visibleTodos$ contains todos filtered thru visibilityFilter', () => {
  const { todoLib, visLib, visibleTodos$ } = state;
  todoLib.addTodo("First");
  todoLib.addTodo("Second");

  expect(getValue(visibleTodos$)).toHaveLength(2);

  visLib.setVisibility("active");
  expect(getValue(visibleTodos$)).toHaveLength(2);

  todoLib.toggle(todoLib.state.todos[0].id);
  expect(getValue(visibleTodos$)).toHaveLength(1);

});

test('filteredTodos$ contains only todos matching searchTerm', () => {
  const { todoLib, visLib, filteredTodos$ } = state;
  todoLib.addTodo("First");
  todoLib.addTodo("Second");

  expect(getValue(filteredTodos$)).toHaveLength(2);

  visLib.setSearchTerm("F");
  expect(getValue(filteredTodos$)).toHaveLength(1);

  visLib.setSearchTerm("X");
  expect(getValue(filteredTodos$)).toHaveLength(0);

  todoLib.toggle(todoLib.state.todos[0].id);
  expect(getValue(visibleTodos$)).toHaveLength(1);

});
``` 

## Stated Libraries for any state
Stated Libraries were developed as an alternative to State Management for javascript applications, but they are a general solution for anything that manages `state`.

If you have a library with pieces of `state` scattered throughout various object properties, e.g. `this.isFetching`, and it needs to notify clients when these properties change, consider combining them into a single immutable managed `state` property and converting it into a `Stated Library`.

Managing `state` using a `Stated Library` is a way to organize `state` within the library, and also provides some cool features for free, like time-travel debugging.

# Packages
Stated Libraries consists of several packages:

| Package        | Description           | Contains           |
| ------------- |:-------------|:-------------|
| [<span class="nowrap">@stated-library/interface</span>](#@stated-library/interface) | Stated Library Interface defintion (typescript). | [`StatedLibrary`](#stated-library-interface) |
| [@stated-library/core](#@stated-library/interface)      | View-framework agnostic.  Observable, operators, and tooling. | [`createObservable`](#createobservable), [`mapState`](#mapstate)<br/>Tooling: [`devTools`](#devtools), [`locStore`](#locstore) |
| [@stated-library/base](#@stated-library/base)           | Stated Library base implementations. | [`createStatedLib`](#createstatedlibrary), [`StatedLibBase`](#statedlibbase)      |
| [@stated-library/react](#@stated-library/react)         | React bindings. | [`connect`](#connect), [`use`](#use), [`link`](#link)         |

# API
## @stated-library/interface
### StatedLibrary
All Stated Libraries implement the `StatedLibrary`:
```ts
type StateEvent<RawState, State, Meta> = {
  event: string,
  meta?: Meta,
  rawState: RawState,
  state: State,
}

interface StatedLibrary<RawState, State, Meta> {
  state: State,
  state$: Observable<State>,
  stateEvent$: Observable<StateEvent<RawState, State, Meta>>,
  resetState: (rawState: rawState, event: string, meta?: Meta),
}
```

The interface defines the basis of an object that manages `state`.

* `state`: current library state
* `state$`: observable that emits `state` for each state change.
* `stateEvent$`: observable that emits `StateEvent` for each state-related event.
* `resetState`: back door to set `state`.

`stateEvent$` and `resetState` are primarily useful for external tooling like DevTools, SSR, and analytics.  `StateEvents`'s `event`, `meta`, and `rawState` provide additional info to tools, and `state` is the same as `state$`'s `state`.  

All `state`-related objects are immutable.  `rawState` should be JSON-serializable, but there are no limitations on `state`.

`state$` will typically emit a `state` each time `stateEvent$` emits a `stateEvent`, but it is possible that a `StateEvent` will not affect the `state`, in which case `stateEvent$` would emit, but `state$` would not.

Note that the observables defined in the `Stated Library Interface` are compatible with RxJS observables, but they are not RxJs observables.  `@stated-library/core` implements its own light-weight observables and operators, and there is no dependency on RxJS.

The "inputs" to Stated Libraries are library-specific methods; in other words, a `Stated Library` extends the `Stated Library Interface` by adding library-specific methods which serve as the "inputs".

Because all Stated Libraries implement the same interface, **the tooling around them is _generic_** and you **might not ever** need to work with the `Stated Library Interface` directly.

It doesn't matter how a `Stated Library` is implemented -- as long as it implements the `StatedLibrary`, it will work as a `Stated Library`.

## @stated-library/core
### createObservable
Creates an observable with a custom implementation that is compatible with RxJS.  It is similar to RxJS's `BehaviorSubject` and is used for the output of `mapState` and is also used by the `StatedLibrary` base implementations.

### mapState
`mapState` is the `state$` composer  -- it takes one or more observables as input and creates a new observable.

* `mapState(observableIn, transform) => observableOut`
  * `observableIn`: observable or array of observables
  * `transform`: function called every time `observableIn` emits a `state`.  The result is shallow-compared against the previous result, and, if different, the new result is emitted on `observableOut`.

If `observableIn` is an array, `transform` receives an array of `state` and is called every time any of the input observables emits a `state`.

Note: `mapState` is technically a custom observable operator.  It is essentially equivalent to RxJS's `combineLatest` + `map` + `distinctUntilChanged`.

### getValue
* `getValue(observable) => value`

`getValue` is a utility function that can be used to retrieve the latest value from an observable.  If the observable has a `value` property, it uses that.  If not, it temporarily subscribes to the observable to try to receive the `value` synchronously which works for observables that work like `BehaviorSubject`, but not all observables.

### devTools
* `devTools.connect(library, key) => { disconnect: () => void }`

### locState
* `locState.connect(library, key) => {clear: () => void, disconnect: () => void }`
* `locState.clearAll()`

## @stated-library/base
### createStatedLib
* `createStatedLib(initialState, methodsOrGetMethods, opts?)`
```jsx
// Counter.js
import { createStatedLib } from '@stated-library/base';

function deriveState(rawState) {
  return {
    ...rawState,
    x10: rawState.counter * 10,
  }
}

const createCounter = () => createStatedLib(
  { counter },
  {
    increment() {
      this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
    },
    decrement() {
      this.updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
    },
  },
  { deriveState }
)
```

`methodsOrGetMethods` can also be a function which returns "input" methods.  This makes for a more functional approach and also provides an opportunity to encapsulate.

```jsx
// Counter.js
import { createStatedLib } from '@stated-library/base';

function deriveState(rawState) {
  return {
    ...rawState,
    x10: rawState.counter * 10,
  }
}

const createCounter = () => createStatedLib(
  { counter },
  ({ updateState }) => ({
    increment() {
      updateState(state => ({ counter: state.counter + 1 }), 'INCREMENT');
    },
    decrement() {
      updateState(state => ({ counter: state.counter - 1 }), 'DECREMENT');
    },
  }),
  { deriveState }
)
```

### StatedLibBase
```jsx
// Counter.js
import { StatedLibBase } from '@stated-library/base';

function deriveState(rawState) {
  return {
    ...rawState,
    x10: rawState.counter * 10,
  }
}

class Counter extends StatedLibBase {
  constructor(counter: number = 0) {
    super({ counter }, { deriveState });
    StatedLibBase.bindMethods(this);
  }
  increment() {
    this.updateState({ counter: this.state.counter + 1 }, 'INCREMENT');
  }
  decrement() {
    this.updateState({ counter: this.state.counter - 1 }, 'DECREMENT');
  }
}
```

## @stated-library/react
Stated Libraries supports two ways to bind to React: 

* HOC (Prop Injection): [`connect`](#connect)
* [Direct Injection](#direct-injection): [`link`](#link)(stateful components) / [`use`](#use)(functional components)

### connect
`connect` takes an observable and creates an HOC factory to provide the observable value as props to wrapped components.

* `connect(state$)(component) => HOC`

`connect` is similar to `react-redux` of the same name, but it doesn't take `mapStateToProps`/`mapDispatch` because all of the mapping functionality is done externally.

This example shows how to use `connect` with a container/presentation components style:

```jsx
// App.js
const App = ({todos, addTodo}) => {
  return (
    <div>
      <button onClick={() => addTodo("New todo")}>
        Add todo
      </button>
      {todos.map(todo => (
        <div key={todo.id}>
          {todo.title} is completed: ${todo.completed}
        </div>
      ))}
    </div>
  );
};
```

```js
// App-container.js
import { mapState } from '@stated-library/core';
import App from './App';
import { visibleTodos$, todoLib } from './state';

const appState$ = mapState(
  visibleTodos$,
  visibleTodos => ({
    addTodo: todoLib.addTodo,
    todos: visibleTodos,
  }),
)

export default connect(appState$)(App);
```

A second form of connect allows state to be calculated using the Hoc's props; for react-redux, this is like using ownProps for mapStateToProps.

* `connect(props$ => state$)(component) => HOC`
```jsx
const ItemPres = ({ item }) =>
  <div>{item.desc}</div>

const ItemContainer = connect(props$ =>
  mapState(
    [props$, itemsLib.state$],
    ([props,  itemsLibState]) => ({item: itemsLibState.items[prop.itemId]})
  ))
  (ItemPres);
```

### Direct Injection

**Direct injection** means that `state$` will be a part of the component's `state` rather than being provided to the component as props (via an HOC).  The benefit of direct injection is that there is no extra component in the React component tree.

### use
**`use`** is the direct injection mechanism for functional components.  It creates a React hook that updates the component whenever the observable emits a new value.

```jsx
// App.js
import * as React from 'react';
import { mapState } from '@stated-library/core';
import { connect } from '@stated-library/react';
import { todoLib, visibleTodos$ } from './state';

const appState$ = mapState(
  visibleTodos$,
  visibleTodos => ({
    addTodo: todoLib.addTodo,
    todos: visibleTodos,
  }),
)

export default () => {
  const {todos, addTodo} = use(appState$);
  return (
    <div>
      <button onClick={() => addTodo("New todo")}>
        Add todo
      </button>
      {todos.map(todo => (
        <div key={todo.id}>
          {todo.title} is completed: ${todo.completed}
        </div>
      ))}
    </div>
  );
};
```

### useValueAs$(value)
**`useValueAs$`** converts a value into an observable which can then be composed with other observables.  This is really only useful for converting props to props$.

```jsx
import { useValueAs$ } from '@stated-library/react';

const MyComp = ({ itemId }) => {
  const props$ = useValueAs$(props);
  const item = use(() => mapState(
    [props$, itemsLib.state$],
    ([props,  itemsLibState]) => itemsLibState.items[prop.itemId]
  );
  return <div>{item.desc}</div>
}
```

### link
**`link`** is the direct injection mechanism for stateful class components.  It spreads the observable's value onto the component's `state` by calling the component's `setState` method whenever the observable emits a new value.  `link` follows the standard life-cycle [subscription mechanism](https://reactjs.org/docs/react-component.html#componentdidmount).

```jsx
// App.js
import * as React from 'react';
import { mapState } from '@stated-library/core';
import { connect } from '@stated-library/react';
import { todoLib, visibleTodos$ } from './state';

const appState$ = mapState(
  visibleTodos$,
  visibleTodos => ({
    addTodo: todoLib.addTodo,
    todos: visibleTodos,
  }),
)

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.link = link(appState$);
  }

  componentDidMount() {
    this.link.connect();
  }

  componentWillUnmount() {
    this.link.disconnect();
  }

  render() {
    const {todos, addTodo} = use(appState$);
    return (
      <div>
        <button onClick={() => addTodo("New todo")}>
          Add todo
        </button>
        {todos.map(todo => (
          <div key={todo.id}>
            {todo.title} is completed: ${todo.completed}
          </div>
        ))}
      </div>
    );
  };

```

## Prior Art
### Redux
Many concepts in Stated Libraries are informed by, borrowed from, or outright stolen from `Redux`.

While many of the concepts used in `Redux` are brilliant, I personally find developing with `Redux` to be slow and painful, mainly due to:
- boilerplate (action/reducer/etc for every little thing)
- inability to implement complex functionality without strange dependencies on external middleware
- inability to create truly self-contained modules
- effort required to test all of the above

### RxJS
Observables and reactive operators are concepts from RxJS and ReactiveX.  **State observables** are the heart of Stated Libraries, and the functionality is exactly the same as an RxJS Observable; in fact, they are interoperable with RxJS reactive operators.

## Design

Stated Libraries design is based on this View Framework architecture diagram:

<img src="./assets/view-framework.png">

#### Key Points
* Functionality outputs State
* Functionality is independent of View
* Data flow is unidirectional

Stated Libraries are designed around the [Key Points](#key-points) above, and additionally for modularity, following the [unix philosophy](https://en.wikipedia.org/wiki/Unix_philosophy).

<img src="./assets/stated-libraries-single.png">

<style>
.nowrap {
  white-space: nowrap;
}
</style>



| Component         | Symbol          | Description  | Implemented By | View Framework Agnostic |
| -------------     |:-------------:| -----|:-----|:-----:|
| <span class="nowrap">Stated Library</span>  | <img src="./assets/stated-library.png" style="height: 24px"> | A module that implements functionality and outputs state. | <span style="white-space: nowrap">You + [@stated-library/base](#@stated-library/base)</span>| :white_check_mark:
| <span class="nowrap">View Module</span>      | <img src="./assets/view-module.png" style="height: 24px">    | A view module in a view framework. | You + view framework
| <span class="nowrap">State Operator</span>   | <img src="./assets/operator.png" style="height: 24px">       | An object that transforms & combines state. | <span class="nowrap">[@stated-library/core](#@stated-library/core)</span> | :white_check_mark:
| <span class="nowrap">Framework Binding</span>| <img src="./assets/binding-symbol.png" style="height: 24px"> | Converts standard state output to view-framework-specific state input. | <span class="nowrap">[@stated-library/react](#@stated-library/react),<br/>@stated-library/{view-fmk}</span>

The <img src="./assets/observable.png" style="height: 24px"> symbol represents **observable state**, the mechanism used throughout the system to output state.  This standard state output mechanism is the key to making all of the components fit together, allowing components to be added into the system seamlessly.

A **Stated Library** is an object that takes input using regular object methods and outputs state via observable state.

> _Observable_ and _reactive operator_ are reactive programming terms.  _Reactive Programming is the practice of operating on pushed data_, and that is exactly what is happening in Stated Libraries, where the pushed data is state.

State operators form a layer of **state composition** that sits between Stated Library Functionality Modules and View Modules, transforming and combining state outputs to meet the input requirements of View Modules.  The state composition layer allows functionality modules to be combined seamlessly, allowing multiple functionality modules to appear as one.

<img src="./assets/stated-libraries-multiple-funcs.png">

Multiple view modules can be supported by composing state for each view module:

<img src="./assets/stated-libraries-multiple.png">

### Anatomy of a Stated Library
A Stated Library is a regular object that implements standard Stated Library properties.

In addition to standard state output, Stated Libraries implement other properties that enable standard tooling.

<img src="./assets/anatomy.png">

| Property      | Symbol        | Type | Description  | Enables Tooling |
| ------------- |:-------------:|:----- | -----        | :----: |
| `state`       |  | State | Library's current state. |
| `state$`      | <img src="./assets/observable.png" style="height: 24px"> | Observable\<State\> | Emits a State each time the library's state changes. |
| methods |  | (any) => any | Library-specific input methods. |
| `stateEvent$` | <img src="./assets/state-event-observable.png" style="height: 24px"> | Observable\<StateEvent<State\>\> | Emits a StateEvent for each event affecting state.| :white_check_mark:
| `resetState`  | <img src="./assets/reset-state-symbol.png" style="height: 24px"> | (State) => void | Sets library state. | :white_check_mark:

A `StateEvent` includes additional information that is useful for tooling:

| Property      | Type   | Description  |
| ------------- |:------:|:----- |
| `state`       | State  | The library's new state.    |
| `rawState`    | State  | The library's raw state, does not contain derived state. |
| `reason`      | string | Human-readable reason for state change. |
| `meta`        | any    | Event-specific data.  |

Generally, `state$` emits a State each time `stateEvent$` emits a StateEvent; however, it is possible that an event will not affect state, in which case `stateEvent$` would emit a StateEvent, but `state$` would not emit a State.

The `resetState` method is used by tooling that hydrates state: e.g. SSR, DevTools, etc.

All of the standard Stated Library properties are officially defined by the [Stated Library Interface](#statedlibraryinterface).

### Business Logic
<img src="./assets/business-logic.png">

### Tooling
<img src="./assets/tooling.png">
