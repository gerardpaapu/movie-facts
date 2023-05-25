import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'

import Home from './components/Home'
import MovieList from './components/MovieList'
import Movie from './components/Movie'
import CategoryList from './components/CategoryList'
import Category from './components/Category'
import Search from './components/Search'
import AppLayout from './components/AppLayout'

export const routes = createRoutesFromElements(
  <Route element={<AppLayout />}>
    <Route index element={<Home />} />
    <Route path="/movie">
      <Route index element={<MovieList />} />
      <Route path=":id" element={<Movie />} />
    </Route>
    <Route path="/category">
      <Route index element={<CategoryList />} />
      <Route path=":id" element={<Category />} />
    </Route>
    <Route path="/search" element={<Search />} />
  </Route>
)

export const router = createBrowserRouter(routes)
