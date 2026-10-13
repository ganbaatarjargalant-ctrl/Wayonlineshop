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

export function useCategories() {
  const api = useApi()
  return useQuery({ queryKey: ['categories'], queryFn: () => api.getCategories() })
}
