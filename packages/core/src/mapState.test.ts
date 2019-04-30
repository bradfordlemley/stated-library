import { mapState } from './index';
import makeMapStateTests from '../test/makeMapStateTests';
import createObs from './observable';

makeMapStateTests(mapState, createObs);
