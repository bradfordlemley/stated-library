import * as React from 'react';
import { use } from '@stated-library/react';
import { mapState } from '@stated-library/core';
import { state$ } from '../state';

import Navbar from './Navbar';
import TodoPage from './pages/TodosPage';
import AcctPage from './pages/AcctPage';

const App = ()  => {
  const page = use(() => mapState(
    state$,
    ({page}) => page
  ));
  let Page;
  switch (page) {
    case "acct":
      Page = AcctPage;
      break;
    default:
      Page = TodoPage;
  };
  return (
    <>
      <Navbar />
      <Page />
    </>
  );
}

export default App;
