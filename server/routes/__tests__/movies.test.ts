// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

import server from '../../server'
import {
  byId,
  byIdWithCategories,
  getAll,
  allWithCategories,
  byCategory,
  create,
  delete$,
  search,
  addCategoryToMovie,
  removeCategoryFromMovie,
} from '../../db/movies'

vi.mock('../../db/movies')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('/', () => {
  it('responds with a list of movies', async () => {
    vi.mocked(getAll).mockResolvedValue([
      { id: 1, title: 'The Great Escape', release_year: 1964 },
      { id: 2, title: 'Return to Oz', release_year: 1971 },
      { id: 3, title: 'Around the World in 80 Days', release_year: 1973 },
    ])
    const res = await request(server).get('/api/v1/movies')
    expect(res.body).toHaveLength(3)
    expect(res.body[0]).toMatchInlineSnapshot(`
      {
        "id": 1,
        "release_year": 1964,
        "title": "The Great Escape",
      }
    `)
  })

  it('responds with a list of movies and their categories', async () => {
    vi.mocked(allWithCategories).mockResolvedValue([
      {
        id: 1,
        title: 'The Great Escape',
        release_year: 1964,
        categories: [
          { id: 1, name: 'Action/Adventure' },
          { id: 2, name: 'History' },
        ],
      },
    ])
    const res = await request(server).get('/api/v1/movies?withCategories=true')
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchInlineSnapshot(`
      {
        "categories": [
          {
            "id": 1,
            "name": "Action/Adventure",
          },
          {
            "id": 2,
            "name": "History",
          },
        ],
        "id": 1,
        "release_year": 1964,
        "title": "The Great Escape",
      }
    `)
  })

  it('/?withCategories=true fails when the database is sad', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(allWithCategories).mockRejectedValue(new Error('Database Error'))
    const res = await request(server).get('/api/v1/movies?withCategories=true')
    expect(res.status).toBe(500)
  })

  it('filters to a specific category', async () => {
    vi.mocked(byCategory).mockResolvedValue([
      { id: 3, title: 'Special Movie', release_year: 1923 },
    ])
    const res = await request(server).get('/api/v1/movies?category=7')
    expect(res.body).toMatchInlineSnapshot(`
      [
        {
          "id": 3,
          "release_year": 1923,
          "title": "Special Movie",
        },
      ]
    `)
  })

  it('/?category=id fails when the db is sad', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(byCategory).mockRejectedValue(new Error('Database Error'))

    const res = await request(server).get('/api/v1/movies?category=7')

    expect(res.status).toBe(500)
  })

  it('responds with a 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(getAll).mockRejectedValue(new Error('Database Error'))
    const res = await request(server).get('/api/v1/movies')
    expect(res.statusCode).toBe(500)
  })
})

describe('/:id', () => {
  it('responds with a specific movie', async () => {
    vi.mocked(byId).mockResolvedValue({
      id: 12,
      title: '12 Years a Slave',
      release_year: 2013,
    })
    const res = await request(server).get('/api/v1/movies/12')
    expect(res.body).toMatchInlineSnapshot(`
      {
        "id": 12,
        "release_year": 2013,
        "title": "12 Years a Slave",
      }
    `)
  })

  it('responds with a 404', async () => {
    vi.mocked(byId).mockResolvedValue(undefined)

    const res = await request(server).get('/api/v1/movies/999')
    expect(res.statusCode).toBe(404)
  })

  it('responds with a 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(byId).mockRejectedValue(new Error('Database Error'))
    const res = await request(server).get('/api/v1/movies/999')
    expect(res.statusCode).toBe(500)
  })
})

