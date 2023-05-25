// @vitest-environment jsdom
import nock from 'nock'
import App from '../AppLayout'
import { Provider } from 'react-redux'
import { MemoryRouter as Router } from 'react-router-dom'
import { initialiseStore } from '../../store'

import { describe, it, expect, afterEach } from 'vitest'
import {
  render,
  screen,
  within,
  cleanup,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import matchers from '@testing-library/jest-dom/matchers'
import { setup } from '../../test-utils'

expect.extend(matchers)

afterEach(cleanup)

describe('<CreateMovieForm />', () => {
  it('Creates a movie', async () => {
    const scope1 = nock('http://localhost')
      .get('/api/v1/movies')
      .reply(200, [
        { id: 1, title: 'Get Out', release_year: 2017 },
        { id: 2, title: 'Some Movie', release_year: 2021 },
      ])

    const scope2 = nock('http://localhost')
      .post('/api/v1/movies')
      .reply(200, { id: 3, title: 'Big', release_year: 1984 })

    setup('/movie')

    const form = await screen.findByRole('form', { name: 'Create movie' })
    expect(form).toBeInTheDocument()
    expect(scope1.isDone()).toBe(true)

    const titleField = within(form).getByLabelText('Title')
    const yearField = within(form).getByLabelText('Release Year')
    const submit = within(form).getByRole('button', { name: 'create' })

    userEvent.type(titleField, 'Big')
    userEvent.type(yearField, '1984')
    userEvent.click(submit)

    await waitFor(() => expect(scope2.isDone()).toBe(true))
    const scope3 = nock('http://localhost')
      .get('/api/v1/movies/3?withCategories=true')
      .reply(200, {
        id: 3,
        title: 'Big',
        release_year: 1984,
        categories: [],
      })
    nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [{ id: 1, name: 'Drama' }])
    await waitFor(() => expect(scope3.isDone()).toBe(true))

    // after the movie is created we navigate to it
    expect(
      screen.getByRole('heading', { name: 'Big (1984)' })
    ).toBeInTheDocument()
  })

  it('Shows an error message when the server is sad', async () => {
    const scope1 = nock('http://localhost')
      .get('/api/v1/movies')
      .reply(200, [
        { id: 1, title: 'Get Out', release_year: 2017 },
        { id: 2, title: 'Some Movie', release_year: 2021 },
      ])

    const scope2 = nock('http://localhost').post('/api/v1/movies').reply(500)

    setup('/movie')

    const form = await screen.findByRole('form', { name: 'Create movie' })
    expect(form).toBeInTheDocument()
    expect(scope1.isDone()).toBe(true)

    const titleField = within(form).getByLabelText('Title')
    const yearField = within(form).getByLabelText('Release Year')
    const submit = within(form).getByRole('button', { name: 'create' })

    userEvent.type(titleField, 'Big')
    userEvent.type(yearField, '1984')
    userEvent.click(submit)

    await waitFor(() => expect(scope2.isDone()).toBe(true))
    const errorMessage = await screen.findByText(/Failed: /)
    expect(errorMessage).toMatchInlineSnapshot(`
      <section
        class="main"
      >
        Failed: 
        Internal Server Error
      </section>
    `)
  })
})
