/** @jest-environment jsdom */
import nock, { load } from 'nock'
import App from '../App'
import { Provider } from 'react-redux'
import { MemoryRouter as Router } from 'react-router-dom'
import { initialiseStore } from '../../store'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom'

describe('Add category to movie', () => {
  it('sends a request and updates UI', async () => {
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

    const loadCategories = nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [
        {
          id: 3,
          name: 'Drama',
        },
        {
          id: 2,
          name: 'History',
        },
      ])

    render(
      <Router initialEntries={['/movie/12']}>
        <Provider store={initialiseStore()}>
          <App />
        </Provider>
      </Router>
    )

    await waitFor(() => expect(loadCategories.isDone()).toBe(true))

    const select = await screen.findByLabelText('New category')
    expect(select).toBeVisible()
    userEvent.selectOptions(select, 'History')
    userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    const createRequest = nock('http://localhost')
      .post('/api/v1/movies/12/categories')
      .reply(201)

    const deleteLabel = await screen.findByRole('button', {
      name: 'delete category History',
    })
    expect(createRequest.isDone()).toBe(true)
    expect(deleteLabel).toBeVisible()
  })

  it("shows an error if we can't load categories", async () => {
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

    const loadCategories = nock('http://localhost')
      .get('/api/v1/categories')
      .reply(500)

    render(
      <Router initialEntries={['/movie/12']}>
        <Provider store={initialiseStore()}>
          <App />
        </Provider>
      </Router>
    )

    const errorMessage = await screen.findByText(/Error loading categories/)
    expect(errorMessage).toBeVisible()
    expect(loadCategories.isDone()).toBe(true)
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
        {
          id: 2,
          name: 'History',
        },
      ])

    render(
      <Router initialEntries={['/movie/12']}>
        <Provider store={initialiseStore()}>
          <App />
        </Provider>
      </Router>
    )

    const select = await screen.findByLabelText('New category')
    expect(select).toBeVisible()
    userEvent.selectOptions(select, 'History')
    userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    const createRequest = nock('http://localhost')
      .post('/api/v1/movies/12/categories')
      .reply(500)

    const errorMessage = await screen.findByText(/Error:/)
    expect(errorMessage).toMatchInlineSnapshot(`
      <p>
        Failed: 
        Error: Internal Server Error
      </p>
    `)
    expect(createRequest.isDone()).toBe(true)
  })
})
