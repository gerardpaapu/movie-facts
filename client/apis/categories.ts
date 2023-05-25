import { Category } from '../../models/Movie'
import request from 'superagent'

export async function all() {
  const res = await request.get('/api/v1/categories')
  const data = res.body
  return data as Category[]
}

export async function byIdWithMovies(id: number) {
  const res = await request
    .get(`/api/v1/categories/${id}`)
    .query({ withMovies: true })
  const data = res.body

  return data as Category
}
