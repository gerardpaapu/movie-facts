import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { Category } from '../../common/Movie'
import * as CategoryApi from '../apis/categories'
import useCategories from '../hooks/useCategories'

interface Props {
  categories?: Category[]
  onSubmit: (category: Category) => void
}

function AddCategoryForm({ categories: existingCategories, onSubmit }: Props) {
  const [category, setCategory] = useState(null as Category | null)

  const { categories, error, pending } = useCategories()
  if (error) {
    return <>Error loading categories</>
  }

  if (pending || !categories) {
    return <>Loading categories..</>
  }

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    if (category != null) {
      onSubmit(category)
    }
  }

  const handleChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const { value } = evt.currentTarget
    const id = Number(value)
    if (isNaN(id)) {
      setCategory(null)
      return
    }

    const category = categories.find((c) => c.id === id)
    if (category != null) {
      setCategory(category)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Add category to movie">
      <label>
        <span>New category</span>
        <select onChange={handleChange}>
          <option>Choose a category</option>
          {categories
            .filter(
              // remove any categories that this movie is already in
              (cat) =>
                existingCategories &&
                !existingCategories?.some((existing) => existing.id == cat.id)
            )
            .map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
        </select>
      </label>
      <button type="submit">Submit</button>
    </form>
  )
}

export default AddCategoryForm
