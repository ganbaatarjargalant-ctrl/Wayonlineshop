import type { ApiClient } from '../client'
import { ApiError } from '../errors'
import type { Course, User } from '../types'
import { categories, courses } from './fixtures'
import { readJson, writeJson } from './storage'

const USERS_KEY = 'way.mock.users'

interface StoredUser extends User {
  password: string
}

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

  function isOwned(_courseId: string): boolean {
    return false
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

  const notImplemented = () => {
    throw new Error('not implemented')
  }

  return {
    async getCourses(filter = {}) {
      await wait()
      const q = filter.q ? normalize(filter.q) : ''
      return courses
        .filter((c) => !filter.category || c.category === filter.category)
        .filter((c) => !filter.level || c.level === filter.level)
        .filter((c) => filter.maxPrice === undefined || c.price <= filter.maxPrice)
        .filter((c) => !q || normalize(c.title).includes(q) || normalize(c.description).includes(q))
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
    checkout: notImplemented,
    getMyCourses: notImplemented,
    getProgress: notImplemented,
    markLessonComplete: notImplemented,
  }
}
