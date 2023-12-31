// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest'

import request from 'supertest'
import server from '../../server'
import { byId, byIdWithMovies, getAll } from '../../db/categories'

/**
 * In each test we use supertest to load our server module and fake a request. NB I'm using
 * async/await syntax here, tests can get complicated and I think it reads better.
 *
 * > const response = await request(server).get(...)
 *
 * for each route, we will mock out the database function it calls so that we can
 * reliably test both success and failure.
 *
 * First, we want to import the database function and call `vi.mock` to mock out
 * that module.
 *
 * > import { byId } from '../../db/movies'
 * > vi.mock('../../db/')
 *
 * Then in the test, we use `vi.mocked` to access the mocking methods so we can
 * set up success or failure for just that test. You do this before you run your
 * fake request.
 *
 * > vi.mocked(byId).mockResolvedValue({ ... })
 *
 * Now that we have a response, we can assert things about it.
 *
 * > expect(response.status).toBe(200)
 * > expect(response.body).toBe({ ... })
 *
 * And we can also check that the mocked functions were called with the right arguments
 *
 * > expect(byId).toHaveBeenCalledWith(13)
 *
 * We're also mocking out `console.error` to avoid seeing logs in our
 * tests.
 *
 * I'm *not* asserting what those logs should be, but that is something
 * you could do:
 *
 * > expect(console.error).toHaveBeenCalledWith('Oh no!')
 */
vi.mock('../../db/categories')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('/', () => {
  it('responds with a list of categories', async () => {
    vi.mocked(getAll).mockResolvedValue([
      { id: 1, name: 'Drama' },
      { id: 2, name: 'Comedy' },
    ])
    const res = await request(server).get('/api/v1/categories')
    expect(res.body).toHaveLength(2)
    expect(getAll).toHaveBeenCalled()
  })

  it('responds with a 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(getAll).mockRejectedValue(new Error('Database error'))
    const res = await request(server).get('/api/v1/categories')
    expect(res.statusCode).toBe(500)
  })
})

describe('/:id', () => {
  it('responds with a specific movie', async () => {
    vi.mocked(byId).mockResolvedValue({ id: 3, name: 'Drama' })
    const res = await request(server).get('/api/v1/categories/3')
    expect(res.body).toMatchInlineSnapshot(`
      {
        "id": 3,
        "name": "Drama",
      }
    `)
  })

  it('responds with a 404', async () => {
    vi.mocked(byId).mockResolvedValue(undefined)
    const res = await request(server).get('/api/v1/categories/999')
    expect(res.statusCode).toBe(404)
  })

  it('responds with a 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(byId).mockRejectedValue(new Error('Database error'))
    const res = await request(server).get('/api/v1/categories/2')
    expect(res.statusCode).toBe(500)
  })
})

describe('byId withMovies', () => {
  it('responds with a specific movie', async () => {
    vi.mocked(byIdWithMovies).mockResolvedValue({
      id: 3,
      name: 'Drama',
      movies: [],
    })

    const res = await request(server)
      .get('/api/v1/categories/3')
      .query({ withMovies: true })
    expect(res.body).toMatchInlineSnapshot(`
      {
        "id": 3,
        "movies": [],
        "name": "Drama",
      }
    `)
  })
})
