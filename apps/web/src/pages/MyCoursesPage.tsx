import { Link } from 'react-router'
import type { MyCourse } from '@/api/types'
import { buttonClass } from '@/components/Button'
import { CourseCard } from '@/components/CourseCard'
import { EmptyState, ErrorState, Skeleton } from '@/components/states'
import { useMyCourses } from '@/features/course/queries'

/**
 * Явцыг сервер тооцоолж `MyCourse`-д хамт буцаадаг тул карт тутамд
 * тусдаа хүсэлт гардаггүй (өмнө нь 1 + N хүсэлт болдог байсан).
 */
function progressFooter(course: MyCourse) {
  return (
    <div className="space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${course.progressPercent}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">Явц: {course.progressPercent}%</span>
        {course.resumeLessonId && (
          <Link to={`/learn/${course.slug}/${course.resumeLessonId}`} className={buttonClass()}>
            Үргэлжлүүлэх
          </Link>
        )}
      </div>
    </div>
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
            <CourseCard key={c.id} course={c} footer={progressFooter(c)} />
          ))}
        </div>
      )}
    </section>
  )
}
