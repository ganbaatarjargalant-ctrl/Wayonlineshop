import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeJSONStorage } from '@/lib/persistStorage'

interface CartState {
  courseIds: string[]
  add(id: string): void
  remove(id: string): void
  clear(): void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      courseIds: [],
      add: (id) => set((s) => (s.courseIds.includes(id) ? s : { courseIds: [...s.courseIds, id] })),
      remove: (id) => set((s) => ({ courseIds: s.courseIds.filter((x) => x !== id) })),
      clear: () => set({ courseIds: [] }),
    }),
    { name: 'way.cart', storage: safeJSONStorage, partialize: (s) => ({ courseIds: s.courseIds }) },
  ),
)
