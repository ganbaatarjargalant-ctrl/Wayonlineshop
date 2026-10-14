import { Link } from 'react-router'
import type { Course } from '@/api/types'
import { buttonClass } from '@/components/Button'
import { CourseCard } from '@/components/CourseCard'
import { EmptyState, ErrorState, Skeleton } from '@/components/states'
import { useMyCourses } from '@/features/course/queries'
import { progressPercent, resumeLessonId } from '@/features/learning/progress'
import { useProgress } from '@/features/learning/queries'

function MyCourseItem({ course }: { course: Course }) {
  const { data } = useProgress(course.id, { enabled: true })
  const completed = data?.completedLessonIds ?? []
  const percent = progressPercent(course, completed)

  return (
    <CourseCard
      course={course}
      footer={
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Явц: {percent}%</span>
            <Link to={`/learn/${course.slug}/${resumeLessonId(course, completed)}`} className={buttonClass()}>
              Үргэлжлүүлэх
            </Link>
          </div>
        </div>
      }
    />
  )
}

export function MyCoursesPage() {
  const { data, isPending, isError, refetch } = useMyCourses({ enabled: true })

  return (
    <section>
      <h1 className="mb-4 text-2xl font-extrabold">Миний хичээлүүд</h1>
      {isPending ? (
        <Skeleton count={3} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState message="Та одоогоор хичээл худалдаж аваагүй байна" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <MyCourseItem key={c.id} course={c} />
          ))}
        </div>
      )}
    </section>
  )
}
