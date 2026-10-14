import { createJSONStorage } from 'zustand/middleware'

/** Эвдэрсэн JSON-ийг null гэж уншдаг localStorage — app унахгүй, анхдагч төлөвөөр эхэлнэ */
export const safeJSONStorage = createJSONStorage(() => ({
  getItem(key: string) {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    try {
      JSON.parse(raw)
      return raw
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
}))
