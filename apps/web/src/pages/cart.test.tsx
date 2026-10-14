import { screen, waitFor } from '@testing-library/react'
import { useCartStore } from '@/features/cart/cartStore'
import { buyCourses, loginAs, renderApp, testApi } from '@/test/renderApp'

test('cart lists items with total and remove', async () => {
  useCartStore.setState({ courseIds: ['c1', 'c2'] })
  const { user } = renderApp('/cart')
  expect(await screen.findByText('Нийт: 88,000₮')).toBeInTheDocument()
  await user.click(screen.getAllByRole('button', { name: 'Хасах' })[0]!)
  expect(await screen.findByText('Нийт: 39,000₮')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Төлбөр төлөх' })).toHaveAttribute('href', '/checkout')
})

test('empty cart message', async () => {
  renderApp('/cart')
  expect(await screen.findByText('Таны сагс хоосон байна')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Төлбөр төлөх' })).not.toBeInTheDocument()
})

test('cart hides owned and unknown ids', async () => {
  const api = testApi()
  await loginAs(api, {})
  await buyCourses(api, ['c1'])
  useCartStore.setState({ courseIds: ['c1', 'c2', 'ghost'] })
  renderApp('/cart', { api })
  expect(await screen.findByText('Нийт: 39,000₮')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'React эхлэл' })).not.toBeInTheDocument()
})

test('checkout creates one order even on double click, then lands on my courses', async () => {
  const api = testApi()
  await loginAs(api, {})
  const spy = vi.spyOn(api, 'checkout')
  useCartStore.setState({ courseIds: ['c1'] })
  const { user, router } = renderApp('/checkout', { api })
  expect(await screen.findByText('Нийт: 49,000₮')).toBeInTheDocument()
  await user.dblClick(await screen.findByRole('button', { name: 'QPay-ээр төлөх' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/my-courses'))
  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(['c1'])
  expect(useCartStore.getState().courseIds).toEqual([])
})

test('while payment is pending the QR and waiting notice stay on screen', async () => {
  // Fake провайдер 2 шалгалтын дараа л төлнө — "хүлээж байна" төлвийг барьж харах боломж
  const api = testApi({ payAfterPolls: 2 })
  await loginAs(api, {})
  useCartStore.setState({ courseIds: ['c1'] })
  const { user, router } = renderApp('/checkout', { api })
  await user.click(await screen.findByRole('button', { name: 'QPay-ээр төлөх' }))
  expect(await screen.findByRole('img', { name: 'QPay QR код' })).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Төлбөрийг хүлээж байна')
  expect(router.state.location.pathname).toBe('/checkout')
  expect(useCartStore.getState().courseIds).toEqual(['c1'])
})

test('a failed payment shows an error and lets the user retry', async () => {
  const api = testApi()
  await loginAs(api, {})
  vi.spyOn(api, 'getOrder').mockResolvedValue({ id: 'o1', courseIds: ['c1'], total: 49000, status: 'failed' })
  useCartStore.setState({ courseIds: ['c1'] })
  const { user, router } = renderApp('/checkout', { api })
  await user.click(await screen.findByRole('button', { name: 'QPay-ээр төлөх' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Төлбөр амжилтгүй боллоо')
  expect(router.state.location.pathname).toBe('/checkout')
  await user.click(screen.getByRole('button', { name: 'Дахин оролдох' }))
  expect(await screen.findByRole('button', { name: 'QPay-ээр төлөх' })).toBeInTheDocument()
})

test('checkout with empty cart goes back to cart', async () => {
  const api = testApi()
  await loginAs(api, {})
  const { router } = renderApp('/checkout', { api })
  await waitFor(() => expect(router.state.location.pathname).toBe('/cart'))
})

test('checkout requires login', async () => {
  useCartStore.setState({ courseIds: ['c1'] })
  const { router } = renderApp('/checkout')
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
})
