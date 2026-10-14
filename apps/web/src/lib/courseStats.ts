import type { Course } from '@/api/types'

/**
 * Хичээлийн бүтцээс гаргадаг цэвэр тооцоолол.
 * `lib/`-д байгаа шалтгаан: mock API (`api/`) болон UI (`features/`, `pages/`)
 * хоёулаа хэрэглэдэг тул аль нэг feature-д байвал хамаарал нь урвуу болно.
 * Бодит backend ирэхэд явцын тооцоо сервер тал руу шилжинэ — эдгээр функц
 * тэр үед зөвхөн UI-ийн хэрэгцээнд (дараагийн хичээл г.м.) үлдэнэ.
 */

export const lessonIds = (course: Course): string[] => course.sections.flatMap((s) => s.lessons.map((l) => l.id))

export function lessonCount(course: Course): number {
  return lessonIds(course).length
}

export function totalDurationSec(course: Course): number {
  return course.sections.reduce((sum, s) => sum + s.lessons.reduce((a, l) => a + l.durationSec, 0), 0)
}

/** 0–100 бүхэл тоо. Хичээл байхгүй бол 0. Танихгүй id-уудыг үл хэрэгсэнэ. */
export function progressPercent(course: Course, completedIds: string[]): number {
  const ids = lessonIds(course)
  if (ids.length === 0) return 0
  const done = ids.filter((id) => completedIds.includes(id)).length
  return Math.round((done / ids.length) * 100)
}

export function firstLessonId(course: Course): string | null {
  return lessonIds(course)[0] ?? null
}

export function nextLessonId(course: Course, lessonId: string): string | null {
  const ids = lessonIds(course)
  const i = ids.indexOf(lessonId)
  return i >= 0 && i < ids.length - 1 ? ids[i + 1]! : null
}

/** Эхний дуусаагүй хичээл; бүгд дууссан бол эхний хичээл; хичээл байхгүй бол null */
export function resumeLessonId(course: Course, completedIds: string[]): string | null {
  return lessonIds(course).find((id) => !completedIds.includes(id)) ?? firstLessonId(course)
}
