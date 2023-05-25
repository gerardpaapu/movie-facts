// @vitest-environment jsdom

import { describe, it, expect } from 'vitest'
import nock from 'nock'

import { screen, waitFor } from '@testing-library/react'
import { setup } from '../../test-utils'

/**
 * For our components we're mostly going to write integration tests, running
 * as much of our stack as possible and mocking as little as possible.
 *
 * In this case it means we're going to:
 *
 * 1. mount the whole App for each test
 * 2. set the current route using a MemoryRouter
 * 3. use nock to mock out api calls (both internal and external)
 * 4. use fireEvent or userEvent to interact with the UI
 *
 * All our integration tests can follow this pattern more or less, we never
 * need to mock out the redux store or the API functions and we get coverage
 * of those naturally.
 */

describe('<Search />', () => {
  it('Loads the categories', async () => {
    const scope = nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [{ id: 1, name: 'Drama' }])

    setup('/search')

    const checkbox = await screen.findByLabelText('Drama')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
    expect(scope.isDone()).toBeTruthy()
  })

  it('shows a loading indicator for the category picker', async () => {
    const scope = nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [{ id: 1, name: 'Drama' }])

    setup('/search')

    expect(scope.isDone()).not.toBeTruthy()
    const loadingText = screen.queryByText(/Loading categories/)
    expect(loadingText).toBeVisible()
  })

  it('shows an error when failing to load categories', async () => {
    nock('http://localhost').get('/api/v1/categories').reply(500)

    setup('/search')

    const errorMessage = await screen.findByText(/Failed to load categories/)
    expect(errorMessage).toBeVisible()
  })

  it('Searches with title and categories', async () => {
    const scope1 = nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [
        { id: 1, name: 'Drama' },
        { id: 2, name: 'Comedy' },
      ])

    const { user } = setup('/search')

    const checkbox = await screen.findByLabelText('Comedy')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
    expect(scope1.isDone()).toBe(true)

    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    const scope2 = nock('http://localhost')
      .get('/api/v1/movies/search?title=pe&category=2')
      .reply(200, [
        { id: 1, title: "The King's Speech", release_year: 2010 },
        { id: 2, title: 'The Grand Budapest Hotel', release_year: 2014 },
      ])

    const titleInput = screen.getByLabelText('Title')
    await user.type(titleInput, 'pe')
    const submitButton = screen.getByRole('button')
    await user.click(submitButton)

    const resultText = await screen.findByText('2 matching results')
    expect(resultText).toBeInTheDocument()
    expect(screen.getByText("The King's Speech (2010)")).toBeInTheDocument()
    expect(
      screen.getByText('The Grand Budapest Hotel (2014)')
    ).toBeInTheDocument()

    expect(scope2.isDone()).toBeTruthy()
  })

  it('Searches with title', async () => {
    const scope1 = nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [
        { id: 1, name: 'Drama' },
        { id: 2, name: 'Comedy' },
      ])

    const { user } = setup('/search')

    await waitFor(() => expect(scope1.isDone()).toBe(true))

    const scope2 = nock('http://localhost')
      .get('/api/v1/movies/search?title=pe')
      .reply(200, [
        { id: 1, title: "The King's Speech", release_year: 2010 },
        { id: 2, title: 'The Grand Budapest Hotel', release_year: 2014 },
      ])

    const titleInput = screen.getByLabelText('Title')
    await user.type(titleInput, 'pe')
    const submitButton = screen.getByRole('button')
    await user.click(submitButton)

    const resultText = await screen.findByText('2 matching results')
    expect(resultText).toBeInTheDocument()
    expect(screen.getByText("The King's Speech (2010)")).toBeInTheDocument()
    expect(
      screen.getByText('The Grand Budapest Hotel (2014)')
    ).toBeInTheDocument()

    expect(scope2.isDone()).toBeTruthy()
  })

  it('checking and unchecking a category excludes it', async () => {
    const scope1 = nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [
        { id: 1, name: 'Drama' },
        { id: 2, name: 'Comedy' },
      ])

    const { user } = setup('/search')

    const checkbox = await screen.findByLabelText('Comedy')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
    expect(scope1.isDone()).toBe(true)

    await user.click(checkbox)
    expect(checkbox).toBeChecked()

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()

    const scope2 = nock('http://localhost')
      .get('/api/v1/movies/search?title=pe')
      .reply(200, [
        { id: 1, title: "The King's Speech", release_year: 2010 },
        { id: 2, title: 'The Grand Budapest Hotel', release_year: 2014 },
      ])

    const titleInput = screen.getByLabelText('Title')
    await user.type(titleInput, 'pe')
    const submitButton = screen.getByRole('button')
    await user.click(submitButton)

    const resultText = await screen.findByText('2 matching results')
    expect(resultText).toBeInTheDocument()
    expect(screen.getByText("The King's Speech (2010)")).toBeInTheDocument()
    expect(
      screen.getByText('The Grand Budapest Hotel (2014)')
    ).toBeInTheDocument()

    expect(scope2.isDone()).toBeTruthy()
  })

  it('Fails when the server is sad', async () => {
    nock.disableNetConnect()
    const scope1 = nock('http://localhost')
      .get('/api/v1/categories')
      .reply(200, [
        { id: 1, name: 'Drama' },
        { id: 2, name: 'Comedy' },
      ])

    const { user } = setup('/search')

    await waitFor(() => expect(scope1.isDone()).toBe(true))

    nock('http://localhost').get('/api/v1/movies/search?title=pe').reply(500)

    const titleInput = screen.getByLabelText('Title')
    await user.type(titleInput, 'pe')
    const submitButton = screen.getByRole('button')
    await user.click(submitButton)

    const errorMessage = await screen.findByText(/Search failed:/)
    expect(errorMessage).toMatchInlineSnapshot(`
      <p>
        Search failed: 
        Internal Server Error
      </p>
    `)
  })
})
