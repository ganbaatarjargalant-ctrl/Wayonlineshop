import type { Course, CourseFilter, Order, Progress, User } from './types'

export interface AuthResult {
  user: User
  token: string
}

/** Backend-тэй харилцах цорын ганц гэрээ. UI зөвхөн үүгээр дамжина. */
export interface ApiClient {
  getCourses(filter?: CourseFilter): Promise<Course[]>
  getCourse(slug: string): Promise<Course>
  getCategories(): Promise<string[]>
  register(input: { name: string; email: string; password: string }): Promise<AuthResult>
  login(input: { email: string; password: string }): Promise<AuthResult>
  getMe(): Promise<User>
  checkout(courseIds: string[]): Promise<Order>
  getMyCourses(): Promise<Course[]>
  getProgress(courseId: string): Promise<Progress>
  markLessonComplete(courseId: string, lessonId: string): Promise<Progress>
}
