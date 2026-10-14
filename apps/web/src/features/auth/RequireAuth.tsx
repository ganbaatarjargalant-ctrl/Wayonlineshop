import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuthStore } from './authStore'

export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const { pathname, search } = useLocation()
  if (!token) return <Navigate to={`/login?redirect=${encodeURIComponent(pathname + search)}`} replace />
  return <>{children}</>
}
