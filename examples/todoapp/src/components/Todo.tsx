import React from "react";
import classNames from "classnames";

import { actions } from "../state";
import { Todo as TodoType } from '../state/TodoLib';
import { ENTER_KEY, ESCAPE_KEY } from "../keycodes";

declare type Props = {
  todo: TodoType,
}

const Todo: React.FC<Props> = ( { todo: { id, text, completed } }) => {

  const [editing, setEditing] = React.useState(false);
  const [editText, setEditText] = React.useState();
  const textInput = React.useRef<HTMLInputElement>();

  function handleTextDoubleClick () {
    setEditing(true);
    setTimeout(() => {
      const textNode = textInput.current;
      textNode && textNode.focus();
      textNode && textNode.setSelectionRange(
        textNode.value.length,
        textNode.value.length
      );
    })
  };

  function commitChange () {
    if (editText != null) {
      const val = editText && editText.trim();
      if (val) {
        if (val !== text) {
          actions.updateTodo(id, {text: val});
        }
      } else {
        actions.destroyTodo(id);
      }
    }
    setEditing(false);
    setEditText(undefined);
  };

  function handleBlur () {
    commitChange();
  };

  function handleKeyDown (event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.which === ESCAPE_KEY) {
      setEditing(false);
      setEditText(undefined);
    } else if (event.which === ENTER_KEY) {
      commitChange();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(event && event.target && event.target.value)
  }
  return (
    <li className={classNames({ completed, editing })}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={completed}
          onChange={() => actions.toggleTodo(id)}
        />
        <label onDoubleClick={handleTextDoubleClick}>{text}</label>
        <button className="destroy" onClick={() => actions.destroyTodo(id)}/>
      </div>
      <input key={id}
        // @ts-ignore
        ref={textInput}
        className="edit"
        value={editText || text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </li>
  );
}

export default Todo;