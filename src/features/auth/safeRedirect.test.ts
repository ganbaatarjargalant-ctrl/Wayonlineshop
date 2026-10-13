import { safeRedirect } from './safeRedirect'

test.each([
  ['/my-courses', '/my-courses'],
  ['/learn/a/b?x=1', '/learn/a/b?x=1'],
  ['https://evil.com', '/'],
  ['//evil.com', '/'],
  ['/\\evil.com', '/'],
  [null, '/'],
  ['', '/'],
])('safeRedirect(%s) → %s', (raw, out) => {
  expect(safeRedirect(raw)).toBe(out)
})
