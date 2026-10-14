import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Course } from '@/api/types'
import { formatPrice, levelLabel } from '@/lib/format'

export function CourseCard({ course, footer }: { course: Course; footer?: ReactNode }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <img src={course.thumbnail} alt="" className="aspect-video w-full object-cover" loading="lazy" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium text-indigo-600">
          {course.category} · {levelLabel[course.level]}
        </span>
        <h3 className="font-semibold leading-snug">
          <Link to={`/courses/${course.slug}`} className="hover:underline">
            {course.title}
          </Link>
        </h3>
        <p className="text-sm text-slate-500">{course.instructor.name}</p>
        <div className="mt-auto pt-2">{footer ?? <span className="font-bold">{formatPrice(course.price)}</span>}</div>
      </div>
    </article>
  )
}
