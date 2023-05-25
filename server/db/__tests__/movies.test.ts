// @vitest-environment node

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import connection from '../../db/connection'
import * as movies from '../movies'

/**
 * For database functions, we're not mocking anything out.
 * We're using a real sqlite database because we want to make sure that
 * we are testing our queries.
 *
 * During tests, jest sets process.env.NODE_ENV to 'test' which means
 * that we automatically get the test configuration from our knexfile.
 *
 * Before *all* the tests run, we run all migrations and before *each*
 * test is run we're going to run seeds.
 *
 * This ensures that each test runs with the database in a standard state.
 *
 * After all the tests, we rollback our migrations (this is mostly for coverage)
 * and destroy the connection.
 *
 * In each test, we're going to run a query and make assertions about the results.
 *
 * Since we're running against a standard dataset, we can use snapshot tests to
 * assert the exact results from each query with `.toMatchInlineSnapshot(...)`
 */
beforeAll(() => {
  return connection.migrate.latest()
})

beforeEach(async () => {
  await connection.seed.run()
})

afterAll(async () => {
  await connection.migrate.rollback()
  await connection.destroy()
})

describe('Movies DB', () => {
  describe('.all', () => {
    it('fetches all the things', async () => {
      expect.assertions(2)
      const result = await movies.getAll()

      expect(result).toHaveLength(28)
      expect(result[12]).toMatchInlineSnapshot(`
        {
          "id": 13,
          "release_year": 2013,
          "title": "American Hustle",
        }
      `)
    })
  })

  describe('.allWithCategories', () => {
    it('fetches all the movies and their categories', async () => {
      const data = await movies.allWithCategories()
      expect(data).toHaveLength(28)
      // Get Out doesn't have categories
      expect(data[21]).toMatchInlineSnapshot(`
        {
          "categories": [],
          "id": 22,
          "release_year": 2017,
          "title": "Get Out",
        }
      `)
    })
  })

  describe('.byId', () => {
    it('fetches a specific movie', async () => {
      const result = await movies.byId(12)
      expect(result).toMatchInlineSnapshot(`
        {
          "id": 12,
          "release_year": 2013,
          "title": "12 Years a Slave",
        }
      `)
    })
  })

  describe('.byIdWithCategories', () => {
    it('fetches a specific movie', async () => {
      const result = await movies.byIdWithCategories(12)
      expect(result).toMatchInlineSnapshot(`
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
    })

    it('returns an empty array for movies with no categories', async () => {
      const result = await movies.byIdWithCategories(25)
      expect(result?.categories).toHaveLength(0)
      expect(result).toMatchInlineSnapshot(`
        {
          "categories": [],
          "id": 25,
          "release_year": 2018,
          "title": "Black Panther",
        }
      `)
    })

    it('returns undefined for a missing ID', async () => {
      const result = await movies.byIdWithCategories(11231232)
      expect(result).toBeUndefined()
    })
  })

  describe('.byCategory', () => {
    it('fetches all in a specific category', async () => {
      const result = await movies.byCategory(2)
      expect(result).toHaveLength(8)
      expect(result[0]).toMatchInlineSnapshot(`
        {
          "id": 1,
          "release_year": 2010,
          "title": "Inception",
        }
      `)
    })
  })

  describe('.byCategoriesAll', () => {
    it('fetches movies that match all categories', async () => {
      const result = await movies.byCategoriesAll([3, 8])
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "id": 16,
            "release_year": 2014,
            "title": "Whiplash",
          },
        ]
      `)
    })
  })

  describe('.byCategoriesAny', () => {
    it('fetches movies that match any of the categories', async () => {
      const result = await movies.byCategoriesAny([3, 8])
      expect(result).toHaveLength(13)
    })
  })

  describe('deleting a movie', () => {
    it('removes the movie from the database', async () => {
      await movies.delete$(3)
      const rows = await movies.getAll()
      expect(rows).toHaveLength(27)
    })
  })

  describe('creating a movie', () => {
    it('adds a new movie to the database', async () => {
      const id = await movies.create({
        title: 'Ghostbusters',
        release_year: 1984,
      })
      expect(id).toBe(29)
      const rows = await movies.getAll()

      expect(rows).toHaveLength(29)
      expect(rows[28]).toMatchInlineSnapshot(`
        {
          "id": 29,
          "release_year": 1984,
          "title": "Ghostbusters",
        }
      `)
    })
  })

  describe('Adding a category to ta movie', () => {
    it('adds a new relationship', async () => {
      await movies.addCategoryToMovie(10, 8)
      const results = await movies.byCategory(8)
      expect(results).toMatchInlineSnapshot(`
        [
          {
            "id": 16,
            "release_year": 2014,
            "title": "Whiplash",
          },
          {
            "id": 10,
            "release_year": 2012,
            "title": "Django Unchained",
          },
        ]
      `)
    })
  })

  describe('Removing a category from a movie', () => {
    it('removes a relationship', async () => {
      await movies.removeCategoryFromMovie(16, 8)
      const results = await movies.byCategory(8)
      expect(results).toEqual([])
    })
  })

  describe('Searching by title', () => {
    it('returns a list of matches', async () => {
      const list = await movies.search('ven', [])
      expect(list).toMatchInlineSnapshot(`
        [
          {
            "id": 8,
            "release_year": 2012,
            "title": "The Avengers",
          },
          {
            "id": 19,
            "release_year": 2015,
            "title": "The Revenant",
          },
        ]
      `)
    })
  })

  describe('Searching by categories', () => {
    it('returns a list of matches', async () => {
      const list = await movies.search(undefined, [3, 8])
      expect(list).toMatchInlineSnapshot(`
        [
          {
            "id": 16,
            "release_year": 2014,
            "title": "Whiplash",
          },
        ]
      `)
    })
  })

  describe('Searching by title and categories', () => {
    it('returns a list of matches', async () => {
      const list = await movies.search('Black', [4])
      expect(list).toMatchInlineSnapshot(`
        [
          {
            "id": 3,
            "release_year": 2010,
            "title": "Black Swan",
          },
        ]
      `)
    })
  })
})
