import * as React from 'react';
import { Observable } from '@stated-library/interface';
import getDisplayName from './getDisplayName';
import use from './use';
import useValueAs$ from './useValueAsObservable';

export type OmitCommon<T, K> = Pick<T, Exclude<keyof T, keyof K>>;

export type HocFactory<InjectProps, HocProps> = <Props extends InjectProps>(
  Component: React.ComponentType<Props>
) => React.ComponentType<OmitCommon<Props, InjectProps> & HocProps>;

type ObsOrCreate<InjectProps, OwnProps> =
  | Observable<InjectProps>
  | ((props$: Observable<OwnProps>) => Observable<InjectProps>);

function connect<OwnProps, InjectProps>(
  obsOrCreate: ObsOrCreate<InjectProps, OwnProps>
): HocFactory<InjectProps, OwnProps> {
  return function hocFactory(WrappedComp) {
    function hoc(hocProps) {
      const hocProps$ = useValueAs$(hocProps);
      const injectProps = use(() =>
        typeof obsOrCreate === 'function' ? obsOrCreate(hocProps$) : obsOrCreate
      );
      return <WrappedComp {...hocProps} {...injectProps} />;
    }
    hoc.displayName = `connect-sl(${getDisplayName(WrappedComp)})`;
    return hoc;
  };
}

export default connect;

export { connect };
