import { ApiError } from '@/api/errors'
import { createApi } from '@/api/createApi'
import { createQueryClient } from './queryClient'

test('UNAUTHORIZED query error triggers onUnauthorized', async () => {
  const onUnauth = vi.fn()
  const qc = createQueryClient(onUnauth, { retry: false })
  await qc
    .fetchQuery({ queryKey: ['x'], queryFn: () => Promise.reject(new ApiError('UNAUTHORIZED', 'x')) })
    .catch(() => {})
  expect(onUnauth).toHaveBeenCalledOnce()
})

test('other errors do not trigger onUnauthorized', async () => {
  const onUnauth = vi.fn()
  const qc = createQueryClient(onUnauth, { retry: false })
  await qc.fetchQuery({ queryKey: ['y'], queryFn: () => Promise.reject(new ApiError('NOT_FOUND', 'x')) }).catch(() => {})
  expect(onUnauth).not.toHaveBeenCalled()
})

test('UNAUTHORIZED mutation error triggers onUnauthorized', async () => {
  const onUnauth = vi.fn()
  const qc = createQueryClient(onUnauth, { retry: false })
  const m = qc.getMutationCache().build(qc, { mutationFn: () => Promise.reject(new ApiError('UNAUTHORIZED', 'x')) })
  await m.execute(undefined).catch(() => {})
  expect(onUnauth).toHaveBeenCalledOnce()
})

test('createApi throws for http mode', () => {
  expect(() => createApi({ VITE_API_MODE: 'http' })).toThrow('HTTP API хараахан хэрэгжээгүй')
})

test('createApi defaults to mock', async () => {
  const api = createApi({ VITE_MOCK_DELAY: '0' })
  expect(await api.getCategories()).toHaveLength(4)
})
