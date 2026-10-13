import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { ApiProvider } from '@/api/ApiProvider'
import type { ApiClient } from '@/api/client'
import { useAuthStore } from '@/features/auth/authStore'

export function Providers({ api, queryClient, children }: { api: ApiClient; queryClient: QueryClient; children: ReactNode }) {
  // Хэрэглэгч солигдох бүрд (нэвтрэх, гарах, UNAUTHORIZED) өмнөх хэрэглэгчийн өгөгдлийг cache-ээс арилгана
  useEffect(
    () =>
      useAuthStore.subscribe((state, prev) => {
        if (state.token !== prev.token) void queryClient.resetQueries()
      }),
    [queryClient],
  )

  return (
    <ApiProvider api={api}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiProvider>
  )
}
