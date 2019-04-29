import { StatedLibrary } from '@stated-library/interface';

export function createMultiConnector(opts: {
  onState?;
  onStateEvent?;
  onConnectLib?;
  onDisconnectLib?;
}) {
  const { onState, onStateEvent, onConnectLib, onDisconnectLib } = opts;
  const stateSubs = {};
  const stateEventSubs = {};

  return {
    connectedLibs: {},
    connect: function connect<State>(lib: StatedLibrary<State>, key: string) {
      if (this.connectedLibs[key]) {
        throw new Error(`A library is already connected with key: ${key}`);
      }

      const partialSub = {
        disconnect: () => {
          onDisconnectLib && onDisconnectLib(key, lib);
          delete this.connectedLibs[key];
          stateSubs[key].unsubscribe();
          delete stateSubs[key];
        },
      };

      const sub = onConnectLib
        ? onConnectLib(key, lib, partialSub)
        : partialSub;

      if (onState) {
        stateSubs[key] = lib.state$.subscribe(state =>
          onState(state, key, lib)
        );
      }
      if (onStateEvent) {
        stateEventSubs[key] = lib.stateEvent$.subscribe(stateEvent =>
          onStateEvent(stateEvent, key, lib)
        );
      }
      this.connectedLibs[key] = lib;

      return sub;
    },
    disconnect: function disconnect() {
      Object.keys(this.connectedLibs).map(key => {
        if (stateSubs[key]) {
          stateSubs[key].unsubscribe();
          delete stateSubs[key];
        }
        if (stateEventSubs[key]) {
          stateEventSubs[key].unsubscribe();
          delete stateEventSubs[key];
        }
        delete this.connectedLibs[key];
      });
    },
  };
}

export default createMultiConnector;
