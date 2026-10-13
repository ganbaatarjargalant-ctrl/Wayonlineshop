import type { ReactNode } from 'react'
import type { Course, Lesson } from '@/api/types'
import { formatDuration } from '@/lib/format'

export function CurriculumList({
  course,
  activeLessonId,
  completedIds = [],
  renderTitle,
  renderAction,
}: {
  course: Course
  activeLessonId?: string
  completedIds?: string[]
  renderTitle?: (lesson: Lesson) => ReactNode
  renderAction?: (lesson: Lesson) => ReactNode
}) {
  return (
    <div className="space-y-4">
      {course.sections.map((section) => (
        <div key={section.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold">{section.title}</h3>
          <ul>
            {section.lessons.map((lesson) => {
              const done = completedIds.includes(lesson.id)
              return (
                <li
                  key={lesson.id}
                  aria-current={lesson.id === activeLessonId ? 'true' : undefined}
                  className={`flex items-center gap-3 px-4 py-2 text-sm ${lesson.id === activeLessonId ? 'bg-indigo-50' : ''}`}
                >
                  <span className={`w-4 ${done ? 'text-green-600' : 'text-slate-300'}`} aria-label={done ? 'Дууссан' : undefined}>
                    {done ? '✓' : '•'}
                  </span>
                  <span className="flex-1">{renderTitle ? renderTitle(lesson) : lesson.title}</span>
                  {renderAction?.(lesson)}
                  <span className="text-slate-500">{formatDuration(lesson.durationSec)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
