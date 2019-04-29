import { Component } from "react";
import * as React from 'react';
import "todomvc-common/base.css";
import "todomvc-app-css/index.css";
import "./nav.css";
import { VISIBILITIES, filterLib, todoLib, navLib, page$, visibleTodos$, visibility$, Page } from "./state";
import AddTodo from "./AddTodo";
import Todo from "./Todo";
import { use, connect } from '@stated-library/react';
import { mapState } from  '@stated-library/core';

// const { getActiveTodos, getCompletedTodos, getTodos } = todolib.selectors;

// const DynamicImport = React.lazy(() => import("./DynamicImport"));

// const HookTest = props => {
//   const [count, setCount] = React.useState(0);

//   const todostate = useTodoLib(React.useState)
//   return (
//     <div>
//       <div>{count}</div>
//       <button onClick={() => setCount(count + 1)}>+</button>
//     </div>
//   );
// };

// const TodoList = () => {
//   const todostate = useTodoLib();
//   return todostate.todos.map(todo => <div>{JSON.stringify(todo)}</div>);
// };

// const App = props =>
//   <HookTest />

const TodoPage = () => {
  console.log(`Rendering TodoPage2`);

  const visibleTodos = use(visibleTodos$);
  const visibility = use(visibility$);

  const {completedTodos, activeTodos, todos} = use(todoLib.state$);

  // const {todos, visibilityFilter, visibleTodos, completedTodos, activeTodos} = todolibstate;

  return (
    <>
      <h1>todos</h1>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <AddTodo />
        </header>
        {/* <!-- This section should be hidden by default and shown when there are todos --> */}
        <section className="main">
          <input id="toggle-all" className="toggle-all" type="checkbox"
            onChange={event => todoLib.toggleAll(event.target.checked)}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {
              visibleTodos.map(
                todo => <Todo todo={todo} key={todo.id} />
              )
            }
          </ul>
        </section>
        {/* <!-- This footer should hidden by default and shown when there are todos --> */}
        {todos.length > 0 && (
            <footer className="footer">
              {/* <!-- This should be `0 items left` by default --> */}
              <span className="todo-count">
                <strong>{activeTodos.length}</strong> items left
              </span>
              {/* <!-- Remove this if you don't implement routing --> */}
              <ul className="filters">
                {Object.keys(VISIBILITIES).map(key => (
                  <li key={key}>
                    <a
                      className={visibility === key ? "selected" : ""}
                      onClick={() => filterLib.setVisibility(key as typeof visibility)}
                    >
                      {key}
                    </a>
                  </li>
                ))}
              </ul>
              {/* <!-- Hidden if no completed items are left ↓ --> */}
              {completedTodos.length > 0 &&
                <button className="clear-completed" onClick={() => todoLib.clearCompleted()}>Clear completed</button>
              }
            </footer>
          )
        }
      </section>
      <footer className="info">
        <p>Double-click to edit a todo</p>
        {/* <!-- Remove the below line ↓ --> */}
        <p>
          Template by <a href="http://sindresorhus.com">Sindre Sorhus</a>
        </p>
        {/* <!-- Change this out with your name and url ↓ --> */}
        <p>
          Created by <a href="https://github.com/bradfordlemley">Bradford Lemley</a>
        </p>
        <p>
          Part of <a href="http://todomvc.com">TodoMVC</a>
        </p>
      </footer>
    </>
  );
};

const Nav = () => {
  const page = use(page$);
  return (
    <div className="nav">
      <ul>
        {["todos", "acct"].map(val => (
          <li key={val}>
            <a
              className={page === val ? "selected" : ""}
              onClick={() => navLib.setPage(val as Page)}
            >
              {val}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const AccountPage = () => {
  return <div>Account</div>
}

const App = ({page} : ({page: Page}))  => {
  // const page = use(page$);
  let Page;
  switch (page) {
    case "acct":
      Page = AccountPage;
      break;
    default:
      Page = TodoPage;
  };

  return <>
    <Nav/>
    <Page/>
  </>
}

const appData$ = mapState(page$, page => ({page}));

export default connect(appData$)(App);
