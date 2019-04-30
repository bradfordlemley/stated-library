type ValueHandler<T> = (value: T) => void;
type ValueHandlerObj<T> = {
  next: ValueHandler<T>;
};
type Observer<T> = ValueHandler<T> | ValueHandlerObj<T>;

/* getValue: when an observable is fed by other observables, it might 
   unsubscribe from those observables if it doesn't have any subscriptions
   itself.  in that case, it won't be updationg "value", so value could be
   invalid if there are no subscriptions.  getValue supports this case by
   allowing the observable to temporarily subscribe to the feeding observables
   in order to get the proper value.
*/

type Opts<Value> = {
  onSubscribe?: () => void;
  onUnsubscribe?: () => void;
  getValue?: () => Value;
};

export default function createObservable<Value>(
  initialValue: Value,
  opts?: Opts<Value>
) {
  let observers: Array<ValueHandlerObj<Value>> = [];
  let value: Value = initialValue;
  const { onSubscribe, onUnsubscribe, getValue } = Object.assign({}, opts);
  return {
    get value() {
      return getValue ? getValue() : value;
    },
    subscribe(observer: Observer<Value>) {
      if (observers.length === 0 && onSubscribe) {
        onSubscribe();
      }
      if (typeof observer === 'function') {
        observer = {
          next: observer,
        };
      }
      observers.push(observer);
      // behave like a BehaviorSubject and emit the current value
      // upon subscription
      // most reactive operations will need this behavior, although it
      // is maybe not great for React, because it invokes handler with the
      // same value that things were probably initialized with, but that
      // probably doesn't really effect anything much.
      observer.next(this.value);
      return {
        unsubscribe: () => {
          observers = observers.filter(l => l !== observer);
          if (observers.length === 0 && onUnsubscribe) {
            onUnsubscribe();
          }
        },
      };
    },
    next(nextValue) {
      value = nextValue;
      observers.map(obs => obs.next(value));
    },
    [(Symbol && Symbol.observable) || '@@observable']() {
      return this;
    },
  };
}

export { createObservable };
