import type { Course } from '@/api/types'

const lessonIds = (course: Course) => course.sections.flatMap((s) => s.lessons.map((l) => l.id))

export function progressPercent(course: Course, completedIds: string[]): number {
  const ids = lessonIds(course)
  if (ids.length === 0) return 0
  const done = ids.filter((id) => completedIds.includes(id)).length
  return Math.round((done / ids.length) * 100)
}

export function firstLessonId(course: Course): string {
  return lessonIds(course)[0] ?? ''
}

export function nextLessonId(course: Course, lessonId: string): string | null {
  const ids = lessonIds(course)
  const i = ids.indexOf(lessonId)
  return i >= 0 && i < ids.length - 1 ? ids[i + 1]! : null
}

/** Эхний дуусаагүй хичээл; бүгд дууссан бол эхний хичээл */
export function resumeLessonId(course: Course, completedIds: string[]): string {
  return lessonIds(course).find((id) => !completedIds.includes(id)) ?? firstLessonId(course)
}
