# Stated Libraries
**Simple, Clean, Powerful State Management**

 [![Build Status][build-badge]][build] [![Code Coverage][coverage-badge]][coverage] ![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) [![License][license-badge]][license]

[build]: https://dev.azure.com/bradfordlemley/stated-library/_build/latest?definitionId=1&branchName=master

[build-badge]: https://img.shields.io/azure-devops/build/bradfordlemley/stated-library/1/master.svg

[coverage]: https://codecov.io/github/bradfordlemley/stated-library/branch/master

[coverage-badge]: https://img.shields.io/codecov/c/gh/bradfordlemley/stated-library/master.svg

[coverage-badge-az]: https://img.shields.io/azure-devops/coverage/bradfordlemley/stated-library/1/master.svg

[license-badge]: https://img.shields.io/github/license/bradfordlemley/stated-library.svg

[license]: https://github.com/bradfordlemley/stated-library/blob/master/LICENSE


**`Stated Libraries`** are **independent modules** that are **fast to develop** :rocket:, **easy to test** :trophy:, and **easy to integrate** :package:.

...those features support **efficient development workflows**: **build _high-quality_ software _faster_** :dart:.

<details>
<summary><span style="font-weight: regular">Table of Contents</span></summary>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

  - [Overview](#overview)
  - [Getting Started](#getting-started)
    - [Implementing](#implementing)
    - [Testing](#testing)
    - [React](#react)
    - [Summary](#summary)
  - [Multiple Stated Libraries](#multiple-stated-libraries)
  - [Composing State](#composing-state)
    - [Redux-like Global Store](#redux-like-global-store)
    - [`mapState` vs `mapStateToProps`](#mapstate-vs-mapstatetoprops)
    - [Testing Composed State](#testing-composed-state)
- [Tooling](#tooling)
  - [Redux DevTools](#redux-devtools)
  - [Hydrate from Local Storage](#hydrate-from-local-storage)
  - [SSR](#ssr)
- [Derived State](#derived-state)
    - [Testing Derived State](#testing-derived-state)
    - [Memoization](#memoization)
- [Full Example Todo App](#full-example-todo-app)
- [Library-to-Library Interactions](#library-to-library-interactions)
    - [Generic Interactions](#generic-interactions)
    - [Interactions with Reactive Programming](#interactions-with-reactive-programming)
      - [Internal Reactive Programming](#internal-reactive-programming)
- [Stated Libraries for Local State](#stated-libraries-for-local-state)
- [Stated Libraries for any state](#stated-libraries-for-any-state)
- [Packages](#packages)
- [API](#api)
  - [Interface](#interface)
  - [Core](#core)
    - [createObservable](#createobservable)
    - [mapState](#mapstate)
    - [getValue](#getvalue)
    - [devTools](#devtools)
    - [locState](#locstate)
  - [StatedLibrary Base Class](#statedlibrary-base-class)
  - [React Bindings](#react-bindings)
    - [`connect`](#connect)
    - [Direct Injection](#direct-injection)
    - [Functional Components: `use`](#functional-components-use)
    - [Stateful Components: `link`](#stateful-components-link)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
</details>

## Overview

:white_check_mark: **Powerful**: **`Stated Libraries`** are **regular javascript objects**.  There are **no limitations** on functionality -- if you can do it in javascript, you can do it.

:white_check_mark: **Modular**:  **`Stated Libraries`** are **completely self-contained, modular entities**.

:white_check_mark: **Testable**:  **`Stated Libraries`** are **fully and completely testable**...independently, all by themselves.

:white_check_mark: **Unidirectional**: **`Stated Libraries`** implement **unidirectional data flow**; the _inputs_ are library-specific methods, and the _output_ is `state`.

:white_check_mark: **Observable**: **`Stated Libraries`** output, `state$`, is an observable, which is an ideal construct for `state` because:
- Observables have a **built-in change notifier service** -- very useful for anything interested in the library's `state`; for example, view frameworks like `React`.
- Observables are **composable** -- this allows `state` to be easily manipulated, transformed, combined, etc.  Among other things, this allows `Stated Libraries` to be easily integrated.

:white_check_mark: **Reactive**: **`Stated Libraries`** observable `state$` brings along the power of **reactive programming**...but, you don't have to be a reactive programmer to use it.

:white_check_mark: **Framework-agnostic**: **`Stated Libraries`** are completely **framework-agnostic**.  **_All_** `state` logic, including integration/combinational/business logic, is also framework-agnostic.  This means that all application `state` logic is portable and is easily testable outside of any application framework.

:white_check_mark: **Toolable**: **`Stated Libraries`** support **time-travel debugging**, **state hydration**, and other tooling around `state`.

:dizzy: All of this makes `Stated Libraries` **super powerful**, yet **easy to learn**, **fast to develop _and_ test**, and **easy to integrate _and_ test**.

## Getting Started

All `Stated Libraries` implement the [`StatedLibraryInterface`](#stated-library-interface) which forms the basis of an object that manages `state`:

```jsx
// Stated Library Interface
{
  state,       // current state
  state$,      // state observable: emits state each time state changes
  stateEvent$, // event observable: emits event for each state-related event
  resetState,  // back door for tooling to set state
}
```
`Stated Libraries` **extend** this interface by adding **library-specific methods** that serve as inputs and drive changes to `state`.

The `@stated-library/base` package supports two options for creating `Stated Libraries`:
* [`StatedLibBase`](#statedlibbase): an ES6 base class
* [`createStatedLib`](#createStatedLib): a more functional approach

It doesn't matter how you create a `Stated Library` -- as long as it implements the `StatedLibraryInterface`, it will be interoperable with other `Stated Libraries` and work with `Stated Library` tooling.

## Todo Library Example
This example creates a simple `Todo` library using [`createStatedLib`](#createStatedLib):

```js
// TodoLib.js
import { createStatedLib } from '@stated-library/base';
import createTodo from './createTodo';

const createTodoLib = () => createStatedLib(
  { todos: [] },
  {
    addTodo(title) {
      this.updateState({
        todos: this.state.todos.concat([ createTodo(title) ])
      }, "ADD_TODO");
    },
    
    toggleTodo(id) {
      this.updateState({
        todos: this.state.todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
      }), "TOGGLE_TODO");
    },
    
    async fetchTodos() {
      this.updateState({isFetching: true}, "FETCH_TODOS_START");
      const newTodos = await fetchTodosFromCloud();
      this.updateState({
        todos: this.state.todos.concat(newTodos),
        isFetching: false,
      }, "FETCH_TODOS_COMPLETE");
    }
  }
);
```

The `Todo` library is a regular javascript object with `addTodo`, `toggleTodo`, and `fetchTodos` methods which update the library's `state`.  `fetchTodos` is asynchrononus, demonstrating how async functionality can be implemented _normally_.

### Testing
An efficient development workflow requires efficient test development.  One of the best features of `Stated Libraries` is that they are **completely self-contained**, and that makes them **easy to test**.  

Here's how the `Todo` library could be tested:

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

`Stated Library` tests typically invoke library methods, then verify `state`.

### React
`React` components access `Stated Libraries` via generic `React` bindings.

Here's how the `Todo` library could be used in a `React` app with the [`connect`](#connect) binding:
```jsx
// App.js
import { connect } from '@stated-library/react';
import createTodoLib from './TodoLib';

const todoLib = createTodoLib();

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

export default connect(todoLib.state$)(App);
```

### Summary
The Todo example above demonstrates how easy it is to **develop and test** a `Stated Library` and use it in a `React` app...but, that's only the tip of the iceberg.  `Stated Libraries` really shine with more complex apps.

## Multiple Stated Libraries
A typical application would use several `Stated Libraries` and create global library instances together, e.g. in a `state.js` module, and to be exported and used throughout the application.

`state.js` is analogous to _where_ a global `Redux` store would be created, but it is _not_ a global store like `Redux`.

`state.js` can also be used as a library integration layer or business logic layer.

Here's an example `state.js`:

```jsx
// state.js
import createTodoLib from './TodoLib';
import createVisibilityLib from './VisibilityLib';

const todoLib = createTodoLib();
const visLib = createVisibilityLib();

export {todoLib, visLib};
```

## State Composition

**State composition** is the special sauce of `Stated Libraries`.

State composition allows libraries to be combined, reshaped, etc.

The [`mapState`](#mapstate) function is the `state$` composer.  It takes one or more `state$` in, and creates another `state$` -- hence composability.  The resulting `state$` can be used as an input to another `mapState`.

>`mapState` is essentially a custom reactive operator -- observable(s) in, observable out.  When using `mapState`, you are essentially _reactive programming_, but you won't know it.  In fact, `mapState` can be implemented with RxJS operators: `combineLatest`, `map` + `distinctUntilChanged`, although `Stated Libraries` uses a custom implementation and does not have a dependency on RxJS.

State composition allows incredible abstractions.  That means there are a lot of ways to structure an app.

## Todo App State Composition
Here's an example of `mapState` combining `state$` from multiple libraries.  In this case, the `Todo` library and `Visibility` library in `state.js` are used together to make `appData$` that contains only "visible" todos:

```jsx
// state.js
// ...
const appData$ = mapState(
  [todoLib.state$, visLib.state$],
  ([todoLibState, visLibState]) => ({
    todos: visLibState.visibility === 'all'
      ? todoLibState.todos
      : todoLibState.todos.filter(todo => !todo.completed)
    addTodo: state.addTodo,
  }));
// ...
export {todoLib, visLib, appData$};
```

This example creates an equivalent `appData$`, but utilizes an intermediate `visibleTodos$`:

```jsx
// state.js
// ...
const visibleTodos$ = mapState(
  [todoLib.state$, visLib.state$],
  ([todoLibState, visLibState]) =>
    visLibState.visibility === 'all'
      ? todoLibState.todos
      : todoLibState.todos.filter(todo => !todo.completed)
  );

const appData$ = mapState(
  [todoLib.state$, visibleTodos$],
  ([todoLibState, visibleTodos]) => ({
    todos: visibleTodos,
    addTodo: state.addTodo,
  }));

export {todoLib, visLib, appData$, visibleTodos$};
```

### Redux-like Global Store
Another way to utilize composed state is to create a `Redux`-like store combining all libraries into a single `state$`.

```jsx
// state.js
// ...
const state$ = mapState(
  [todoLib.state$, visLib.state$],
  ([todoLibState, visLibState]) => ({
    todoLibState,
    visLibState,
  }));

const visibleTodos$ = mapState(
  $state,
  ({todoLibState, visLibState}) =>
    visLibState.visibility === 'all'
      ? todoLibState.todos
      : todoLibState.todos.filter(todo => !todo.completed)
);

const appData$ = mapState(
  [todoLib.state$, visibleTodos$],
  ([todoLibState, visibleTodos]) => ({
    todos: visibleTodos,
    addTodo: state.addTodo,
  }));

export {todoLib, visLib, appData$, state$, visibleTodos$};
```

### `mapState` vs `mapStateToProps`
`mapState` is similar to `react-redux`'s `mapStateToProps` + `mapDispatch` functionality.  The big differences are that the mapping takes place externally to the `React` binding, that "methods" are included with `state`, and that the "mapped state" is composable.

These are significant differences because they allow much more flexibility and abstraction, and they allow the application logic to be completely independent of the application framework; and, most importantly, it allows thorough testing of application logic outside of any application framework.

### Testing Composed State
Testing is important at every level.  All of the functionality implemented above can be easily tested:
```js
//...
test('visibleTodos$ contains todos filtered thru visibilityFilter', () => {
  todoLib.addTodo("First");
  todoLib.addTodo("Second");

  expect(getValue(visibleTodos$)).toHaveLength(2);

  visLib.setVisibility("active");
  expect(getValue(visibleTodos$)).toHaveLength(2);

  todoLib.toggle(todoLib.state.todos[0].id);
  expect(getValue(visibleTodos$)).toHaveLength(1);

});
``` 

# Tooling
The [`Stated Library Interface`](#stated-library-interface) supports generic external tooling because external tools can subscribe to a library's `state$` or `stateEvent$` to monitor `state`, and set a library's `state` using `resetState`.  That's all the functionality that is needed for a lot of external tooling like DevTools, state hydrators (local or SSR), analytics, etc.

## Redux DevTools

Any `Stated Library` can be connected to the [Redux DevTools extension](https://github.com/zalmoxisus/redux-devtools-extension) to enable **time-travel debugging**.

The DevTools extension allows you to view the `state` history of all connected `Stated Libraries` and reset `state` to any point in history, or play back the `state` history.

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

## Hydrate from Local Storage
A `Stated Library`'s state can be saved to local storage and then hydrated on start up using the `locStorage` tool.

```js
// state.js
import { locStorage } from '@stated-library/core';
import createTodoLib from './TodoLib';
import createVisibilityLib from './VisibilityLib';

const todoLib = createTodoLib();
locStorage.connect(todoLib, '**todolib-state**');

```

## SSR
Todo: implement SSR

# Derived State
`Stated Libraries` support derived state transparently.

The [`StatedLibrary`](#stated-library) base class supports derived state via a `deriveState` option.  If a `deriveState` function is specified, the `updateState` method updates the "raw" `state` and the `deriveState` function is called to convert raw state to `state`.

Here's how `completedTodos` and `activeTodos` could be added to the `Todo` library as derived state.

```js
// TodoLib.js
import StatedLibBase from '@stated-library/base';
import createTodo from './createTodo';

function deriveState(rawState) {
  return {
    todos: rawState.todos,
    activeTodos: rawState.todos.filter(todo => !todo.completed),
    completedTodos: rawState.todos.filter(todo => todo.completed),
  }
}

export default class TodoLib extends StatedLibBase {
  
  constructor(){
    super({todos: []}, {deriveState});
    StatedLibBase.bindMethods(this);
  }

  //...
}

```

### Testing Derived State
Derived state is completely transparent and can be tested just like any other part of `state`.

```js
// TodoLib.test.js
import TodoLib from './TodoLib';
// ...
expect("Active and completed todos", () => {
  const todoLib = createTodoLib();
  todoLib.addTodo('my first todo');
  todoLib.addTodo('my second todo');
  expect(todoLib.state.activeTodos).toHaveLength(2);
  expect(todoLib.state.completedTodos).toHaveLength(0);
  todoLib.toggleTodo(todoLib.state.todos[0].id);
  expect(todoLib.state.activeTodos).toHaveLength(1);
  expect(todoLib.state.completedTodos).toHaveLength(1);
});
 
```

### Memoization
[Memoization](https://en.wikipedia.org/wiki/Memoization) is a technique used to achieve performance gains for computations by caching results for previous calculations.  Memoization requires a function call, but a [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) can be used to hide the function call, so **memoization + getter** can be used to achieve memoization transparently in derived state.

This example uses [`reselect`](https://github.com/reduxjs/reselect), which is a memoization library commonly used with `Redux`.

```js
// TodoLib.js
import { createSelector } from 'reselect';
import StatedLibBase from '@stated-library/base';
import createTodo from './createTodo';

// memoize
const getCompletedTodos = createSelector(
  state => state.todos,
  todos => todos.filter(todo => todo.completed),
)

// memoize
const getActiveTodos = createSelector(
  state => state.todos,
  todos => todos.filter(todo => !todo.completed),
)

function deriveState(rawState) {
  return {
    isFetching: rawState.isFetching,
    todos: rawState.todos,
    get completedTodos() { // getter
      return getCompletedTodos(this);
    },
    get activeTodos() { // getter
      return getActiveTodos(this);
    },
  }
}
// ...
```

# Full Example Todo App
The [TodoApp example](https://github.com/bradfordlemley/stated-library/tree/master/examples/todo-lib) is a Todo-MVC app that demonstrates `Stated Libraries`, including derived state, memoization, multiple libraries, Redux DevTools, and Local State Hyrdation.

The app uses these external `Stated Libraries`:
* Todo library: [examples/todo-lib](https://github.com/bradfordlemley/stated-library/tree/master/examples/todo-lib)
* Nav library: [examples/nav-lib](https://github.com/bradfordlemley/stated-library/tree/master/examples/nav-lib)

Check out the app's [state.ts](https://github.com/bradfordlemley/stated-library/blob/master/examples/todoapp/src/state.ts), that's where everything comes together.

You can try it out in CodeSandbox:

[![Edit @stated-library/todoapp](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/bradfordlemley/stated-library/tree/master/examples/todoapp?fontsize=14)


# Library-to-Library Interactions
Since libraries are modular entities, we often want to tie them together somehow -- basically an integration layer or a business logic layer.  For example, maybe when something happens in Library A, you want to do something with Library B.

### Generic Interactions
The generic way to achieve library-to-library interaction is to monitor a library's `state$` or `stateEvent$` and do something when a certain state or event is encountered.

_In some cases it might be preferrable to implement library-specific methods instead, but this is the generic way._

```js
// state.js
import AuthLib from './AuthLib';
import createTodoLib from './TodoLib';

const todoLib = createTodoLib();
const authLib = new AuthLib();

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

The conditions for the interactions can get complicated, especially when functionality depends on state transitions and/or states from multiple libraries.  You need to add some varibles to track the last state(s).

While it is possible to achieve such functionality this way, it is much easier with "reactive programming"...

### Interactions with Reactive Programming 
**Reactive programming** makes library-to-library interactions easier because standard **reactive operators** already implement much or all of the functionality you will need.

Here's how you could implement interactions with RxJs:

```js
// state.js
import { from } from 'rxjs';
import { distinctUntilKeyChanged } from 'rxjs/operators';
import AuthLib from './AuthLib';
import createTodoLib from './TodoLib';

const todoLib = createTodoLib();
const authLib = new AuthLib();

from(todoLib.state$).pipe(
  distinctUntilKeyChanged('authFailed'),
  filter(state => state.authFailed),
).subscribe( () => authLib.refreshAuth() );

from(authLib.state$).pipe(
  distinctUntilKeyChanged('user'),
).subscribe( authState => todoLib.setUser(authState.user) );
```

#### Internal Reactive Programming
The reactive programming discussed above is directed at library-to-library interactions -- external to libraries.  If you want to implement library functionality with reactive programming, and the functionality is logically contained in the library, then you should use reactive programming **internally** in the library.  (`Stated Libraries` can utilize reactive programming internally in their implementations, just like they can use Promises and other async functionality.)

# Stated Libraries for Local State
`Stated Libraries` can be used for **local state**, too.

This example shows how a local instance of an auto complete library could be used.

```jsx
// AutoComplete.js
import { mapState } from '@stated-library/core';
import { use } from '@stated-library/react';
import AutoCompleteLib from './AutoCompleteLib';

const AutoComplete = () => {
  const ({setSearchText, searchText, results}) = use(() => {
    const autoLib = new AutoCompleteLib();
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

All of the tooling -- DevTools, etc. -- can be applied to local state, too!

Todo: local `Stated Libraries` could be a really useful ... need more examples.

# Stated Libraries for any state
`Stated Libraries` were developed as a solution to State Management for applications, but they are a general solution for anything that manages `state`.

If you have a library with pieces of `state` scattered throughout various object properties, e.g. `this.isFetching`, and it needs to notify clients when these properties change, consider combining them into a single immutable managed `state` property and converting it into a `Stated Library`.

Managing `state` using a `Stated Library` is a way to organize `state` within the library, and also provides some cool features for free, like time-travel debugging.

# Packages
`Stated Libraries` consists of several packages:

| Package        | Contains           |
| ------------- |:-------------:|
| `@stated-library/interface` |[ Stated Library Interface](#stated-library-interface) definition (typescript) |
| `@stated-library/core`      | [`mapState`](#mapstate), [`devTools`](#devtools), [`locStore`](#locstore), [`observable`](#observable) |
| `@stated-library/base`      | [`StatedLibrary`](#stated-library-base) base class      |
| `@stated-library/react`     | React bindings: [`connect`](#connect), [`use`](#use), [`link`](#link)         |
# API
## Interface
All `Stated Libraries` implement the `Stated Library Interface`:
```ts
type StateEvent<RawState, State, Meta> = {
  event: string,
  meta?: Meta,
  rawState: RawState,
  state: State,
}

interface StatedLibraryInterface<RawState, State, Meta> {
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

The "inputs" to `Stated Libraries` are library-specific methods; in other words, a `Stated Library` extends the `Stated Library Interface` by adding library-specific methods which serve as the "inputs".

Because all `Stated Libraries` implement the same interface, **the tooling around them is _generic_** and you **might not ever** need to work with the `Stated Library Interface` directly.

## Core
### createObservable
Creates an observable with a custom implementation that is compatible with RxJS observables.  It is similar to RxJS's `BehaviorSubject` and is used for the output of `mapState` and is also used by the `StatedLibrary` base class.

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

## Base
### createStatedLib
### StatedLibBase

## React Bindings
`Stated Libraries` supports two different ways to integrate into React: 

* HOC (Prop Injection): [`connect`](#connect)
* [Direct Injection](#direct-injection): [`link`](#link)(stateful components) / [`use`](#use)(functional components)

### connect
`connect` takes an observable and creates an HOC factory to provide the observable value as props to wrapped components.

* `connect(state$)(component) => HOC`

`connect` is similar to `react-redux` of the same name, but it doesn't take `mapStateToProps` because all of the mapping functionality is done externally.

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
Notice that we used `visibleTodos$` as an input to create `appState$`.  This demonstrates the power of `state$` observables composition.  We could have used `todoLib.state$` and `visLib.state$` as inputs, but we contained the `visibleTodos$` logic in `state.js`.

We added the `addTodo` function directly from `todoLib`.  We can do that because it was already bound using `StatedLib.bindMethods`, and it is a static value.  (It is possible for libraries to put methods on `state` which would allow `appData$` to be completely computed from `state` -- that might be developed as a best practice later on, but it's not necessary.)

### Direct Injection

`connect` provides observable as props via an HOC, but observables can also be used without an HOC -- by directly injecting the value into components' state.

The **direct injection** method is different for stateful class components (which receive state via `setState`) vs functional components (which receive state via hooks).

This **direct injection** method means there is no HOC, which also means that there's no container/presentational component.

Again, both ways are valid...

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
  const {todos, addTodo} = use(appData$);
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
    const {todos, addTodo} = use(appData$);
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
