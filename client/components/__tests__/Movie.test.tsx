// @vitest-environment jsdom
import nock from 'nock'
import App from '../AppLayout'
import { Provider } from 'react-redux'
import { MemoryRouter as Router } from 'react-router-dom'
import { initialiseStore } from '../../store'

import { describe, it, expect, afterEach } from 'vitest'
import { screen, render, cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'
import { setup } from '../../test-utils'
expect.extend(matchers)

afterEach(cleanup)

describe('<Movie />', () => {
  it('Loads and shows information about the movie', async () => {
    const scope = nock('http://localhost')
      .get('/api/v1/movies/12?withCategories=true')
      .reply(200, {
        categories: [
          {
            id: 3,
            name: 'Drama',
          },
        ],
        id: 12,
        release_year: 2013,
        title: '12 Years a Slave',
      })

    nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [
        {
          id: 3,
          name: 'Drama',
        },
      ])

    const { container } = setup('/movie/12')

    await screen.findByRole('form', { name: 'Add category to movie' })
    expect(scope.isDone()).toBe(true)
    expect(container).toMatchSnapshot()
  })

  it("What happens if the id doesn't exist tho...", async () => {
    nock('http://localhost')
      .get('/api/v1/movies/23934?withCategories=true')
      .reply(404, undefined) // oops this should be a 404

    nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [
        {
          id: 3,
          name: 'Drama',
        },
      ])

    const { container } = setup('/movie/23934')

    const loadingIndicator = await screen.findByText(/Failed/)
    expect(loadingIndicator).toBeVisible()
    expect(container).toMatchSnapshot()
  })
})
