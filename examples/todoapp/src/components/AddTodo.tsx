import React from "react";
import { actions } from "../state";
import { ENTER_KEY } from "../keycodes";

function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.keyCode !== ENTER_KEY) {
    return;
  }
  event.preventDefault();
  const val = event.currentTarget.value.trim();
  if (val) {
    actions.addTodo(val);
    event.currentTarget.value = "";
  }
};

function AddTodo() {
  return (
    <input
      className="new-todo"
      placeholder="What needs to be done?"
      autoFocus
      onKeyDown={handleKeyDown}
    />
  );
}

export default AddTodo;
