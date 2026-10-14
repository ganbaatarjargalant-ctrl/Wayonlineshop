import { createMockApi } from './mockApi'

let token: string | null = null
const api = () => createMockApi({ storage: localStorage, getToken: () => token, delay: 0 })

beforeEach(async () => {
  token = null
  token = (await api().register({ name: 'A', email: 'a@test.mn', password: 'secret1' })).token
})

test('checkout creates paid order with summed total', async () => {
  const o = await api().checkout(['c1', 'c2'])
  expect(o).toMatchObject({ courseIds: ['c1', 'c2'], total: 88000, status: 'paid' })
})

test('checkout skips owned and unknown ids; all skipped → VALIDATION', async () => {
  await api().checkout(['c1'])
  const o = await api().checkout(['c1', 'c2', 'ghost'])
  expect(o.courseIds).toEqual(['c2'])
  expect(o.total).toBe(39000)
  await expect(api().checkout(['c1'])).rejects.toMatchObject({ code: 'VALIDATION' })
})

test('checkout dedupes repeated ids', async () => {
  const o = await api().checkout(['c1', 'c1'])
  expect(o.courseIds).toEqual(['c1'])
  expect(o.total).toBe(49000)
})

test('checkout without token → UNAUTHORIZED', async () => {
  token = null
  await expect(api().checkout(['c1'])).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
})

test('getMyCourses lists purchased courses', async () => {
  expect(await api().getMyCourses()).toEqual([])
  await api().checkout(['c1'])
  expect((await api().getMyCourses()).map((c) => c.id)).toEqual(['c1'])
})

test('purchases are per user', async () => {
  await api().checkout(['c1'])
  token = (await api().register({ name: 'B', email: 'b@test.mn', password: 'secret1' })).token
  expect(await api().getMyCourses()).toEqual([])
})

test('owned course exposes all videoUrls', async () => {
  await api().checkout(['c1'])
  const lessons = (await api().getCourse('react-ekhlel')).sections.flatMap((s) => s.lessons)
  expect(lessons.every((l) => l.videoUrl)).toBe(true)
})

test('progress: FORBIDDEN when not owned, idempotent mark when owned', async () => {
  await expect(api().getProgress('c1')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  await api().checkout(['c1'])
  expect(await api().getProgress('c1')).toEqual({ courseId: 'c1', completedLessonIds: [] })
  await api().markLessonComplete('c1', 'l2')
  const p = await api().markLessonComplete('c1', 'l2')
  expect(p.completedLessonIds).toEqual(['l2'])
  expect(await api().getProgress('c1')).toEqual(p)
})

test('markLessonComplete with lesson not in course → NOT_FOUND', async () => {
  await api().checkout(['c1'])
  await expect(api().markLessonComplete('c1', 'zzz')).rejects.toMatchObject({ code: 'NOT_FOUND' })
})
