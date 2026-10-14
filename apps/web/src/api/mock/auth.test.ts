import { createMockApi } from './mockApi'

let token: string | null = null
const api = () => createMockApi({ storage: localStorage, getToken: () => token, delay: 0 })

beforeEach(() => {
  token = null
})

test('register returns user and mock token', async () => {
  const r = await api().register({ name: 'Бат', email: 'bat@test.mn', password: 'secret1' })
  expect(r.user).toMatchObject({ name: 'Бат', email: 'bat@test.mn' })
  expect(r.user).not.toHaveProperty('password')
  expect(r.token).toBe(`mock-token-${r.user.id}`)
})

test('register rejects duplicate email (case-insensitive) with VALIDATION', async () => {
  await api().register({ name: 'A', email: 'a@test.mn', password: 'secret1' })
  await expect(api().register({ name: 'B', email: 'A@test.mn', password: 'secret1' })).rejects.toMatchObject({
    code: 'VALIDATION',
    message: 'Энэ имэйл бүртгэлтэй байна',
  })
})

test('login with correct password returns same user', async () => {
  const r = await api().register({ name: 'A', email: 'a@test.mn', password: 'secret1' })
  const l = await api().login({ email: 'A@Test.mn', password: 'secret1' })
  expect(l.user).toEqual(r.user)
  expect(l.token).toBe(r.token)
})

test('login with wrong password → UNAUTHORIZED', async () => {
  await api().register({ name: 'A', email: 'a@test.mn', password: 'secret1' })
  await expect(api().login({ email: 'a@test.mn', password: 'wrong00' })).rejects.toMatchObject({
    code: 'UNAUTHORIZED',
    message: 'Имэйл эсвэл нууц үг буруу байна',
  })
})

test('getMe uses token; no token → UNAUTHORIZED', async () => {
  await expect(api().getMe()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  const r = await api().register({ name: 'A', email: 'a@test.mn', password: 'secret1' })
  token = r.token
  expect(await api().getMe()).toEqual(r.user)
})

test('unknown token → UNAUTHORIZED', async () => {
  token = 'mock-token-ghost'
  await expect(api().getMe()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
})
