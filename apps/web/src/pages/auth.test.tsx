import { screen, waitFor } from '@testing-library/react'
import { useAuthStore } from '@/features/auth/authStore'
import { renderApp, testApi } from '@/test/renderApp'

test('protected route redirects to login with redirect param', async () => {
  const { router } = renderApp('/my-courses')
  await screen.findByRole('button', { name: 'Нэвтрэх' })
  expect(router.state.location.pathname).toBe('/login')
  expect(new URLSearchParams(router.state.location.search).get('redirect')).toBe('/my-courses')
})

test('register validates fields in Mongolian', async () => {
  const { user } = renderApp('/register')
  await user.type(screen.getByLabelText('Имэйл'), 'bad')
  await user.type(screen.getByLabelText('Нууц үг'), '123')
  await user.click(screen.getByRole('button', { name: 'Бүртгүүлэх' }))
  expect(screen.getByText('Нэрээ оруулна уу')).toBeInTheDocument()
  expect(screen.getByText('Имэйл буруу байна')).toBeInTheDocument()
  expect(screen.getByText('Нууц үг хамгийн багадаа 6 тэмдэгт байна')).toBeInTheDocument()
})

test('register then lands on redirect target', async () => {
  const { user, router } = renderApp('/register?redirect=%2Fcart')
  await user.type(screen.getByLabelText('Нэр'), 'Бат')
  await user.type(screen.getByLabelText('Имэйл'), 'bat@test.mn')
  await user.type(screen.getByLabelText('Нууц үг'), 'secret1')
  await user.click(screen.getByRole('button', { name: 'Бүртгүүлэх' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/cart'))
  expect(useAuthStore.getState().user?.name).toBe('Бат')
})

test('login page links to register keeping redirect', async () => {
  renderApp('/login?redirect=%2Fcheckout')
  expect(screen.getByRole('link', { name: 'Бүртгүүлэх' })).toHaveAttribute('href', '/register?redirect=%2Fcheckout')
})

test('duplicate email shows API error on register', async () => {
  const api = testApi()
  await api.register({ name: 'A', email: 'a@test.mn', password: 'secret1' })
  const { user } = renderApp('/register', { api })
  await user.type(screen.getByLabelText('Нэр'), 'Б')
  await user.type(screen.getByLabelText('Имэйл'), 'a@test.mn')
  await user.type(screen.getByLabelText('Нууц үг'), 'secret1')
  await user.click(screen.getByRole('button', { name: 'Бүртгүүлэх' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Энэ имэйл бүртгэлтэй байна')
})

test('wrong password shows API error', async () => {
  const api = testApi()
  await api.register({ name: 'A', email: 'a@test.mn', password: 'secret1' })
  const { user } = renderApp('/login', { api })
  await user.type(screen.getByLabelText('Имэйл'), 'a@test.mn')
  await user.type(screen.getByLabelText('Нууц үг'), 'wrong00')
  await user.click(screen.getByRole('button', { name: 'Нэвтрэх' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Имэйл эсвэл нууц үг буруу байна')
})

test('external redirect param is ignored after login', async () => {
  const api = testApi()
  await api.register({ name: 'A', email: 'a@test.mn', password: 'secret1' })
  const { user, router } = renderApp('/login?redirect=https%3A%2F%2Fevil.com', { api })
  await user.type(screen.getByLabelText('Имэйл'), 'a@test.mn')
  await user.type(screen.getByLabelText('Нууц үг'), 'secret1')
  await user.click(screen.getByRole('button', { name: 'Нэвтрэх' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  expect(useAuthStore.getState().token).not.toBeNull()
})
