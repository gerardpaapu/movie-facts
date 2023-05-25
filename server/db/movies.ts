import { Category, Movie } from '../../models/Movie'
import connection from './connection'

export function getAll() {
  return connection('movie').select('*')
}

//
interface MovieWithCategories extends Movie {
  categories: Category[]
}

export async function allWithCategories(db = connection) {
  const data = await db('movie')
    .leftOuterJoin('movie_category', 'movie.id', 'movie_category.movie_id')
    .leftOuterJoin('category', 'category.id', 'movie_category.category_id')
    .select('*', 'movie.id as id')

  const result = [] as Movie[]

  let last: MovieWithCategories | undefined
  for (const item of data) {
    if (last == null || item.id != last.id) {
      last = {
        id: item.id,
        title: item.title,
        release_year: item.release_year,
        categories: [],
      }
      result.push(last)
    }

    if (item.category_id != null) {
      last.categories.push({ id: item.category_id, name: item.name })
    }
  }

  return result
}

export function byId(id: number, db = connection) {
  return db('movie').select().where({ id }).first()
}

export async function byIdWithCategories(id: number, db = connection) {
  const rows = await db('movie')
    .leftOuterJoin('movie_category', 'movie.id', 'movie_category.movie_id')
    .leftOuterJoin('category', 'category.id', 'movie_category.category_id')
    .select('*', 'movie.id as id')
    .where({ 'movie.id': id })

  if (rows.length === 0) {
    return undefined
  }

  const { id: movieId, title, release_year } = rows[0]
  const result = {
    id: movieId,
    title,
    release_year,
    categories: [],
  } as MovieWithCategories

  for (const row of rows) {
    if (row.category_id != null) {
      result.categories.push({
        id: row.category_id,
        name: row.name,
      })
    }
  }

  return result
}

export function byCategory(category_id: number, db = connection) {
  return db('movie')
    .select('id', 'title', 'release_year')
    .join('movie_category', 'movie.id', 'movie_category.movie_id')
    .where({ category_id })
}

export async function search(
  title: string | undefined,
  ids: number[],
  db = connection
): Promise<Movie[]> {
  const query = db('movie')
    .select('movie.*')
    .count('category_id as matches')
    .join('movie_category', 'movie.id', 'movie_category.movie_id')
    .join('category', 'category.id', 'movie_category.category_id')

  if (title) {
    query.where('movie.title', 'like', `%${title}%`)
  }

  if (ids.length) {
    query.whereIn('category.id', ids).having('matches', '=', ids.length)
  }

  const rows = await query.groupBy('movie.id')

  return rows.map((row) => {
    const { id, release_year, title } = row
    return { id, release_year, title } as Movie
  })
}

export async function byCategoriesAll(
  ids: number[],
  db = connection
): Promise<Movie[]> {
  const rows = await db('movie')
    .select('movie.*')
    .count('category_id as matches')
    .join('movie_category', 'movie.id', 'movie_category.movie_id')
    .join('category', 'category.id', 'movie_category.category_id')
    .whereIn('category.id', ids)
    .groupBy('movie.id')
    .having('matches', '=', ids.length)

  return rows.map((row) => {
    const { id, release_year, title } = row
    return { id, release_year, title } as Movie
  })
}

export async function byCategoriesAny(ids: number[], db = connection) {
  const rows = await db('movie')
    .select('movie.*')
    .count('category_id as matches')
    .join('movie_category', 'movie.id', 'movie_category.movie_id')
    .join('category', 'category.id', 'movie_category.category_id')
    .whereIn('category.id', ids)
    .groupBy('movie.id')

  return rows.map((row) => {
    const { id, release_year, title } = row
    return { id, release_year, title } as Movie
  })
}

export async function delete$(id: number, db = connection) {
  await db('movie').delete().where({ id })
}

export async function create(data: Movie, db = connection): Promise<number> {
  const [id] = await db('movie').insert(data)
  return id
}

export async function addCategoryToMovie(
  movie_id: number,
  category_id: number,
  db = connection
) {
  await db('movie_category').insert({ movie_id, category_id })
}

export async function removeCategoryFromMovie(
  movie_id: number,
  category_id: number,
  db = connection
) {
  await db('movie_category').delete().where({ movie_id, category_id })
}
