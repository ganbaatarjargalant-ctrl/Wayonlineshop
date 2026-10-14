import { useAuthStore } from '@/features/auth/authStore'
import type { ApiClient } from './client'
import { createMockApi } from './mock/mockApi'
import { createQpayPayments } from './qpay'

export function createApi(env: {
  VITE_API_MODE?: string
  VITE_MOCK_DELAY?: string
  VITE_PAYMENT_MODE?: string
}): ApiClient {
  const mode = env.VITE_API_MODE ?? 'mock'
  if (mode !== 'mock') throw new Error('HTTP API хараахан хэрэгжээгүй')
  const api = createMockApi({
    storage: localStorage,
    getToken: () => useAuthStore.getState().token,
    delay: env.VITE_MOCK_DELAY !== undefined ? Number(env.VITE_MOCK_DELAY) : [200, 500],
  })
  // Төлбөр нь dev серверийн /api/qpay middleware-ээр бодит QPay руу явна, бусад нь mock хэвээр
  return (env.VITE_PAYMENT_MODE ?? 'qpay') === 'qpay' ? { ...api, ...createQpayPayments() } : api
}
