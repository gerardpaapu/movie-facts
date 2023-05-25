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

describe('<MovieList />', () => {
  it('Shows a list of movies', async () => {
    const scope = nock('http://localhost')
      .get('/api/v1/movies')
      .reply(200, [
        { id: 1, title: 'Get Out', release_year: 2017 },
        { id: 2, title: 'Some Movie', release_year: 2021 },
      ])

    setup('/movie')

    const title = await screen.findByRole('link', {
      name: 'Some Movie (2021)',
    })
    expect(title).toBeVisible()
    expect(scope.isDone()).toBeTruthy()
  })

  it('fails to show a list of movies', async () => {
    const scope = nock('http://localhost').get('/api/v1/movies').reply(500)

    setup('/movie')

    const errorMessage = await screen.findByText(/Error: Internal Server Error/)
    expect(errorMessage).toBeVisible()
    expect(scope.isDone()).toBeTruthy()
  })
})
