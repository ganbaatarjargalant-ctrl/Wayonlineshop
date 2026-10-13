import type { Course } from '@/api/types'
import { useAuthStore } from '@/features/auth/authStore'
import { useCourses } from '@/features/catalog/queries'
import { useMyCourses } from '@/features/course/queries'
import { useCartStore } from './cartStore'

/** Сагсны id-уудыг хичээл болгоно: байхгүй болон аль хэдийн худалдаж авсан хичээлийг хасна */
export function useCartCourses(): {
  courses: Course[]
  total: number
  isLoading: boolean
  isError: boolean
  refetch: () => void
} {
  const courseIds = useCartStore((s) => s.courseIds)
  const token = useAuthStore((s) => s.token)
  const all = useCourses({})
  const mine = useMyCourses({ enabled: !!token })

  const owned = new Set((mine.data ?? []).map((c) => c.id))
  const byId = new Map((all.data ?? []).map((c) => [c.id, c]))
  const courses = courseIds.flatMap((id) => {
    const c = byId.get(id)
    return c && !owned.has(id) ? [c] : []
  })

  return {
    courses,
    total: courses.reduce((sum, c) => sum + c.price, 0),
    isLoading: (all.isPending && !all.isError) || (!!token && mine.isPending && !mine.isError),
    isError: all.isError || mine.isError,
    refetch: () => {
      if (all.isError) void all.refetch()
      if (mine.isError) void mine.refetch()
    },
  }
}
