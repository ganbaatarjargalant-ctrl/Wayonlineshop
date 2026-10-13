import { screen } from '@testing-library/react'
import { renderApp } from '@/test/renderApp'

test('root renders layout with brand', () => {
  renderApp('/')
  expect(screen.getByRole('link', { name: 'Way Academy' })).toBeInTheDocument()
})
