import throttle from 'lodash/throttle';
import createMulti from './multiConnect';

function getStateFromLocalStorage(name) {
  try {
    const data = localStorage.getItem(name);
    return data ? JSON.parse(data) : undefined;
  } catch {
    return undefined;
  }
}

const THROTTLE_INTERVAL = 300;

export function createLocalStorageConnector() {
  const writeFns = {};
  const multi = createMulti({
    onConnectLib: function onConnectLib(key, lib, sub) {
      const initial = getStateFromLocalStorage(key);
      if (initial != null) {
        lib.resetState(initial, 'RESET_FROM_LOCAL_STATE');
      }
      const writeState = state => {
        localStorage.setItem(key, JSON.stringify(state));
      };
      writeFns[key] = throttle(writeState, 300, {
        leading: true,
        trailing: true,
      });
      return {
        ...sub,
        clear: () => localStorage.removeItem(key),
      };
    },
    onState: function onState(state, key) {
      writeFns[key](state);
    },
  });

  return {
    ...multi,
    clear: function clear() {
      Object.keys(this.connectedLibs).map(key => {
        localStorage.removeItem(key);
      });
    },
  };
}

const locStorage = createLocalStorageConnector();
export default locStorage;

export { locStorage };
