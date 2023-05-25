import * as api from '../apis/movies'
import { Movie } from '../../models/Movie'
import type { ThunkAction } from '../store'

export type SearchAction =
  | { type: 'search/receive'; payload: Movie[] }
  | { type: 'search/created'; payload: Movie }
  | { type: 'search/loading'; payload: void }
  | { type: 'search/failed'; payload: string }
  | { type: 'search/delete'; payload: number }

export function receive(movies: Movie[]): SearchAction {
  return { type: 'search/receive', payload: movies }
}

export function loading(): SearchAction {
  return { type: 'search/loading' } as SearchAction
}

export function failed(reason: string): SearchAction {
  return { type: 'search/failed', payload: reason }
}

export function runSearch(
  title: string | undefined,
  categories: number[]
): ThunkAction {
  return async (dispatch) => {
    dispatch(loading())
    try {
      const data = await api.search(title, categories)
      dispatch(receive(data))
    } catch (e) {
      dispatch(failed((e as Error).message))
    }
  }
}
