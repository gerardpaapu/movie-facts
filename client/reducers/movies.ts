import { Movie } from '../../models/Movie'
import { MovieAction } from '../actions/movies'

interface MovieState {
  loading: boolean
  error: string | undefined
  data: Movie[]
}

const initalState: MovieState = { loading: true, error: undefined, data: [] }

function reducer(state = initalState, action: MovieAction): MovieState {
  switch (action.type) {
    case 'movies/failed':
      return { loading: false, error: action.payload, data: [] }

    case 'movies/created':
      return {
        loading: false,
        error: undefined,
        data: [...state.data, action.payload],
      }

    case 'movies/delete':
      return {
        loading: false,
        error: undefined,
        data: state.data.filter((movie) => movie.id !== action.payload),
      }

    case 'movies/loading':
      return { loading: true, error: undefined, data: [] }

    case 'movies/receive':
      return { loading: false, error: undefined, data: action.payload }

    default:
      return state
  }
}

export default reducer
