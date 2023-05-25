import { Category, Movie } from '../../models/Movie'
import { ThunkAction } from '../store'
import * as api from '../apis/movies'

export type DetailsAction =
  | { type: 'details/loading'; payload: void }
  | { type: 'details/receive'; payload: Movie }
  | { type: 'details/failed'; payload: string }
  | { type: 'details/category-deleted'; payload: number }
  | { type: 'details/category-added'; payload: Category }

export function loading(): DetailsAction {
  return { type: 'details/loading', payload: undefined }
}

export function failed(reason: string): DetailsAction {
  return { type: 'details/failed', payload: reason }
}

export function received(movie: Movie): DetailsAction {
  return { type: 'details/receive', payload: movie }
}

export function categoryDeleted(id: number): DetailsAction {
  return { type: 'details/category-deleted', payload: id }
}

export function categoryAdded(category: Category): DetailsAction {
  return { type: 'details/category-added', payload: category }
}

export function fetchMovie(id: number): ThunkAction {
  return async (dispatch) => {
    dispatch(loading())
    try {
      const data = await api.byIdWithCategories(id)
      dispatch(received(data))
    } catch (e) {
      dispatch(failed(String(e)))
    }
  }
}

export function deleteCategory(id: number): ThunkAction {
  return async (dispatch, getState) => {
    const { details } = getState()
    if (!(details.data && details.data.id)) {
      return
    }

    try {
      await api.removeCategoryFromMovie(details.data.id, id)
      dispatch(categoryDeleted(id))
    } catch (e) {
      dispatch(failed(String(e)))
    }
  }
}

export function addCategory(category: Category): ThunkAction {
  return async (dispatch, getState) => {
    const { details } = getState()
    if (!(details.data && details.data.id)) {
      return
    }

    try {
      await api.addCategoryToMovie(details.data.id, category.id)
      dispatch(categoryAdded(category))
    } catch (e) {
      dispatch(failed(String(e)))
    }
  }
}
