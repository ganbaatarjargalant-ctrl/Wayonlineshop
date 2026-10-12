import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from './routes'

test('root renders layout with brand', () => {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/'] })} />)
  expect(screen.getByText('Way Academy')).toBeInTheDocument()
})
