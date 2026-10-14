import type { ApiClient } from '../client'
import { ApiError } from '../errors'
import type { Course, Order, User } from '../types'
import { categories, courses } from './fixtures'
import { readJson, writeJson } from './storage'

const USERS_KEY = 'way.mock.users'
const ORDERS_KEY = 'way.mock.orders'
const PROGRESS_KEY = 'way.mock.progress'

interface StoredUser extends User {
  password: string
}

type StoredOrder = Order & { userId: string }

export interface MockApiOptions {
  storage: Storage
  getToken: () => string | null
  /** Хоцрол (ms): тоо эсвэл [min, max] санамсаргүй. 0 бол хоцролгүй. */
  delay?: number | [number, number]
}

const normalize = (s: string) => s.trim().toLocaleLowerCase('mn')

export function createMockApi(opts: MockApiOptions): ApiClient {
  const { delay = [200, 500] } = opts

  async function wait() {
    const ms = Array.isArray(delay) ? delay[0] + Math.random() * (delay[1] - delay[0]) : delay
    if (ms > 0) await new Promise((r) => setTimeout(r, ms))
    else await Promise.resolve()
  }

  const users = () => readJson<StoredUser[]>(opts.storage, USERS_KEY, [])
  const publicUser = ({ id, name, email }: StoredUser): User => ({ id, name, email })
  const session = (u: StoredUser) => ({ user: publicUser(u), token: `mock-token-${u.id}` })

  /** Токеноор хэрэглэгчийг олно, олдохгүй бол UNAUTHORIZED */
  function requireUser(): User {
    const token = opts.getToken()
    const u = token ? users().find((x) => `mock-token-${x.id}` === token) : undefined
    if (!u) throw new ApiError('UNAUTHORIZED', 'Нэвтэрнэ үү')
    return publicUser(u)
  }

  const orders = () => readJson<StoredOrder[]>(opts.storage, ORDERS_KEY, [])
  const progressMap = () => readJson<Record<string, string[]>>(opts.storage, PROGRESS_KEY, {})

  function ownedIds(userId: string): Set<string> {
    return new Set(orders().filter((o) => o.userId === userId).flatMap((o) => o.courseIds))
  }

  function isOwned(courseId: string): boolean {
    try {
      return ownedIds(requireUser().id).has(courseId)
    } catch {
      return false
    }
  }

  /** Нэвтэрсэн бөгөөд хичээлийг худалдаж авсан байх ёстой */
  function requireOwned(courseId: string): { user: User; course: Course } {
    const user = requireUser()
    const course = courses.find((c) => c.id === courseId)
    if (!course) throw new ApiError('NOT_FOUND', 'Хичээл олдсонгүй')
    if (!ownedIds(user.id).has(courseId)) throw new ApiError('FORBIDDEN', 'Энэ хичээлийг худалдаж авна уу')
    return { user, course }
  }

  /** Худалдаж аваагүй, preview биш хичээлийн videoUrl-ийг нууна */
  function present(course: Course): Course {
    const copy = structuredClone(course)
    if (isOwned(copy.id)) return copy
    for (const section of copy.sections) {
      for (const l of section.lessons) {
        if (!l.isPreview) delete l.videoUrl
      }
    }
    return copy
  }

  return {
    async getCourses(filter = {}) {
      await wait()
      const q = filter.q ? normalize(filter.q) : ''
      return courses
        .filter((c) => !filter.category || c.category === filter.category)
        .filter((c) => !filter.level || c.level === filter.level)
        .filter((c) => filter.maxPrice === undefined || c.price <= filter.maxPrice)
        .filter((c) => !q || [c.title, c.description, c.category, c.instructor.name].some((t) => normalize(t).includes(q)))
        .map(present)
    },

    async getCourse(slug) {
      await wait()
      const c = courses.find((x) => x.slug === slug)
      if (!c) throw new ApiError('NOT_FOUND', 'Хичээл олдсонгүй')
      return present(c)
    },

    async getCategories() {
      await wait()
      return [...categories]
    },

    async register({ name, email, password }) {
      await wait()
      const all = users()
      const normalized = email.trim().toLowerCase()
      if (all.some((u) => u.email === normalized)) {
        throw new ApiError('VALIDATION', 'Энэ имэйл бүртгэлтэй байна')
      }
      const u: StoredUser = { id: crypto.randomUUID(), name: name.trim(), email: normalized, password }
      writeJson(opts.storage, USERS_KEY, [...all, u])
      return session(u)
    },

    async login({ email, password }) {
      await wait()
      const normalized = email.trim().toLowerCase()
      const u = users().find((x) => x.email === normalized && x.password === password)
      if (!u) throw new ApiError('UNAUTHORIZED', 'Имэйл эсвэл нууц үг буруу байна')
      return session(u)
    },

    async getMe() {
      await wait()
      return requireUser()
    },

    async checkout(courseIds) {
      await wait()
      const user = requireUser()
      const owned = ownedIds(user.id)
      const toBuy = courses.filter((c) => courseIds.includes(c.id) && !owned.has(c.id))
      if (toBuy.length === 0) throw new ApiError('VALIDATION', 'Худалдаж авах хичээл алга')
      const order: StoredOrder = {
        id: crypto.randomUUID(),
        userId: user.id,
        courseIds: toBuy.map((c) => c.id),
        total: toBuy.reduce((sum, c) => sum + c.price, 0),
        status: 'paid',
      }
      writeJson(opts.storage, ORDERS_KEY, [...orders(), order])
      const { userId: _userId, ...publicOrder } = order
      return publicOrder
    },

    async getMyCourses() {
      await wait()
      const owned = ownedIds(requireUser().id)
      return courses.filter((c) => owned.has(c.id)).map(present)
    },

    async getProgress(courseId) {
      await wait()
      const { user } = requireOwned(courseId)
      return { courseId, completedLessonIds: progressMap()[`${user.id}:${courseId}`] ?? [] }
    },

    async markLessonComplete(courseId, lessonId) {
      await wait()
      const { user, course } = requireOwned(courseId)
      if (!course.sections.some((s) => s.lessons.some((l) => l.id === lessonId))) {
        throw new ApiError('NOT_FOUND', 'Хичээл олдсонгүй')
      }
      const map = progressMap()
      const key = `${user.id}:${courseId}`
      const done = map[key] ?? []
      if (!done.includes(lessonId)) map[key] = [...done, lessonId]
      writeJson(opts.storage, PROGRESS_KEY, map)
      return { courseId, completedLessonIds: map[key] ?? done }
    },
  }
}
