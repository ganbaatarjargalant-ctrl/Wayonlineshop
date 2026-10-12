import type { ApiClient } from '../client'
import { ApiError } from '../errors'
import type { Course } from '../types'
import { categories, courses } from './fixtures'

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

    register: notImplemented,
    login: notImplemented,
    getMe: notImplemented,
    checkout: notImplemented,
    getMyCourses: notImplemented,
    getProgress: notImplemented,
    markLessonComplete: notImplemented,
  }
}
