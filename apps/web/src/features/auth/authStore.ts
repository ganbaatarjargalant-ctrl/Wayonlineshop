import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/api/types'
import { safeJSONStorage } from '@/lib/persistStorage'

interface AuthState {
  user: User | null
  token: string | null
  setSession(user: User, token: string): void
  clear(): void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      clear: () => set({ user: null, token: null }),
    }),
    { name: 'way.auth', storage: safeJSONStorage, partialize: (s) => ({ user: s.user, token: s.token }) },
  ),
)
