import { Router } from 'express'
import * as db from '../db/movies'

const router = Router()

router.get('/', async (req, res) => {
  const category = Number(req.query.category)
  const withCategories = !!req.query.withCategories
  try {
    if (withCategories) {
      const data = await db.allWithCategories()
      res.json(data)
    } else if (!isNaN(category)) {
      const data = await db.byCategory(category)
      res.json(data)
    } else {
      const data = await db.getAll()
      res.json(data)
    }
  } catch (e) {
    console.error(`Database error: ${e}`)
    res.sendStatus(500)
  }
})

function ensureArray(a: unknown): unknown[] {
  if (a == null) {
    return []
  }

  if (!Array.isArray(a)) {
    return [a]
  }

  return a
}

router.get('/search', async (req, res) => {
  const { title, category } = req.query
  const categories = ensureArray(category).map((a) => Number(a))

  if (typeof title != 'string' && title != undefined) {
    res.sendStatus(400)
    return
  }
  try {
    const data = await db.search(title, categories)
    res.json(data)
  } catch (e) {
    res.sendStatus(500)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    let data
    if (req.query.withCategories) {
      data = await db.byIdWithCategories(id)
    } else {
      data = await db.byId(id)
    }

    if (data == null) {
      res.sendStatus(404)
    } else {
      res.json(data)
    }
  } catch (e) {
    console.error(`Database error: ${e}`)
    res.sendStatus(500)
  }
})

// create a movie
router.post('/', async (req, res) => {
  const { title, release_year } = req.body
  try {
    const id = await db.create({ title, release_year })
    res.json({ id, title, release_year })
  } catch (e) {
    console.error(`Database error: ${e}`)
    res.sendStatus(500)
  }
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  try {
    await db.delete$(id)
    res.sendStatus(200)
  } catch (e) {
    console.error(`Database error: ${e}`)
    res.sendStatus(500)
  }
})

// add a category to a movie
router.post('/:movie_id/categories', async (req, res) => {
  const movie_id = Number(req.params.movie_id)
  const { id } = req.body

  try {
    await db.addCategoryToMovie(movie_id, id)
    res.sendStatus(201)
  } catch (e) {
    res.sendStatus(500)
  }
})

router.delete('/:movie_id/categories/:category_id', async (req, res) => {
  const movie_id = Number(req.params.movie_id)
  const category_id = Number(req.params.category_id)

  try {
    await db.removeCategoryFromMovie(movie_id, category_id)
    res.sendStatus(204)
  } catch (e) {
    res.sendStatus(500)
  }
})

export default router
