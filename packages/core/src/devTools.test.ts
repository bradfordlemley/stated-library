import dt from './devTools';
import { createCounterLib } from '../test/createLib';

function createDevToolsExt() {
  return {
    connections: {},
    connect: function({ name }) {
      this.connections[name] = {
        subs: [],
        subscribe: function subscribe(cb) {
          this.subs.push(cb);
        },
        init: jest.fn(),
        sendMsg: function sendMsg(msg) {
          this.subs.map(sub => sub(msg));
        },
        send: jest.fn(),
      };
      return this.connections[name];
    },
  };
}

let dtExt;
let devTools: typeof dt;
beforeEach(() => {
  jest.resetModules();
  dtExt = createDevToolsExt();
  // @ts-ignore
  window.__REDUX_DEVTOOLS_EXTENSION__ = dtExt;
  devTools = require('./devTools').default;
});
afterEach(() => {
  devTools.disconnect();
});

test('sends state to extension', () => {
  const counterLib = createCounterLib();
  devTools.connect(counterLib, 'counter');
  expect(dtExt.connections.StatedLibraries.send).toHaveBeenCalledTimes(1);
  expect(dtExt.connections.StatedLibraries.send).toHaveBeenCalledWith(
    'counter::INIT',
    {
      counter: {
        counter: 0,
      },
    }
  );
  counterLib.increment();
  expect(dtExt.connections.StatedLibraries.send).toHaveBeenCalledTimes(2);
  expect(dtExt.connections.StatedLibraries.send).toHaveBeenCalledWith(
    'counter::INCREMENT',
    {
      counter: {
        counter: 1,
      },
    }
  );
});

test('resets state', () => {
  const counterLib = createCounterLib();
  devTools.connect(counterLib, 'counter');
  counterLib.increment();
  dtExt.connections.StatedLibraries.sendMsg({
    type: 'DISPATCH',
    state: JSON.stringify({
      counter: {
        counter: 4321,
      },
    }),
  });
  expect(counterLib.state).toEqual({ counter: 4321 });
});

test(`Ignores unknown messages`, () => {
  const counterLib = createCounterLib();
  devTools.connect(counterLib, 'counter');
  counterLib.increment();
  dtExt.connections.StatedLibraries.sendMsg({
    type: 'UNHANDLED',
    state: JSON.stringify({
      counter: {
        counter: 4321,
      },
    }),
  });
  expect(counterLib.state).toEqual({ counter: 1 });
});

test(`doesn't crash without devtools extension`, () => {
  // @ts-ignore
  window.__REDUX_DEVTOOLS_EXTENSION__ = undefined;
  jest.resetModules();
  devTools = require('./devTools').default;

  const counterLib = createCounterLib();
  devTools.connect(counterLib, 'counter');
  counterLib.increment();
});
