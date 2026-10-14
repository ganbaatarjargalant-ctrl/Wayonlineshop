import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/api/errors'

export function createQueryClient(onUnauthorized: () => void, opts: { retry?: boolean | number } = {}): QueryClient {
  const onError = (e: unknown) => {
    if (isApiError(e) && e.code === 'UNAUTHORIZED') onUnauthorized()
  }
  const retry = opts.retry ?? 1
  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: { queries: { retry }, mutations: { retry: false } },
  })
}
