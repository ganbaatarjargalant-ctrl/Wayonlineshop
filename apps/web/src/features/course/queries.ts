import { useQuery } from '@tanstack/react-query'
import { useApi } from '@/api/ApiProvider'

export function useCourse(slug: string) {
  const api = useApi()
  return useQuery({ queryKey: ['course', slug], queryFn: () => api.getCourse(slug) })
}

export function useMyCourses({ enabled }: { enabled: boolean }) {
  const api = useApi()
  return useQuery({ queryKey: ['myCourses'], queryFn: () => api.getMyCourses(), enabled })
}
