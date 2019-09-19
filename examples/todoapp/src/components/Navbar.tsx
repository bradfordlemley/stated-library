
import React from 'react';
import { use } from '@stated-library/react';
import { mapState } from '@stated-library/core';
import { state$, actions } from '../state';

export default function Nav () {
  const page = use(() => mapState(
    state$,
    ({ page }) => page
  ));
  return (
    <div className="nav">
      <ul>
        {["todos", "acct"].map(val => (
          <li key={val}>
            <a
              className={page === val ? "selected" : ""}
              onClick={() => actions.setPage(val)}
            >
              {val}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
