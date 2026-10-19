import { screen, waitFor } from '@testing-library/react'
import { ApiError } from '@/api/errors'
import { renderApp, testApi } from '@/test/renderApp'

test('home shows featured courses and category links', async () => {
  renderApp('/')
  expect(await screen.findByRole('link', { name: 'React эхлэл' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Хичээлүүдийг үзэх' })).toHaveAttribute('href', '/courses')
  expect(screen.getByRole('link', { name: 'Дизайн' })).toHaveAttribute('href', `/courses?category=${encodeURIComponent('Дизайн')}`)
})

test('catalog reads category from URL', async () => {
  renderApp('/courses?category=Дизайн')
  expect(await screen.findByRole('link', { name: 'Figma үндэс' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'React эхлэл' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Ангилал')).toHaveValue('Дизайн')
})

test('price filter reads maxPrice from URL', async () => {
  renderApp('/courses?maxPrice=39000')
  expect(await screen.findByRole('link', { name: 'Figma үндэс' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'React эхлэл' })).not.toBeInTheDocument()
})

test('choosing level updates URL', async () => {
  const { user, router } = renderApp('/courses')
  await screen.findByRole('link', { name: 'React эхлэл' })
  await user.selectOptions(screen.getByLabelText('Түвшин'), 'Ахисан шат')
  await waitFor(() => expect(screen.queryByRole('link', { name: 'React эхлэл' })).not.toBeInTheDocument())
  expect(router.state.location.search).toContain('level=advanced')
})

test('typing in search updates URL and results', async () => {
  const { user, router } = renderApp('/courses')
  await screen.findByRole('link', { name: 'React эхлэл' })
  await user.type(screen.getByLabelText('Хайх'), 'figma')
  expect(await screen.findByRole('link', { name: 'Figma үндэс' })).toBeInTheDocument()
  await waitFor(() => expect(screen.queryByRole('link', { name: 'React эхлэл' })).not.toBeInTheDocument())
  expect(router.state.location.search).toContain('q=figma')
})

test('no results shows empty state', async () => {
  renderApp('/courses?q=zzzzzz')
  expect(await screen.findByText('Хайлтад тохирох хичээл олдсонгүй')).toBeInTheDocument()
})

test('api failure shows error state with retry', async () => {
  const api = testApi()
  api.getCourses = vi
    .fn()
    .mockRejectedValueOnce(new ApiError('UNKNOWN', 'x'))
    .mockResolvedValue({ items: [], total: 0, page: 1, limit: 6 })
  const { user } = renderApp('/courses', { api })
  await user.click(await screen.findByRole('button', { name: 'Дахин оролдох' }))
  expect(await screen.findByText('Хайлтад тохирох хичээл олдсонгүй')).toBeInTheDocument()
})

test('catalog paginates: 8 courses across 2 pages', async () => {
  const { user, router } = renderApp('/courses')
  expect(await screen.findByText('Хуудас 1 / 2')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Өмнөх' })).toBeDisabled()
  expect(screen.getByRole('link', { name: 'React эхлэл' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Дараах' }))
  expect(await screen.findByText('Хуудас 2 / 2')).toBeInTheDocument()
  expect(router.state.location.search).toContain('page=2')
  expect(screen.queryByRole('link', { name: 'React эхлэл' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Дараах' })).toBeDisabled()
})

test('catalog reads page from URL', async () => {
  renderApp('/courses?page=2')
  expect(await screen.findByText('Хуудас 2 / 2')).toBeInTheDocument()
})

test('changing a filter resets back to page 1', async () => {
  const { user, router } = renderApp('/courses?page=2')
  await screen.findByText('Хуудас 2 / 2')
  await user.selectOptions(screen.getByLabelText('Ангилал'), 'Дизайн')
  await waitFor(() => expect(router.state.location.search).not.toContain('page=2'))
  expect(await screen.findByRole('link', { name: 'Figma үндэс' })).toBeInTheDocument()
})

test('a single page of results shows no pagination', async () => {
  renderApp('/courses?category=Дизайн')
  expect(await screen.findByRole('link', { name: 'Figma үндэс' })).toBeInTheDocument()
  expect(screen.queryByRole('navigation', { name: 'Хуудаслалт' })).not.toBeInTheDocument()
})
