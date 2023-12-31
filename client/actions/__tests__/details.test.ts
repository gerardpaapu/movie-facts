/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import nock from 'nock'

import { addCategory, deleteCategory } from '../details'

/**
 * We want *most* of our tests to be integration tests, but sometimes there
 * are corner cases that are difficult to arrange.
 *
 * In this case, these functions have lines that deal with a scenario where
 * there is no movie details data loaded, but the user attempts to add or delete
 * a category from that movie. This scenario is really difficult to set up
 * in an integration test (let me know if you figure it out), but we can get the
 * coverage in a unit test.
 */
describe('addCategory', () => {
  it("doesn't update if no movie is loaded", async () => {
    nock.disableNetConnect()
    const dispatch = vi.fn()
    const getState = vi.fn(() => {
      return { details: { data: null, loading: true, error: undefined } } as any
    })

    addCategory({ id: 2, name: 'Drama' })(dispatch, getState)
    expect(dispatch).not.toHaveBeenCalled()
  })
})

describe('deleteCategory', () => {
  it("doesn't update if no movie is loaded", async () => {
    nock.disableNetConnect()
    const dispatch = vi.fn()
    const getState = vi.fn(() => {
      return { details: { data: null, loading: true, error: undefined } } as any
    })

    deleteCategory(1)(dispatch, getState)
    expect(dispatch).not.toHaveBeenCalled()
  })
})
