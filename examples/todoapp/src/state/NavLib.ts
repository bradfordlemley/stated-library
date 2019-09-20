import { createStatedLib } from '@stated-library/base';

export default function createNavLib(page: string) {
  return createStatedLib({
    page
  },
  base => ({
    setPage(page: string) {
      base.updateState({ page }, 'SET_PAGE');
    }
  })
)};