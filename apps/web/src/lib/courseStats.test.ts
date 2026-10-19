import { courses } from '@/api/mock/fixtures'
import {
  firstLessonId,
  lessonCount,
  nextLessonId,
  progressPercent,
  resumeLessonId,
  totalDurationSec,
} from './courseStats'

const c1 = courses.find((c) => c.id === 'c1')!

test('progressPercent rounds and ignores foreign ids', () => {
  expect(progressPercent(c1, [])).toBe(0)
  expect(progressPercent(c1, ['l1'])).toBe(33)
  expect(progressPercent(c1, ['l1', 'l2', 'l3', 'zzz'])).toBe(100)
})

test('progressPercent of a course without lessons is 0', () => {
  expect(progressPercent({ ...c1, sections: [] }, ['l1'])).toBe(0)
})

test('nextLessonId crosses sections and ends with null', () => {
  expect(firstLessonId(c1)).toBe('l1')
  expect(nextLessonId(c1, 'l1')).toBe('l2')
  expect(nextLessonId(c1, 'l2')).toBe('l3')
  expect(nextLessonId(c1, 'l3')).toBeNull()
})

test('resumeLessonId picks first incomplete, falls back to first lesson', () => {
  expect(resumeLessonId(c1, [])).toBe('l1')
  expect(resumeLessonId(c1, ['l1'])).toBe('l2')
  expect(resumeLessonId(c1, ['l1', 'l2', 'l3'])).toBe('l1')
})

test('a course without lessons has no first or resume lesson', () => {
  const empty = { ...c1, sections: [] }
  expect(firstLessonId(empty)).toBeNull()
  expect(resumeLessonId(empty, [])).toBeNull()
})

test('lessonCount and totalDurationSec aggregate across sections', () => {
  expect(lessonCount(c1)).toBe(3)
  expect(totalDurationSec(c1)).toBe(307 + 420 + 615)
})
