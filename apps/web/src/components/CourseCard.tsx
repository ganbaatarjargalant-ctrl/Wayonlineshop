import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { CourseSummary } from '@/api/types'
import { formatPrice, levelLabel } from '@/lib/format'

export function CourseCard({ course, footer }: { course: CourseSummary; footer?: ReactNode }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-900/5">
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={course.thumbnail}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm">
          {levelLabel[course.level]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-xs font-semibold tracking-wide text-brand-600 uppercase">{course.category}</span>
        <h3 className="leading-snug font-bold text-slate-900">
          <Link to={`/courses/${course.slug}`} className="hover:text-brand-700">
            {course.title}
          </Link>
        </h3>
        <p className="text-sm text-slate-500">{course.instructor.name}</p>
        <div className="mt-auto border-t border-slate-100 pt-3">
          {footer ?? <span className="text-lg font-extrabold text-slate-900">{formatPrice(course.price)}</span>}
        </div>
      </div>
    </article>
  )
}
