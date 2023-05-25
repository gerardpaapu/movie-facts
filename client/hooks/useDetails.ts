import { useEffect } from 'react'
import { Category } from '../../models/Movie'
import { useAppDispatch, useAppSelector } from './redux'
import * as actions from '../actions/details'

function useDetails(id: number) {
  const dispatch = useAppDispatch()
  const {
    loading,
    error,
    data: details,
  } = useAppSelector((state) => state.details)

  useEffect(() => {
    dispatch(actions.fetchMovie(id))
  }, [id, dispatch])

  const deleteCategory = (id: number) => {
    dispatch(actions.deleteCategory(id))
  }
  const addCategory = (c: Category) => {
    dispatch(actions.addCategory(c))
  }

  return { loading, error, details, deleteCategory, addCategory }
}

export default useDetails
