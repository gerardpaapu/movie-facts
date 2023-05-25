import { Movie } from '../../models/Movie'
import request from 'superagent'

export async function all() {
  const res = await request.get('/api/v1/movies')
  const data = res.body
  return data as Movie[]
}

export async function byIdWithCategories(id: number) {
  const res = await request.get(`/api/v1/movies/${id}?withCategories=true`)
  const data = res.body
  return data as Movie
}

export async function create(movie: Movie) {
  const res = await request.post('/api/v1/movies').send(movie)
  const data = res.body
  return data as Movie
}

export async function addCategoryToMovie(movieId: number, categoryId: number) {
  await request
    .post(`/api/v1/movies/${movieId}/categories`)
    .send({ id: categoryId })
}

export async function removeCategoryFromMovie(
  movieId: number,
  categoryId: number
) {
  await request.delete(`/api/v1/movies/${movieId}/categories/${categoryId}`)
}

export async function search(title: string | undefined, categories: number[]) {
  const res = await request
    .get('/api/v1/movies/search')
    .query({ title, category: categories })
  return res.body as Movie[]
}
