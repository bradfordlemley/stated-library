import { mapState } from './index';
import {
  makeMapStateTests,
  createObservable,
  mapState as coreMapState,
} from '@stated-library/core';
import { BehaviorSubject } from 'rxjs';

makeMapStateTests(mapState, value => new BehaviorSubject(value), true);

makeMapStateTests(mapState, createObservable, true);

makeMapStateTests(coreMapState, value => new BehaviorSubject(value), true);
