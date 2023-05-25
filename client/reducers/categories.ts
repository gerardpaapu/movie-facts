import { Category } from '../../models/Movie'
import { CategoryAction } from '../actions/categories'

interface CategoryState {
  loading: boolean
  error: string | undefined
  data: Category[] | undefined
}

const initalState: CategoryState = {
  loading: false,
  error: undefined,
  data: undefined,
}

function reducer(state = initalState, action: CategoryAction): CategoryState {
  switch (action.type) {
    case 'categories/failed':
      return { loading: false, error: action.payload, data: undefined }

    case 'categories/loading':
      return { loading: true, error: undefined, data: undefined }

    case 'categories/receive':
      return { loading: false, error: undefined, data: action.payload }

    default:
      return state
  }
}

export default reducer
