import { BehaviorSubject } from 'rxjs';
import { LibBase } from '@stated-library/base';

export default class StatedLibRxJs<R, D = R> extends LibBase<R, D> {
  constructor(...args) {
    super(initialValue => new BehaviorSubject(initialValue), ...args);
  }
}
