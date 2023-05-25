import { Movie } from '../../models/Movie'
import { SearchAction } from '../actions/search'

interface SearchState {
  loading: boolean
  error: string | undefined
  results: Movie[] | undefined
}

const initalState: SearchState = {
  loading: false,
  error: undefined,
  results: undefined,
}

function reducer(state = initalState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'search/failed':
      return { loading: false, error: action.payload, results: undefined }

    case 'search/loading':
      return { loading: true, error: undefined, results: undefined }

    case 'search/receive':
      return { loading: false, error: undefined, results: action.payload }

    default:
      return state
  }
}

export default reducer
