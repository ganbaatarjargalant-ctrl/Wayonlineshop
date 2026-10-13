export type Level = 'beginner' | 'intermediate' | 'advanced'

export interface Lesson {
  id: string
  title: string
  durationSec: number
  isPreview: boolean
  /** Зөвхөн preview эсвэл худалдаж авсан хичээлд ирнэ */
  videoUrl?: string
}

export interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  /** Төгрөгөөр, бүхэл тоо */
  price: number
  thumbnail: string
  category: string
  level: Level
  instructor: { name: string; avatar: string; bio: string }
  sections: Section[]
}

export interface User {
  id: string
  name: string
  email: string
}

export interface Order {
  id: string
  courseIds: string[]
  total: number
  status: 'paid'
}

export interface Progress {
  courseId: string
  completedLessonIds: string[]
}

export interface CourseFilter {
  q?: string
  category?: string
  level?: Level
  maxPrice?: number
}
