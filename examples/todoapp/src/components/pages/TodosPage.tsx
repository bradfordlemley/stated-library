import * as React from 'react';

import { VISIBILITIES, state$, actions } from '../../state';
import AddTodo from '../AddTodo';
import Todo from '../Todo';
import { use } from '@stated-library/react';
import { mapState } from  '@stated-library/core';

export default function TodoPage() {

  const {completedTodos, activeTodos, todos, visibility, visibleTodos} = use(() => mapState(
    state$,
    ({completedTodos, activeTodos, todos, visibility, visibleTodos}) => ({
      completedTodos, activeTodos, todos, visibility, visibleTodos
    })
  ));

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
            onChange={event => actions.toggleAll(event.currentTarget.checked)}
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
                {VISIBILITIES.map(key => (
                  <li key={key}>
                    <a
                      className={visibility === key ? "selected" : ""}
                      onClick={() => actions.setVisibility(key)}
                    >
                      {key}
                    </a>
                  </li>
                ))}
              </ul>
              {/* <!-- Hidden if no completed items are left ↓ --> */}
              {completedTodos.length > 0 &&
                <button className="clear-completed" onClick={() => actions.clearCompleted()}>Clear completed</button>
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
