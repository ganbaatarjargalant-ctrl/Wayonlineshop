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
  api.getCourses = vi.fn().mockRejectedValueOnce(new ApiError('UNKNOWN', 'x')).mockResolvedValue([])
  const { user } = renderApp('/courses', { api })
  await user.click(await screen.findByRole('button', { name: 'Дахин оролдох' }))
  expect(await screen.findByText('Хайлтад тохирох хичээл олдсонгүй')).toBeInTheDocument()
})
