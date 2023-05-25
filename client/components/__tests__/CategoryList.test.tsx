/** @jest-environment jsdom */
import nock from 'nock'

import { describe, it, expect, afterEach } from 'vitest'
import { screen, waitFor, cleanup } from '@testing-library/react'

import matchers from '@testing-library/jest-dom/matchers'
import { setup } from '../../test-utils'

expect.extend(matchers)

afterEach(cleanup)

describe('<Category />', () => {
  it('Shows information about the category', async () => {
    const scope = nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [
        {
          id: 1,
          name: 'Action/Adventure',
        },
        {
          id: 2,
          name: 'Sci-Fi',
        },
        {
          id: 3,
          name: 'Drama',
        },
        {
          id: 4,
          name: 'Thriller',
        },
        {
          id: 5,
          name: 'Comedy',
        },
        {
          id: 6,
          name: 'Fantasy',
        },
        {
          id: 7,
          name: 'History',
        },
        {
          id: 8,
          name: 'Western',
        },
        {
          id: 9,
          name: 'Musical',
        },
      ])

    const { container } = setup('/category')

    await waitFor(() => expect(scope.isDone()).toBe(true))
    expect(container).toMatchSnapshot()
  })

  it('Handles errors', async () => {
    const scope = nock('http://localhost').get('/api/v1/categories').reply(500)

    const { container } = setup('/category')

    await screen.findByText(/Error! /)
    expect(scope.isDone()).toBe(true)
    expect(container).toMatchSnapshot()
  })
})
