import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useApi } from '@/api/ApiProvider'
import type { CourseFilter } from '@/api/types'

export function useCourses(filter: CourseFilter) {
  const api = useApi()
  return useQuery({
    queryKey: ['courses', filter],
    queryFn: () => api.getCourses(filter),
    placeholderData: keepPreviousData,
  })
}

/** Сагсны хичээлүүд. Бүх каталогийг татахгүй — зөвхөн хэрэгтэй id-ууд. */
export function useCoursesByIds(ids: string[]) {
  const api = useApi()
  return useQuery({
    queryKey: ['coursesByIds', [...ids].sort()],
    queryFn: () => api.getCoursesByIds(ids),
    enabled: ids.length > 0,
  })
}

export function useCategories() {
  const api = useApi()
  return useQuery({ queryKey: ['categories'], queryFn: () => api.getCategories() })
}
