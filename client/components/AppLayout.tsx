import { Link, Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <>
      <header className="header">
        <h1>Movie Facts</h1>
      </header>
      <Navigation />
      <section className="main">
        <Outlet />
      </section>
    </>
  )
}

function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/movie">All movies</Link>
        </li>

        <li>
          <Link to="/category">All categories</Link>
        </li>
        <li>
          <Link to="/search">Search</Link>
        </li>
      </ul>
    </nav>
  )
}
