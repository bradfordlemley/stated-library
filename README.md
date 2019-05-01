# Stated Libraries
**Simple, Clean, Powerful Unidirectional Data Flow ... everywhere.**

**Fast to develop**, **easy to test** ... an **enjoyable developer experience** all the way to "done".

**`Stated Libraries`** are essentially an alternative to `Redux` or `Mobx`, but they can be used any where there is `state`.


[![License][license-badge]][license] [![Build Status][build-badge]][build] [![Code Coverage][coverage-badge]][coverage]

[build]: https://dev.azure.com/bradfordlemley/stated-library/_build/latest?definitionId=1&branchName=master

[build-badge]: https://img.shields.io/azure-devops/build/bradfordlemley/stated-library/1/master.svg

[coverage]: https://codecov.io/github/bradfordlemley/stated-library/branch/master

[coverage-badge]: https://img.shields.io/codecov/c/gh/bradfordlemley/stated-library/master.svg

[coverage-badge-az]: https://img.shields.io/azure-devops/coverage/bradfordlemley/stated-library/1/master.svg

[license-badge]: https://img.shields.io/github/license/bradfordlemley/stated-library.svg

[license]: https://github.com/bradfordlemley/stated-library/blob/master/LICENSE

## Table of Contents

<details>
<summary><span style="font-weight: regular">Table of Contents</span></summary>

