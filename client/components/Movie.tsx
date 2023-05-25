import { UIEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Category } from '../../models/Movie'
import AddCategoryForm from './AddCategoryForm'
import useDetails from '../hooks/useDetails'

export default function Movie() {
  const { id } = useParams()
  const { loading, error, details, addCategory, deleteCategory } = useDetails(
    Number(id)
  )

  const handleDeleteClicked = async (evt: UIEvent<HTMLButtonElement>) => {
    const { value } = evt.currentTarget
    deleteCategory(Number(value))
  }

  const handleAddCategory = async (category: Category) => {
    addCategory(category)
  }

  if (error) {
    return <p>Failed: {error}</p>
  }

  if (loading || !details) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <h2>
        {details.title} ({details.release_year})
      </h2>
      <AddCategoryForm
        categories={details.categories}
        onSubmit={handleAddCategory}
      />
      {details.categories && details.categories.length ? (
        <ul>
          {details.categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={handleDeleteClicked}
                value={category.id}
                aria-label={`delete category ${category.name}`}
              >
                delete
              </button>
              <Link to={`/category/${category.id}`}>{category.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <>No categories</>
      )}
    </div>
  )
}
