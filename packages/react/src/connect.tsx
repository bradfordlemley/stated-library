import * as React from 'react';
import { Observable } from '@stated-library/interface';
import linkObservable from './link';
import getDisplayName from './getDisplayName';

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type GetProps<C> = C extends React.ComponentType<infer P> ? P : never;
export type Matching<InjectedProps, DecorationTargetProps> = {
  [P in keyof DecorationTargetProps]: P extends keyof InjectedProps
    ? InjectedProps[P] extends DecorationTargetProps[P]
      ? DecorationTargetProps[P]
      : InjectedProps[P]
    : DecorationTargetProps[P]
};

function connect<InjectProps>(value$: Observable<InjectProps>) {
  return function<
    C extends React.ComponentType<Matching<InjectProps, GetProps<C>>>
  >(WrappedComp: C) {
    return class WrapperComp extends React.Component<
      JSX.LibraryManagedAttributes<C, Omit<GetProps<C>, keyof InjectProps>>
    > {
      link;
      state: InjectProps;

      static displayName = `connect-sl(${getDisplayName(WrappedComp)})`;

      constructor(props) {
        super(props);
        this.link = linkObservable(this, value$);
      }
      componentDidMount() {
        this.link.connect();
      }
      componentWillUnmount() {
        this.link.disconnect();
      }
      render() {
        // @ts-ignore
        return <WrappedComp {...this.props} {...this.state} />;
      }
    };
  };
}

export default connect;

export { connect };
