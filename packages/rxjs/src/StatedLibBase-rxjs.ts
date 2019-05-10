import { BehaviorSubject } from 'rxjs';
import { StatedLibBase } from '@stated-library/base';

export default class StatedLibRxJs<R, D = R> extends StatedLibBase<R, D> {
  constructor(initialValue, opts?) {
    super(initialValue, Object.assign(
      {},
      opts,
      { createObs: initialValue => new BehaviorSubject(initialValue) }
    ));
  }
}
