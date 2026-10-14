import type { CourseSummary } from '@/api/types'
import { useAuthStore } from '@/features/auth/authStore'
import { useCoursesByIds } from '@/features/catalog/queries'
import { useMyCourses } from '@/features/course/queries'
import { useCartStore } from './cartStore'

/** Сагсны id-уудыг хичээл болгоно: байхгүй болон аль хэдийн худалдаж авсан хичээлийг хасна */
export function useCartCourses(): {
  courses: CourseSummary[]
  total: number
  isLoading: boolean
  isError: boolean
  refetch: () => void
} {
  const courseIds = useCartStore((s) => s.courseIds)
  const token = useAuthStore((s) => s.token)
  // Зөвхөн сагсны id-ууд татагдана — бүх каталог биш
  const cart = useCoursesByIds(courseIds)
  const mine = useMyCourses({ enabled: !!token })

  const owned = new Set((mine.data ?? []).map((c) => c.id))
  const byId = new Map((cart.data ?? []).map((c) => [c.id, c]))
  const courses = courseIds.flatMap((id) => {
    const c = byId.get(id)
    return c && !owned.has(id) ? [c] : []
  })

  return {
    courses,
    total: courses.reduce((sum, c) => sum + c.price, 0),
    // isPending биш isLoading — хоосон сагсанд query идэвхгүй байхад мөнхийн "ачаалж байна" болохоос сэргийлнэ
    isLoading: cart.isLoading || (!!token && mine.isLoading),
    isError: cart.isError || mine.isError,
    refetch: () => {
      if (cart.isError) void cart.refetch()
      if (mine.isError) void mine.refetch()
    },
  }
}
