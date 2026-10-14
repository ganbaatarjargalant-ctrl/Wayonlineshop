import { readJson, writeJson } from './storage'

test('readJson returns fallback for missing key', () => {
  expect(readJson(localStorage, 'x', [])).toEqual([])
})

test('readJson returns fallback for corrupted JSON', () => {
  localStorage.setItem('x', '{bad')
  expect(readJson(localStorage, 'x', { a: 1 })).toEqual({ a: 1 })
})

test('writeJson then readJson roundtrips', () => {
  writeJson(localStorage, 'x', { a: 2 })
  expect(readJson(localStorage, 'x', null)).toEqual({ a: 2 })
})
