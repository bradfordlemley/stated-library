import React from "react";
import classNames from "classnames";

import { actions } from "../state";
import { Todo as TodoType } from '../state/TodoLib';
import { ENTER_KEY, ESCAPE_KEY } from "../keycodes";

declare type Props = {
  todo: TodoType,
}

declare interface State {
  editing: boolean,
  editText?: string,
}

export default class Todo extends React.Component<Props, State> {
  constructor( props: Props ) {
    super(props);
    this.state = {
      editing: false,
      editText: undefined,
    };
  }
  textInput = React.createRef<HTMLInputElement>();

  handleTextDoubleClick = () => {
    this.setState({
      editing: true,
    });
    setTimeout(() => {
      const textNode = this.textInput.current;
      textNode && textNode.focus();
      textNode && textNode.setSelectionRange(
        textNode.value.length,
        textNode.value.length
      );
    })
  };

  commitChange = () => {
    const { id, text } = this.props.todo;
    const { editText } = this.state;
    if (editText !== null) {
      const val = editText && editText.trim();
      if (val) {
        if (val !== text) {
          actions.updateTodo(id, {text: val});
        }
      } else {
        actions.destroyTodo(id);
      }
    }
    this.setState({ editing: false, editText: undefined });
  };

  handleBlur = () => {
    this.commitChange();
  };

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.which === ESCAPE_KEY) {
      this.setState({ editing: false, editText: undefined });
    } else if (event.which === ENTER_KEY) {
      this.commitChange();
    }
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ editText: event && event.target && event.target.value });

  render() {
    const { id, text, completed } = this.props.todo;
    const { editing, editText } = this.state;
    return (
      <li className={classNames({ completed, editing })}>
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={completed}
            onChange={() => actions.toggleTodo(id)}
          />
          <label onDoubleClick={this.handleTextDoubleClick}>{text}</label>
          <button className="destroy" onClick={() => actions.destroyTodo(id)}/>
        </div>
        <input key={id}
          ref={this.textInput}
          className="edit"
          value={editText || text}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onFocus={() => console.error('got foucs')}
          onKeyDown={this.handleKeyDown}
        />
      </li>
    );
  }
}
