import { StatedLibrary } from '@stated-library/interface';
import createMultiConnector from './multiConnect';

const DEVTOOLS_SET_EVENT = '**__DEVTOOLS__**';

export function createDevToolsConnector() {
  let devTools;
  let combinedState = {};
  let multi;

  // https://extension.remotedev.io/docs/API/Methods.html
  // @ts-ignore
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    // @ts-ignore
    devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
      name: 'StatedLibraries',
    });
    devTools.subscribe(message => {
      if (message.type === 'DISPATCH' && message.state) {
        console.log('DevTools requested to change the state to', message.state);
        const libStates = JSON.parse(message.state);
        Object.keys(libStates).forEach(lib =>
          multi.connectedLibs[lib].resetState(
            libStates[lib],
            DEVTOOLS_SET_EVENT
          )
        );
      }
    });
    devTools.init(combinedState);
  }

  multi = createMultiConnector({
    onStateEvent: function onStateEvent(stateEvent, key) {
      const { rawState, event } = stateEvent;
      combinedState[key] = rawState;
      if (event === DEVTOOLS_SET_EVENT) {
        return;
      }
      devTools && devTools.send(`${key}::${event}`, combinedState);
    },
  });

  return multi;
}

const devTools = createDevToolsConnector();

export default devTools;

export { devTools };
