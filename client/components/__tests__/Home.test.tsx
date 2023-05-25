// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { setup } from '../../test-utils'

describe('<Home />', () => {
  it('looks real good', () => {
    const { container } = setup()
    expect(container).toMatchSnapshot()
  })
})
