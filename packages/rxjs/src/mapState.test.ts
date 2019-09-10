import { mapState } from './index';
import {
  createObservable,
  mapState as coreMapState,
} from '@stated-library/core';

// @ts-ignore
import makeMapStateTests from '../../core/test/makeMapStateTests';

import { BehaviorSubject } from 'rxjs';

// @ts-ignore
makeMapStateTests(mapState, value => new BehaviorSubject(value), true);

makeMapStateTests(mapState, createObservable, true);

// @ts-ignore
makeMapStateTests(coreMapState, value => new BehaviorSubject(value), true);
