import { useAuthStore } from './authStore'

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null })
})

test('setSession and clear', () => {
  useAuthStore.getState().setSession({ id: 'u', name: 'A', email: 'a@x.mn' }, 't')
  expect(useAuthStore.getState().token).toBe('t')
  expect(localStorage.getItem('way.auth')).toContain('"t"')
  useAuthStore.getState().clear()
  expect(useAuthStore.getState()).toMatchObject({ user: null, token: null })
})

test('corrupted way.auth rehydrates to logged out', async () => {
  localStorage.setItem('way.auth', '{bad')
  await useAuthStore.persist.rehydrate()
  expect(useAuthStore.getState()).toMatchObject({ user: null, token: null })
})
