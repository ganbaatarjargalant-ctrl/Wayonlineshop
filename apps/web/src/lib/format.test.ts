import { formatDuration, formatPrice, levelLabel } from './format'

test('formatPrice', () => {
  expect(formatPrice(49000)).toBe('49,000₮')
  expect(formatPrice(1250000)).toBe('1,250,000₮')
  expect(formatPrice(0)).toBe('0₮')
})

test('formatDuration', () => {
  expect(formatDuration(307)).toBe('5:07')
  expect(formatDuration(59)).toBe('0:59')
})

test('levelLabel', () => {
  expect(levelLabel).toEqual({ beginner: 'Анхан шат', intermediate: 'Дунд шат', advanced: 'Ахисан шат' })
})
