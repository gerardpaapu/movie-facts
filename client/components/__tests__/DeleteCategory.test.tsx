// @vitest-environment jsdom */
import nock from 'nock'
import { describe, it, expect, afterEach } from 'vitest'
import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react'

import matchers from '@testing-library/jest-dom/matchers'
import { setup } from '../../test-utils'
expect.extend(matchers)

afterEach(cleanup)

describe('Delete category from movie', () => {
  it('sends a request to delete the category', async () => {
    nock('http://localhost')
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

    setup('/movie/12')

    const deleteButton = await screen.findByRole('button', {
      name: 'delete category Drama',
    })
    expect(deleteButton).toBeVisible()

    const deleteScope = nock('http://localhost')
      .delete('/api/v1/movies/12/categories/3')
      .reply(204)

    fireEvent.click(deleteButton)
    await waitFor(() => expect(deleteButton).not.toBeVisible())
    expect(deleteScope.isDone()).toBe(true)
    expect(deleteButton).not.toBeInTheDocument()
  })

  it('shows an error if the server is sad', async () => {
    nock('http://localhost')
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

    setup('/movie/12')

    const deleteButton = await screen.findByRole('button', {
      name: 'delete category Drama',
    })
    expect(deleteButton).toBeVisible()

    const deleteScope = nock('http://localhost')
      .delete('/api/v1/movies/12/categories/3')
      .reply(500)

    fireEvent.click(deleteButton)
    await screen.findByText(/Error:/)
    expect(deleteScope.isDone()).toBe(true)
  })
})
