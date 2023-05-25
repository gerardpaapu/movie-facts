import { Movie } from '../../models/Movie'
import connection from './connection'

export function getAll(db = connection) {
  return db('category').select('*')
}

export function byId(id: number, db = connection) {
  return db('category').select().where({ id }).first()
}

export async function byIdWithMovies(id: number, db = connection) {
  const rows = await db('category')
    .select('*', 'category.id as id')
    .leftOuterJoin(
      'movie_category',
      'category.id',
      'movie_category.category_id'
    )
    .leftOuterJoin('movie', 'movie.id', 'movie_category.movie_id')
    .where('category_id', id)

  if (rows.length === 0) {
    return undefined
  }

  const first = rows[0]
  const result = {
    id: first.id,
    name: first.name,
    movies: [] as Movie[],
  }

  for (const row of rows) {
    result.movies.push({
      id: row.movie_id,
      title: row.title,
      release_year: row.release_year,
    })
  }

  return result
}

export function byName(name: string, db = connection) {
  return db('category').select().where({ name }).first()
}
