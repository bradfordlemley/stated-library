import StatedLibBase from '@stated-library/base';

type State<Page> = {
  page: Page;
};

export default class NavLib<Page> extends StatedLibBase<
  State<Page>,
  State<Page>
> {
  constructor(state?: Partial<State<Page>>) {
    super(Object.assign({}, {page: ""}, state));
  }

  setPage(page: Page) {
    this.updateState({ page }, 'SET_PAGE');
  }
}
