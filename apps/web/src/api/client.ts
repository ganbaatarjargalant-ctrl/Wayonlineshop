import type {
  Course,
  CourseFilter,
  CourseSummary,
  MyCourse,
  Order,
  Paginated,
  PaymentIntent,
  Progress,
  User,
} from './types'

export interface AuthResult {
  user: User
  token: string
}

/** Backend-тэй харилцах цорын ганц гэрээ. UI зөвхөн үүгээр дамжина. */
export interface ApiClient {
  getCourses(filter?: CourseFilter): Promise<Paginated<CourseSummary>>
  /** Сагсны id-ууд. Бүх каталогийг татахгүйн тулд. */
  getCoursesByIds(ids: string[]): Promise<CourseSummary[]>
  getCourse(slug: string): Promise<Course>
  getCategories(): Promise<string[]>
  register(input: { name: string; email: string; password: string }): Promise<AuthResult>
  login(input: { email: string; password: string }): Promise<AuthResult>
  getMe(): Promise<User>
  /** Захиалга `pending`-ээр үүсгэж QR буцаана. Төлбөр хийгдээгүй. */
  checkout(courseIds: string[]): Promise<PaymentIntent>
  /** Төлбөрийн статусыг хянах. Зөвхөн өөрийн захиалга. */
  getOrder(orderId: string): Promise<Order>
  getMyCourses(): Promise<MyCourse[]>
  getProgress(courseId: string): Promise<Progress>
  markLessonComplete(courseId: string, lessonId: string): Promise<Progress>
}
