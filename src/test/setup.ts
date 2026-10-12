import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'
import { useAuthStore } from '@/features/auth/authStore'
import { useCartStore } from '@/features/cart/cartStore'

expect.extend(matchers)

afterEach(() => {
  cleanup()
  // Store-уудын санах ойн төлөвийг цэвэрлээд дараа нь localStorage-ийг хоосолно
  useAuthStore.setState({ user: null, token: null })
  useCartStore.setState({ courseIds: [] })
  localStorage.clear()
})
