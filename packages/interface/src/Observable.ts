export type ValueHandler<T> = (value: T) => void;

export interface ObserverObj<T> {
  next: ValueHandler<T>;
}

export type Observer<T> = ValueHandler<T> | ObserverObj<T>;

export interface Subscription {
  unsubscribe(): void;
}

export interface Observable<T> {
  subscribe: (observer: Observer<T>) => Subscription;
  value: T;
}
