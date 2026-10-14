import { screen, waitFor } from '@testing-library/react'
import { useCartStore } from '@/features/cart/cartStore'
import { loginAs, renderApp, testApi } from '@/test/renderApp'

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
  await api.checkout(['c1'])
  useCartStore.setState({ courseIds: ['c1', 'c2', 'ghost'] })
  renderApp('/cart', { api })
  expect(await screen.findByText('Нийт: 39,000₮')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'React эхлэл' })).not.toBeInTheDocument()
})

test('checkout pays once even on double click, clears cart, goes to my courses', async () => {
  const api = testApi()
  await loginAs(api, {})
  const spy = vi.spyOn(api, 'checkout')
  useCartStore.setState({ courseIds: ['c1'] })
  const { user, router } = renderApp('/checkout', { api })
  expect(await screen.findByLabelText('QPay QR код')).toBeInTheDocument()
  expect(screen.getByText('Нийт: 49,000₮')).toBeInTheDocument()
  const btn = await screen.findByRole('button', { name: 'Төлсөн' })
  await user.dblClick(btn)
  await waitFor(() => expect(router.state.location.pathname).toBe('/my-courses'))
  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(['c1'])
  expect(useCartStore.getState().courseIds).toEqual([])
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