* [Introduction](#introduction)
* [Interface](#stated-library-interface)
* [Creating a Stated Library](#creating-a-stated-library)
  * [Stated Library Base Class](#stated-library-base-class)
  * [Testing a Stated Library](#testing-a-stated-library)
  * [Async Functionality](#async-functionality)
  * [Memoization](#memoization)
  * [Summary](#summary)
* [Using Stated Libraries](#using-stated-libraries)
  * [Multiple Stated Libraries](#multiple-stated-libraries)
  * [Mapping State](#mapping-state)
    * [Testing Mapped State](#testing-mapped-state)
  * [React](#react)
    * [HOC](#connect)
    * [Direct Injection](#direct-injection)
  * [Library-to-Library Interactions](#library-to-library-interactions)
    * [Generic Interactions](#generic-interactions)
    * [Interactions with Reactive Programming](#interactions-with-reactive-programming)
    * [Internal Reactive Programming](#internal-reactive-programming)
* [Tooling](#tooling)
  * [Time travel Debugging](#redux-devtools)
  * [Hydrate from Local Storage](#hydrate-from-local-storage)
  * [SSR](#ssr)
* [Full Example Todo App](#full-example-todo-app)
* [Stated Libraries for Local State](#stated-libraries-for-local-state)
* [Stated Libraries for any state](#stated-libraries-for-any-state)
* [Ode to Redux](#ode-to-redux)
* [Packages](#packages)
</details>

## Introduction

**Unidirectional data flow is supposed to be a simplification**...  so, why are state management solutions like `flux` and `Redux` so weird and complicated?

Allow `Stated Libraries` to show you a simpler way...

**`Stated Libraries`** are just **regular javascript objects**.

* The **inputs** are just **normal object _methods_**.
* The **output** is a **`state$`** property.

The **`$`** means **`state$`** is an **observable**, and for `state` ... **observables** are **"money"** :moneybag:.  (translation: :thumbsup: :thumbsup: :thumbsup:)

* Observables have a **built-in subscription service** -- very useful for anything that might be interested in the library's `state`; for example, view frameworks like `React`.

* Observables are **composable** -- take an observable in, operate on it, transform it, whatever, and output: another observable.  

**Composability** is the **special sauce** for `state`.  It means `state$` can be mapped, combined, mapped and combined, or whatever...and we end up with another `state$`.  For example, `state$` from multiple libraries can be combined into a new `state$`.

You don't have to be a reactive programmer to use these observables.

Here's a couple more features:

* **`Stated Libraries`** can perform **async operations** and cause **side effects** without limitations.

* **`Stated Libraries`** are **framework-agnostic**.

* **`Stated Libraries`** support **time-travel debugging**.

...

All of this makes **`Stated Libraries`** **fast to develop**, **easy to reuse**, and an **enjoyable developer experience** all the way to "done".

# Stated Library Interface
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

# Creating a Stated Library
The `Stated Library Interface` really isn't too difficult to implement from scratch, but ususally you'll want to start with a base class (or similar) so you can focus on library-specific functionality.

`Stated Libraries` ships a base class that should work for most cases, but you can implement your own base class (or similar), too.

_It doesn't matter how you implement your library, as long as it implements the `Stated Library Interface`._

## Stated Library Base Class
The `StatedLibBase` base class provides:
* `updateState(update, event, meta?)`: shallow state update. (`event` and `meta` go to `StateEvent` for debugging, analytics, etc.)
* `deriveState` option: transform `rawState` to `state`
* `bindMethods` static method: bind all object methods

If `deriveState` is specified, `updateState` updates `rawState` and `deriveState` is called to transform `rawState` to `state`.

### Todo Library Example

This example shows how you could implement a classic `Todo` library.

* `npm install @stated-library/base`

```js
// TodoLib.js
import StatedLibBase from '@stated-library/base';
import createTodo from './createTodo';

const INITIAL_STATE = {
  todos: [],
};

export default class TodoLib extends StatedLibBase {
  
  constructor(){
    super(INITIAL_STATE, {
      deriveState: rawState => ({
        todos: rawState.todos,
        activeTodos: rawState.todos.filter(todo => !todo.completed),
        completedTodos: rawState.todos.filter(todo => todo.completed),
      })
    }
    StatedLibBase.bindMethods(this);
  }
  
  addTodo(title) {
    this.updateState({
      todos: state.todos.concat([ createTodo(title) ])
    }, "ADD_TODO");
  }
  
  toggleTodo(id) {
    this.updateState({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }, "TOGGLE_TODO");
  } 

});
```

The `Todo` library is a regular javascript object with `addTodo` and `toggleTodo`.  The methods simply update `state`.

Its output `state` has shape `{todos: [], activeTodos: [], completedTodos: []}`, with `activeTodos` and `completedTodos` being _derived_.

## Testing a Stated Library
Since `Stated Libraries` are self-contained they can be tested easily.  Tests generally call object methods to initiate activity and then verify expected `state`.

```js
// TodoLib.test.js
import TodoLib from './TodoLib';

let todoLib;
beforeEach(() => todoLib = new TodoLib());

expect("Adds a todo", () => {
  todoLib.addTodo('my first todo');
  expect(todoLib.state.todos).toHaveLength(1);
  expect(todoLib.state.todos[0]).toEqual({
    id: todoLib.state.todos[0].id,
    title: 'my first todo',
    completed: false,
  });
  expect(todoLib.state.activeTodos).toHaveLength(1);
  expect(todoLib.state.completedTodos).toHaveLength(0);
});

expect("Toggles a todo", () => {
  todoLib.addTodo('my first todo');
  todoLib.toggleTodo(todoLib.state.todos[0].id);
  expect(todoLib.state.todos).toHaveLength(1);
  expect(todoLib.state.todos[0]).toEqual({
    id: todoLib.state.todos[0].id,
    title: 'my first todo',
    completed: true,
  });
  expect(todoLib.state.activeTodos).toHaveLength(0);
  expect(todoLib.state.completedTodos).toHaveLength(1);
});
 
```
The tests show how "derived" `state` is completely transparent.

### Async Functionality
`Stated Libraries` can perform async functionality _normally_.  No limitations.  This example adds an async `fetchTodos` method along with a corresponding `isFetching` property to `state`.

```js
export default class TodoLib extends StatedLibBase {
  // ...
  async fetchTodos() {
    this.updateState({isFetching: true}, "FETCH_TODOS_START");
    const newTodos = await fetchTodosFromCloud();
    this.updateState({
      todos: state.todos.concat(newTodos),
      isFetching: false,
    }, "FETCH_TODOS_COMPLETE");
  }
}
```
Async functinality can be tested normally:

```js
// TodoLib.test.js
// ...
expect("Fetches todos from cloud", async () => {
  const fecthPromise = todoLib.fetchTodos();
  expect(todoLib.state.isFetching).toBe(true);
  await fetchPromise;
  expect(todoLib.state.isFetching).toBe(false);
  expect(todoLib.state.todos).toHaveLength(2);
  expect(todoLib.state.todos[0]).toEqual({
    id: todoLib.state.todos[0].id,
    title: 'todo1-from-cloud',
    completed: false,
  });
  expect(todoLib.state.todos[1]).toEqual({
    id: todoLib.state.todos[1].id,
    title: 'todo2-from-cloud',
    completed: false,
  });
  expect(todoLib.state.completedTodos).toEqual([]);
});
```

### Memoization
[Memoization](https://en.wikipedia.org/wiki/Memoization) is a technique used to achieve performance gains.

This example uses [`reselect`](https://github.com/reduxjs/reselect), which is a memoization library commonly used with `Redux`, but you can use whatever memoization technique you want.

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

export default class TodoLib extends StatedLibBase {
  constructor(){
    super(INITIAL_STATE, {
      deriveState: rawState => ({
        isFetching: rawState.isFetching,
        todos: rawState.todos,
        get completedTodos() { // getter
          return getCompletedTodos(this);
        },
        get activeTodos() { // getter
          return getActiveTodos(this);
        },
      })
    })

    // ...
  }
});
```

Since memoization requires a function call, we also added a [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) so clients and tests can continue to use `todoLib.state.completedTodos`, not `todoLib.state.getCompletedTodos()`. 

This **memoization + getter** technique is **efficient**, too...the getter is lazy, so the calculation only occurs if used.

There are **no tricks**, we're just using **regular javascript functionality** to achieve it.

### Summary
The `Todo` library was implemented in a **single source file** and fully tested in a **single test file**.  It is completely **self-contained**, has **async functionality**, and **derived state**.

Achieving the same functionality with `Redux` would probably take a _lot_ longer. You'd typically have multiple source files, middleware, and store integration.  And full testing can be challenging since they aren't self-contained modules.

Note, the full [Todo library source](examples/todo-lib) is available in the [examples](examples) area of this repo.

# Using Stated Libraries
So far, we've covered how to create a `Stated Libraries`, now we'll look at how to use them.

## Multiple Stated Libraries
A typical application would use several `Stated Libraries` and would create global library instances together, e.g. in a `state.js` module.

```jsx
// state.js
import TodoLib from './TodoLib';
import VisibilityLib from './VisibilityLib';
const todoLib = new TodoLib();
const visLib = new VisibilityLib();

export {todoLib, visLib};
```

`state.js` is analogous to where a global `Redux` store sould be created, although the library instances are still independent, they are not tied together together like in a `Redux` store.

## Mapping State
The `mapState` function takes one or more observables as input and creates a new observable.

* `mapState(observableIn, transform) => observableOut`

`mapState` can combine `state$` from multiple libraries and/or reshape `state$`.

`mapState` implements the composability formula -- observable in, observable out -- so the output of `mapState` can be used as an input to another `mapState`, or anywhere else an observable is used, and so on...

The `transform` function is called every time `observableIn` emits a `state`.  The result is shallow-compared against the previous result, and, if different, the new result is emitted on `observableOut`.

`observableIn` can also be an array of observables, in which case the `transform` function receives an array of `state` and is called every time any of the input observables emits a `state`.

`mapState` achieves the same functionality as react-redux's `mapStateToProps` + `mapDispatch`, except that it is completely external to any application framework, and it is composable, whereas the react-redux functionality occurs inside the React binding (`connect`).  Implementing this functionality externally allows application logic to be completely platform-agnostic and allows it to be easily tested outside any application framework.

The next example shows how `state$` from two `Stated Libraries`, a `Todo` library and a `Visibility` library, could be combined to create `visibleTodos$`:

* `npm install @stated-library/core`

```jsx
// state.js
import { mapState } from '@stated-library/core';
import TodoLib from './TodoLib';
import VisibilityLib from './VisibilityLib';
const todoLib = new TodoLib();
const visLib = new VisibilityLib();

const todos$ = mapState(todoLib.state$, todoLibState => todos);

const visibleTodos$ = mapState(
  [todoLib.state$, visLib.state$],
  ([todoState, visState]) => {
    switch(visState.visibility) {
      case "completed":
        return todoState.completedTodos;
      case "active":
        return todoState.activeTodos;
      default:
        return todoState.todos;
    }
  } );

export {todoLib, visLib, todos$, visibleTodos$};
```

### Testing Mapped State

```ts
// state.test.js
import { getValue } from '@stated-library/core';

// import a clean state.js for each test
let state;
beforeEach(() => {
  jest.resetModules();
  state = require('./state');
})

test('visibleTodos$ contains todos filtered thru visibilityFilter', () => {
  const { todoLib, visLib, visibleTodos$ } = state;

  expect(visLib.state.visibility).toEqual("all")
  todoLib.addTodo("First");
  todoLib.addTodo("Second");

  expect(getValue(visibleTodos$)).toHaveLength(2);

  visLib.setVisibility("completed");
  expect(getValue(visibleTodos$)).toHaveLength(0);

  todoLib.toggle(todoLib.state.todos[0].id);
  expect(getValue(visibleTodos$)).toHaveLength(1);

});
```

`getValue` is a utility function that can be used to retrieve the latest value from an observable.

### Redux-like Global Store
`mapState` can combine `state$` from all libraries to create the  equivalent of a `Redux` global store:

```js
// state.js
// ...
const state$ = mapState(
  [todoLib.state$, visLib.state$],
  ([todoState, visState]) => ({ todoState, visState })
);

const getTodos = state => ({todoState}) => todoState.todos;

const getVisibleTodos = state => ({todoState, visState}) => {
    switch(visState.visibility) {
      case "completed":
        return todoState.completedTodos;
      case "active":
        return todoState.activeTodos;
      default:
        return todoState.todos;
    }
  } );

const todos$ = mapState(state$, getTodos);

const visibleTodos$ = mapState(state$, getVisibleTodos);

export { todoLib, visLib, state$, visibleTodos$, todos$, getTodos, getVisibleTodos };
```

Notice that `state.js` still exports `visibleTodos$`, so the same tests from above can be used.

There is some potential benefit to creating a single combined `state$` like this...

If two streams from the same original source are combined later, multiple updates can occur downstream.  For example, if `visibleTodos$` and `todos$` are combined, the combined stream would update twice each time `todoLib.state$` updates, once for the `visibleTodos$` update and once for the `todos$` update.

A single combined `state$` could potentially bypass that issue by only exporting the combined `state$` and accessor/selector functions (`getVisibleTodos`, not `visibleTodos$`).  That is essentially how `Redux` works.  But, that causes a different issue because all consumers get an update any time anything in the store changes.

### Summary
Perhaps some best practices will evolve, but for now, there's not a clearly better choice to combine all libraries state or not ... either way works great!  `Stated Libraries` offers some flexibility here, and hopefully that's a good thing.  

## React

You don't need to do anything extra to make `Stated Libraries` compatible with `React`.  The `React` bindings for `Stated Libraries` simply **inject observables** into `React` components.

### `connect`
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

### Functional Components: `use`
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
### Stateful Components: `link`
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

## Library-to-Library Interactions
Since libraries are modular entities, we often want to tie them together somehow -- basically an integration layer or a business logic layer.  For example, maybe when something happens in Library A, you want to do something with Library B.

### Generic Interactions
The generic way to achieve library-to-library interaction is to monitor a library's `state$` or `stateEvent$` and do something when a certain state or event is encountered.

_In some cases it might be preferrable to implement library-specific methods instead, but this is the generic way._

```js
// state.js
import AuthLib from './AuthLib';
import TodoLib from './TodoLib';

const todoLib = new TodoLib();
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
import TodoLib from './TodoLib';

const todoLib = new TodoLib();
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


# Tooling
The `Stated Library Interface` enables generic tooling.

Tools can subscribe to a library's `state$` or `stateEvent$` and set the library's `state` using `resetState`.

That is all the functionality that is needed for a lot of external tooling like DevTools, state hydrators (local or SSR), analytics, etc.

## Redux DevTools

Any `Stated Library` can be connected to the [Redux DevTools extension](https://github.com/zalmoxisus/redux-devtools-extension) to enable **time-travel debugging**.

The DevTools extension allows you to view the `state` history of all connected `Stated Libraries` and reset `state` to any point in history, or play back the `state` history.  Note, that this supports playback of `state`, not playback of `actions`.

```js
// state.js
import { devTools } from '@stated-library/core';
import TodoLib from './TodoLib';
import VisibilityLib from './VisibilityLib';

const todoLib = new TodoLib();
devTools.connect(todoLib, 'todoLib');

const visLib = new VisibilityLib();
devTools.connect(visLib, 'visLib');
```
Note that the standard time-travel debugging caveat for side-effects applies.  Whenever there are side effects involved, resetting to a particular `state` is not exactly equivalent to the original `state` because it does not undo side effects.  That includes server interactions, etc.  There's no support for undoing side effects.  

## Hydrate from Local Storage
A `Stated Library`'s state can be saved to local storage and then hydrated on start up using the `locStorage` tool.

```js
// state.js
import { locStorage } from '@stated-library/core';
import TodoLib from './TodoLib';
import VisibilityLib from './VisibilityLib';

const todoLib = new TodoLib();
devTools.connect(todoLib, 'todoLib');
locStorage.connect(todoLib, '**todolib-state**');

const visLib = new VisibilityLib();
devTools.connect(visLib, 'visLib');
```

## SSR
Todo

# Full Example Todo App
The [TodoApp example](examples/todoapp) is a standard Todo-MVC app that deomonstrates all of the functionality of `Stated Libraries`, including DevTools debugging and Local State Hyrdation.

The example also demonstrates how easy it is to share `Stated Libraries` ... the Todo library used by the app is an independent package, [examples/todo-lib](examples/todo-lib).

You can try it out the full example in CodeSandbox:

[![Edit @stated-library/todoapp](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/bradfordlemley/stated-library/tree/master/examples/todoapp?fontsize=14)

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

# Ode to Redux
In case it's not obvious...basically everything in `Stated Libraries` is informed by, borrowed from, or outright stolen from `Redux`.  Thanks Dan Abramov and `Redux`...:heart: :heart: :heart:.

# Packages
`Stated Libraries` consists of several packages:

| Package        | Contains           |
| ------------- |:-------------:|
| `@stated-library/interface` | Stated Library Interface definition (typescript) |
| `@stated-library/core`      | `mapState`, `devTools`, `locStore`, `observable` |
| `@stated-library/base`      | Base class for creating a `Stated Library`       |
| `@stated-library/react`     | React bindings: `connect`, `use`, `link`         |
