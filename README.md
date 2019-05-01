# Stated Libraries
**Simple, Clean, Powerful Unidirectional Data Flow ... everywhere.**

[![License][license-badge]][license] [![Build Status][build-badge]][build] [![Code Coverage][coverage-badge]][coverage]

[build]: https://dev.azure.com/bradfordlemley/stated-library/_build/latest?definitionId=1&branchName=master

[build-badge]: https://img.shields.io/azure-devops/build/bradfordlemley/stated-library/1/master.svg

[coverage]: https://codecov.io/github/bradfordlemley/stated-library/branch/master

[coverage-badge]: https://img.shields.io/codecov/c/gh/bradfordlemley/stated-library/master.svg

[coverage-badge-az]: https://img.shields.io/azure-devops/coverage/bradfordlemley/stated-library/1/master.svg

[license-badge]: https://img.shields.io/github/license/bradfordlemley/stated-library.svg

[license]: https://github.com/bradfordlemley/stated-library/blob/master/LICENSE

**`Stated Libraries`** are essentially an alternative to `Redux` or `Mobx`, but they can be used any where there is `state`.

<details>
<summary><span style="font-weight: regular">Table of Contents</span></summary>

* [Introduction](#Introduction)
* [Interface](#Stated_Library_Interface)
* [Creating a Stated Library](#Creating_a_Stated_Library)
  * [Stated Library Base Class](#Stated_Library_Base_class)
  * [Testing a Stated Library](#Testing_a_Stated_Library)
  * [Async Functionality](#Async_Functionality)
  * [Memoization](#Memoization)
  * [Summary](#Summary)
* [Using Stated Libraries](#Using_Stated_Libraries)
  * [Multiple Stated Libraries](#Multiple_Stated_Libraries)
  * [Mapping State](#Mapping_State)
    * [Testing Mapped State](#Testing_Mapped_State)
  * [React](#React)
    * [HOC](#HOC)
    * [Direct Injection](#Direct_Injection)
  * [Library-to-Library Interactions](#Library-to-Library_Interactions)
    * [Generic Interactions](#Generic_Interactions)
    * [Interactions with Reactive Programming](#Interactions_with_Reactive_Programming)
    * [Internal Reactive Programming](#Internal_Reactive_Programming)
* [Tooling](#Tooling)
  * [Time-travel Debugging](#Time-travel_Debugging)
  * [Hydrate from Local Storage](#Hydrate_from_Local_Storage)
  * [SSR](#SSR)
* [Full Example Todo App](#Full_Example_Todo_App)
* [Stated Libraries for Local State](#Stated_Libraries_for_Local_State)
* [Stated Libraries for any state](#Stated_Libraries_for_any_state)
* [Ode to Redux](#Ode_to_Redux)
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
A typical application would use several `Stated Libraries`.  A typical application would create global library instances together, e.g. in a `state.js` module.

```jsx
// state.js
import TodoLib from './TodoLib';
import VisibilityLib from './VisibilityLib';
const todoLib = new TodoLib();
const visLib = new VisibilityLib();

export {todoLib, visLib};
```

`state.js` is analogous to where you'd create a global `Redux` store, but it is **not a global store** -- the library instances are still independent, self-contained objects.

This is an important difference from `Redux` because it offers a more modular architecture and _better change isolation_.  With `Redux`, _every_ time _anything_ in the store is updated, _all_ store consumers need to handle the change, which can result in performance issues, especially for high-frequency changes.

## Mapping State
The `mapState` function takes one or more observables as input and creates a new observable.

* `mapState(observableIn, transform) => observableOut`

The `transform` function is called every time the `observableIn` emits a `state` and the result is emitted by `observableOut`.  (Actually, before the result is emitted, it is first shallowly compared vs. the previous result and it is only emitted if changed.)

If `observableIn` is an array of observables, `mapState` calls the `transform` function every time any of the input observables change.  In this case, the `transform` function takes an array of the current `state` of all the input observables.

`mapState` can be used to combine `state$` from mulitple libraries, or transform `state$` into another shape, or both.

And, the output of `mapState` can be used as the input to another `mapState`.

So, `mapState` is the function that implements the **special composability sauce**.

The next example shows how `state$` from a `Todo` library and `Visibility` library could be combined to create `visibleTodos$`:

```jsx
// state.js
import { mapState } from '@stated-library/core';
import TodoLib from './TodoLib';
import VisibilityLib from './VisibilityLib';
const todoLib = new TodoLib();
const visLib = new VisibilityLib();

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

export {todoLib, visLib, visibleTodos$};
```
Notice that `state.js` is still independent of any application framework -- which is great because it means that this application logic that can be used with any application framework and can be tested outside of any framework.

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
You can actually create the equivalent of a `Redux` global store by combining all library `state$`'s into a single `state$`:

```js
// state.js
// ...
const state$ = mapState(
  [todoLib.state$, visLib.state$],
  ([todoState, visState]) => ({ todoState, visState })
);
```
...but, it's not clear that would be a good idea.

## React

You don't need to do anything extra to make `Stated Libraries` compatible with `React`.

The **generic** `React` bindings for `Stated Libraries` are very simple -- they **inject observables** into `React`.  (In fact, the `React` bindings aren't really even specific for `Stated Libraries` -- they can be used for **any** observable.)

The `React` bindings come in two different flavors: HOC or direct inject.

### HOC
The **`connect`** binding is similar to `Redux`'s `connect`, creating an HOC "container" component.

`Stated Libraries` `connect` doesn't take `mapStateToProps`, etc., because all of the mapping is done externally to the component using `mapState`.

Here's how you could use `connect` in a application (using the `state.js` module from above):

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

Also, notice that we added `addTodo` directly from the `todoLib`.  We can do that because it was already bound using `bindMethods`, and we know it doesn't change.  It is possible to put these methods on the `state$` using derived state and that might be the recommended approach.  (TBD: add more discussion on this topic.)

### Direct Injection

#### Functional Components
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
#### Stateful Components
**`link`** is the direct injection mechanism for stateful (class) components.  It spreads the observable's value onto the component's `state` by calling the component's `setState` method whenever the observable emits a new value.  `link` follows the standard life-cycle [subscription mechanism](https://reactjs.org/docs/react-component.html#componentdidmount).

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
Since libraries are modular entities, we often want to tie them together somehow.  For example, maybe when something happens in Library A, you want to do something with Library B.

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


# Stated Libraries for any state
`Stated Libraries` were developed as a solution to State Management for applications, but they are a general solution for anything that manages `state`.

If you have a library with pieces of `state` scattered throughout various object properties, e.g. `this.isFetching`, and it needs to notify clients when these properties change, consider combining them into a single immutable managed `state` property and converting it into a `Stated Library`.

Managing `state` using a `Stated Library` is a way to organize `state` within the library, and also provides some cool features for free, like time-travel debugging.

# Ode to Redux
Basically everything in `Stated Libraries` is informed by, borrowed from, or outright stolen from `Redux`.  Thanks Dan Abramov and `Redux`...:heart: :heart: :heart:.