describe('/:id withCategories', () => {
  it('responds with a specific movie', async () => {
    vi.mocked(byIdWithCategories).mockResolvedValue({
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
    const res = await request(server).get(
      '/api/v1/movies/12?withCategories=true'
    )
    expect(res.body).toMatchInlineSnapshot(`
      {
        "categories": [
          {
            "id": 3,
            "name": "Drama",
          },
        ],
        "id": 12,
        "release_year": 2013,
        "title": "12 Years a Slave",
      }
    `)

    expect(byIdWithCategories).toHaveBeenCalledWith(12)
  })
})

describe('creating a movie', () => {
  it('adds a movie to the database', async () => {
    vi.mocked(create).mockResolvedValue(30)
    const res = await request(server).post('/api/v1/movies').send({
      title: 'Ghostbusters',
      release_year: 2016,
    })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      id: 30,
      title: 'Ghostbusters',
      release_year: 2016,
    })
  })

  it('fails when the database is sad', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(create).mockRejectedValue(new Error('Database Error'))

    const res = await request(server).post('/api/v1/movies').send({
      title: 'Ghostbusters',
      release_year: 2016,
    })
    expect(res.statusCode).toBe(500)
  })
})

describe('search', () => {
  it('searches the database for matching movies (1 category)', async () => {
    vi.mocked(search).mockResolvedValue([])
    const res = await request(server).get(
      '/api/v1/movies/search?title=V&category=1'
    )
    expect(res.statusCode).toBe(200)
    expect(search).toHaveBeenCalledWith('V', [1])
  })

  it('searches the database for matching movies', async () => {
    vi.mocked(search).mockResolvedValue([])
    const res = await request(server).get(
      '/api/v1/movies/search?title=V&category=1&category=2'
    )
    expect(res.statusCode).toBe(200)
    expect(search).toHaveBeenCalledWith('V', [1, 2])
  })

  it('fails when the database is sad', async () => {
    vi.mocked(search).mockRejectedValue('Database Error')
    const res = await request(server).get(
      '/api/v1/movies/search?title=V&category=1&category=2'
    )

    expect(res.statusCode).toBe(500)
    expect(search).toHaveBeenCalledWith('V', [1, 2])
  })

  it('fails when multiple titles', async () => {
    const res = await request(server).get(
      '/api/v1/movies/search?title=first&title=second'
    )

    expect(res.statusCode).toBe(400)
    expect(search).not.toHaveBeenCalled()
  })
})

describe('deleting a movie', () => {
  it('removes a movie from the database', async () => {
    vi.mocked(delete$).mockResolvedValue()
    const res = await request(server).delete('/api/v1/movies/2')
    expect(res.statusCode).toBe(200)
    expect(delete$).toHaveBeenCalledWith(2)
  })

  it('fails when the database is sad', async () => {
    vi.mocked(delete$).mockRejectedValue(new Error('Database Error'))
    const res = await request(server).delete('/api/v1/movies/2')
    expect(res.statusCode).toBe(500)
  })
})

describe('Adding a category to a movie', () => {
  it('adds the category in the database', async () => {
    vi.mocked(addCategoryToMovie).mockResolvedValue()
    // I feel like American Hustle was a comedy
    const res = await request(server)
      .post('/api/v1/movies/13/categories')
      .send({ id: 5 })
    expect(res.status).toBe(201)
    expect(addCategoryToMovie).toHaveBeenCalledWith(13, 5)
  })
  it('responds 500 if the database is sad', async () => {
    vi.mocked(addCategoryToMovie).mockRejectedValue(
      new Error('Database is sad')
    )

    const res = await request(server)
      .post('/api/v1/movies/13/categories')
      .send({ id: 5 })

    expect(res.status).toBe(500)
  })
})

describe('Removing a category from a movie', () => {
  it('removes the category from the movie', async () => {
    vi.mocked(removeCategoryFromMovie).mockResolvedValue()
    // ... and I don't think it was historical
    const res = await request(server).delete('/api/v1/movies/13/categories/7')
    expect(res.status).toBe(204)
    expect(removeCategoryFromMovie).toHaveBeenCalledWith(13, 7)
  })
  it('responds 500 if the database is sad', async () => {
    vi.mocked(removeCategoryFromMovie).mockRejectedValue(
      new Error('Database is sad')
    )

    const res = await request(server).delete('/api/v1/movies/13/categories/5')
    expect(res.status).toBe(500)
  })
})
