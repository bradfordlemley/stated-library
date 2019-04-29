import React from "react";
import { todoLib } from "./state";

import { ENTER_KEY } from "./keycodes";

/*

*/
export default class AddTodo extends React.Component {
  handleKeyDown = event => {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }
    event.preventDefault();
    const val = event.target.value.trim();
    if (val) {
      todoLib.addTodo(val);
      event.target.value = "";
    }
  };

  render() {
    return (
      <input
        className="new-todo"
        placeholder="What needs to be done?"
        autoFocus
        onKeyDown={this.handleKeyDown}
      />
    );
  }
}
