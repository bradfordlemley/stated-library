import * as React from 'react';
import { Observable } from '@stated-library/interface';
import linkObservable from './link';
import getDisplayName from './getDisplayName';
import { use, useValue$ } from '.'

import {
  Component,
  ComponentClass,
  ComponentType,
  StatelessComponent
} from 'react';

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type OmitCommon<T, K> = Pick<T, Exclude<keyof T, keyof K>>;
export type GetProps<C> = C extends React.ComponentType<infer P> ? P : never;

// gets prop types of target
export type Matching<InjectedProps, DecorationTargetProps> = {
  [P in keyof DecorationTargetProps]: // for each targetProp
    P extends keyof InjectedProps     // is injectedProp?
      ? InjectedProps[P] extends DecorationTargetProps[P] // injectedProp type extends targetProp type
        ? DecorationTargetProps[P] // use target prop type
        : InjectedProps[P]         // use injection prop type
      : DecorationTargetProps[P]   // use target prop type
};

export type Shared<InjectedProps, DecorationTargetProps> = {
  [P in Extract<keyof InjectedProps, keyof DecorationTargetProps>]?: InjectedProps[P] extends DecorationTargetProps[P] ? DecorationTargetProps[P] : never;
};

export type InferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> =
  <P extends TInjectedProps>(Component: React.ComponentType<P>) =>
    React.ComponentType<OmitCommon<P, TInjectedProps> & TNeedsProps>;

// type ObsOrCreate<V, OwnProps> = Observable<V> | ((props$?: Observable<OwnProps>) => Observable<V>);

type ObsOrCreate<V, OwnProps> = (props$: Observable<OwnProps>) => Observable<V>;

function connect<InjectProps, OwnProps>(obsOrCreateObs: ObsOrCreate<InjectProps, OwnProps>)
: InferableComponentEnhancerWithProps<InjectProps, OwnProps>  {
  return function(TargetComp)
  {
    const hoc = (hocProps) => {
      const hocProps$ = useValue$(hocProps);
      const injectProps = use(
        () =>
          typeof obsOrCreateObs === 'function'
            ? obsOrCreateObs(hocProps$)
            : obsOrCreateObs
      );
      return <TargetComp {...hocProps} {...injectProps} />;
    };
    hoc.displayName = `connect-sl(${getDisplayName(TargetComp)})`;
    return hoc;
  };
};

// -- works except for HocOnly
// function connect<OwnProps, InjectProps={}>(obsOrCreateObs: ObsOrCreate<InjectProps, OwnProps>)
// : InferableComponentEnhancerWithProps<InjectProps, OwnProps>  {
//   return function<C extends React.ComponentType<Matching<InjectProps, GetProps<C>>>>(TargetComp: C)
//   {
//     const hoc: ConnectedComponentClass<C, Omit<GetProps<C>, keyof Shared<InjectProps, GetProps<C>>> & OwnProps> = (hocProps) => {
//     // const hoc = (hocProps) => {
//       const hocProps$ = useValue$(hocProps);
//       const injectProps: InjectProps = use(
//         () =>
//           typeof obsOrCreateObs === 'function'
//             ? obsOrCreateObs(hocProps$)
//             : obsOrCreateObs
//       );
//       // const passThruProps: Omit<GetProps<C>, keyof InjectProps> = hocProps;
//       // @ts-ignore
//       return <TargetComp {...hocProps} {...injectProps} />;
//     };
//     hoc.displayName = `connect-sl(${getDisplayName(TargetComp)})`;

//     return hoc;
//   };
// };

// function connectWith<InjectProps>(obsOrCreateObs: ObsOrCreate<InjectProps>) {
//   return function<C extends React.ComponentType<Matching<InjectProps, GetProps<C>>>>(TargetComp: C)
//   : React.ComponentType<Omit<GetProps<C>, keyof InjectProps>> {
//     const hoc = (hocProps: JSX.LibraryManagedAttributes<C, Omit<GetProps<C>, keyof InjectProps>>) => {
//       const hocProps$ = useValue$(hocProps);
//       const injectProps: InjectProps = use(
//         () =>
//           typeof obsOrCreateObs === 'function'
//             ? obsOrCreateObs(hocProps$)
//             : obsOrCreateObs
//       );
//       const passThruProps: Omit<GetProps<C>, keyof InjectProps> = hocProps;
//       return <TargetComp {...passThruProps} {...injectProps} />;
//     };
//     hoc.displayName = `connect-sl(${getDisplayName(TargetComp)})`;

//     return hoc;
//   };
// };

// function connect<InjectProps>(obsOrCreateObs: ObsOrCreate<InjectProps>) {
//   return function<C extends React.ComponentType<Matching<InjectProps, GetProps<C>>>>(WrappedComp: C)
//   : React.ComponentType<Omit<GetProps<C>, keyof InjectProps>> {
//     const hoc = (props) => {
//       const props$ = useValue$(props);
//       const derivedProps: InjectProps = use(
//         () =>
//           typeof obsOrCreateObs === 'function'
//             ? obsOrCreateObs(props$)
//             : obsOrCreateObs
//       );
//       return <WrappedComp {...props} {...derivedProps} />;
//     };
//     hoc.displayName = `connect-sl(${getDisplayName(WrappedComp)})`;
//     return hoc;
//   };
// };

export default connect;

export { connect };
