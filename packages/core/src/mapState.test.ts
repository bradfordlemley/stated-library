import { mapState } from './index';
import makeMapStateTests from './makeMapStateTests';
import createObs from './observable';

makeMapStateTests(mapState, createObs);
