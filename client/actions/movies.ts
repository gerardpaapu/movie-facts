import * as api from '../apis/movies'
import { Movie } from '../../models/Movie'
import type { ThunkAction } from '../store'

export type MovieAction =
  | { type: 'movies/receive'; payload: Movie[] }
  | { type: 'movies/created'; payload: Movie }
  | { type: 'movies/loading'; payload: void }
  | { type: 'movies/failed'; payload: string }
  | { type: 'movies/delete'; payload: number }

export function receive(movies: Movie[]): MovieAction {
  return { type: 'movies/receive', payload: movies }
}

export function loading(): MovieAction {
  return { type: 'movies/loading' } as MovieAction
}

export function failed(reason: string): MovieAction {
  return { type: 'movies/failed', payload: reason }
}

export function fetchMovies(): ThunkAction {
  return async (dispatch) => {
    dispatch(loading())
    try {
      const data = await api.all()
      dispatch(receive(data))
    } catch (e) {
      dispatch(failed(String(e)))
    }
  }
}

export function created(movie: Movie): MovieAction {
  return { type: 'movies/created', payload: movie }
}

export function addMovie(movie: Movie): ThunkAction<number | undefined> {
  return async (dispatch) => {
    dispatch(loading())
    try {
      const data = await api.create(movie)
      dispatch(created(data))
      return data.id
    } catch (e) {
      dispatch(failed((e as Error).message))
    }
  }
}

export function deleted(id: number): MovieAction {
  return { type: 'movies/delete', payload: id }
}
