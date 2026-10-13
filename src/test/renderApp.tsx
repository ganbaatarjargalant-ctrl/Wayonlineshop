import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { ApiClient } from '@/api/client'
import { createMockApi } from '@/api/mock/mockApi'
import type { User } from '@/api/types'
import { Providers } from '@/app/Providers'
import { createQueryClient } from '@/app/queryClient'
import { routes } from '@/app/routes'
import { useAuthStore } from '@/features/auth/authStore'

export function testApi(): ApiClient {
  return createMockApi({ storage: localStorage, getToken: () => useAuthStore.getState().token, delay: 0 })
}

export function renderApp(path: string, opts: { api?: ApiClient } = {}) {
  const api = opts.api ?? testApi()
  const queryClient = createQueryClient(() => useAuthStore.getState().clear(), { retry: false })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  render(
    <Providers api={api} queryClient={queryClient}>
      <RouterProvider router={router} />
    </Providers>,
  )
  return { user, api, router, queryClient }
}

export async function loginAs(
  api: ApiClient,
  { name = 'Тест', email = 'test@test.mn', password = 'secret1' }: { name?: string; email?: string; password?: string },
): Promise<User> {
  const { user, token } = await api.register({ name, email, password })
  useAuthStore.getState().setSession(user, token)
  return user
}
