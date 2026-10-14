import type { Course, CourseFilter, Order, Progress, User } from './types'

/** Банкны аппын deeplink (утсан дээр QR-ийг өөрөө уншуулж чадахгүй үед) */
export interface BankApp {
  name: string
  description: string
  logo: string
  link: string
}

export interface PaymentInvoice {
  invoiceId: string
  amount: number
  /** data-URI PNG; mock горимд null */
  qrImage: string | null
  shortUrl: string | null
  bankApps: BankApp[]
  /** Sandbox/mock — "туршилтаар төлсөн" товч харуулна */
  testMode: boolean
}

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
  createPayment(input: { amount: number; description: string }): Promise<PaymentInvoice>
  getPaymentStatus(invoiceId: string): Promise<{ paid: boolean }>
  /** Зөвхөн testMode нэхэмжлэхэд */
  simulatePayment(invoiceId: string): Promise<void>
  checkout(courseIds: string[]): Promise<Order>
  getMyCourses(): Promise<Course[]>
  getProgress(courseId: string): Promise<Progress>
  markLessonComplete(courseId: string, lessonId: string): Promise<Progress>
}
