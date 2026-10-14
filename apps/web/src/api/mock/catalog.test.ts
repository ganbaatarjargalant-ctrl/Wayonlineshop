import { createMockApi } from './mockApi'

const api = () => createMockApi({ storage: localStorage, getToken: () => null, delay: 0 })

test('getCourses returns all 8 without filter', async () => {
  expect(await api().getCourses()).toHaveLength(8)
})

test('getCourses filters by category and level', async () => {
  const r = await api().getCourses({ category: 'Дизайн' })
  expect(r.length).toBeGreaterThan(0)
  expect(r.every((c) => c.category === 'Дизайн')).toBe(true)
  expect(await api().getCourses({ level: 'advanced' })).toHaveLength(1)
})

test('getCourses filters by maxPrice inclusive', async () => {
  const r = await api().getCourses({ maxPrice: 39000 })
  expect(r.every((c) => c.price <= 39000)).toBe(true)
  expect(r.map((c) => c.slug)).toContain('figma-undsen')
  expect(r.map((c) => c.slug)).not.toContain('react-ekhlel')
})

test('search is case-insensitive, trimmed, matches title', async () => {
  const r = await api().getCourses({ q: '  REACT ' })
  expect(r.map((c) => c.slug)).toContain('react-ekhlel')
  const r2 = await api().getCourses({ q: 'FIGMA ҮНДЭС' })
  expect(r2.map((c) => c.slug)).toEqual(['figma-undsen'])
})

test('getCourse strips videoUrl except preview for anonymous', async () => {
  const c = await api().getCourse('react-ekhlel')
  const lessons = c.sections.flatMap((s) => s.lessons)
  expect(lessons.find((l) => l.id === 'l1')!.videoUrl).toBeDefined()
  expect(lessons.find((l) => l.id === 'l2')!.videoUrl).toBeUndefined()
})

test('getCourse throws NOT_FOUND for unknown slug', async () => {
  await expect(api().getCourse('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('getCategories returns the 4 categories', async () => {
  expect(await api().getCategories()).toEqual(['Програмчлал', 'Дизайн', 'Маркетинг', 'Англи хэл'])
})

test('returned data is a copy; mutating it does not affect later calls', async () => {
  const a = await api().getCourse('react-ekhlel')
  a.title = 'changed'
  expect((await api().getCourse('react-ekhlel')).title).toBe('React эхлэл')
})
