import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuthStore } from '@/features/auth/authStore'
import { useCartStore } from '@/features/cart/cartStore'
import { loginAs, renderApp } from '@/test/renderApp'
import { ErrorState } from './states'

test('header shows cart count and login link when anonymous', async () => {
  useCartStore.setState({ courseIds: ['c1', 'c2'] })
  renderApp('/')
  expect(screen.getByRole('link', { name: /Сагс/ })).toHaveTextContent('2')
  expect(screen.getByRole('link', { name: 'Нэвтрэх' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Миний хичээлүүд' })).not.toBeInTheDocument()
})

test('header shows my courses and logout when logged in', async () => {
  const { user, api, router } = renderApp('/courses')
  await act(() => loginAs(api, {}))
  expect(await screen.findByRole('link', { name: 'Миний хичээлүүд' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Гарах' }))
  expect(useAuthStore.getState().token).toBeNull()
  expect(router.state.location.pathname).toBe('/')
})

test('unknown route renders 404', () => {
  renderApp('/no-such-page')
  expect(screen.getByText('Хуудас олдсонгүй')).toBeInTheDocument()
})

test('ErrorState calls onRetry', async () => {
  const onRetry = vi.fn()
  render(<ErrorState onRetry={onRetry} />)
  expect(screen.getByText('Алдаа гарлаа')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Дахин оролдох' }))
  expect(onRetry).toHaveBeenCalled()
})
