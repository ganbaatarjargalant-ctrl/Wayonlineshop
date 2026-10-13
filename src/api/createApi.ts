import { useAuthStore } from '@/features/auth/authStore'
import type { ApiClient } from './client'
import { createMockApi } from './mock/mockApi'

export function createApi(env: { VITE_API_MODE?: string; VITE_MOCK_DELAY?: string }): ApiClient {
  const mode = env.VITE_API_MODE ?? 'mock'
  if (mode !== 'mock') throw new Error('HTTP API хараахан хэрэгжээгүй')
  return createMockApi({
    storage: localStorage,
    getToken: () => useAuthStore.getState().token,
    delay: env.VITE_MOCK_DELAY !== undefined ? Number(env.VITE_MOCK_DELAY) : [200, 500],
  })
}
