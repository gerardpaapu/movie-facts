import { afterEach, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { initialiseStore } from './store'
import matchers from '@testing-library/jest-dom/matchers'
import { routes } from './routes'

expect.extend(matchers)

afterEach(cleanup)

export function setup(location = '/') {
  const router = createMemoryRouter(routes, {
    initialEntries: [location],
  })

  const container = render(
    <Provider store={initialiseStore()}>
      <RouterProvider router={router} />
    </Provider>
  )

  const user = userEvent.setup()
  return { user, ...container }
}
