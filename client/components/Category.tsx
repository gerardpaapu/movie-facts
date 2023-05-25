import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Category as CategoryData } from '../../models/Movie'
import * as api from '../apis/categories'

export default function Category() {
  const { id } = useParams()
  const [category, setCategory] = useState(null as CategoryData | null)

  useEffect(() => {
    const load = async () => {
      const data = await api.byIdWithMovies(Number(id))
      setCategory(data)
    }

    load()
  }, [id])

  if (category == null) {
    return <div>Loading...</div>
  }

  const { name, movies } = category

  return (
    <div>
      <h2>Category - {name}</h2>
      <ul>
        {movies &&
          movies.map((movie) => (
            <li key={movie.id}>
              <Link to={`/movie/${movie.id}`}>
                {movie.title} ({movie.release_year})
              </Link>
            </li>
          ))}
      </ul>
    </div>
  )
}
