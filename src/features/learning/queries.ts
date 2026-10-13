import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/api/ApiProvider'

export function useProgress(courseId: string, { enabled }: { enabled: boolean }) {
  const api = useApi()
  return useQuery({ queryKey: ['progress', courseId], queryFn: () => api.getProgress(courseId), enabled })
}

export function useMarkComplete(courseId: string) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lessonId: string) => api.markLessonComplete(courseId, lessonId),
    onSuccess: (progress) => queryClient.setQueryData(['progress', courseId], progress),
  })
}
