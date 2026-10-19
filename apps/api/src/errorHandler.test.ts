import type { FastifyInstance } from 'fastify'
import { AppError, forbidden, notFound, unauthorized, validation } from './errors.js'
import { buildTestApp } from './test/testApp.js'

let app: FastifyInstance

/** Алдаа шиддэг туршилтын route-ууд нэмж, хөрвүүлэлтийг шалгана. */
beforeEach(async () => {
  app = await buildTestApp()
  app.get('/boom/:code', async (req) => {
    const { code } = req.params as { code: string }
    throw new AppError(code as never, `тэстийн алдаа: ${code}`)
  })
  app.get('/crash', async () => {
    throw new Error('ҮНДСЭН_ДОТООД_ДЭЛГЭРЭНГҮЙ at /secret/path/db.ts')
  })
  app.post('/schema', { schema: { body: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } } } }, async () => ({ ok: true }))
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test.each([
  ['VALIDATION', 400],
  ['UNAUTHORIZED', 401],
  ['FORBIDDEN', 403],
  ['NOT_FOUND', 404],
  ['RATE_LIMITED', 429],
  ['UNKNOWN', 500],
])('AppError %s maps to HTTP %i with the same code in the body', async (code, status) => {
  const res = await app.inject({ method: 'GET', url: `/boom/${code}` })
  expect(res.statusCode).toBe(status)
  expect(res.json()).toEqual({ code, message: `тэстийн алдаа: ${code}` })
})

test('an unexpected error becomes a generic 500 and leaks no internals', async () => {
  const res = await app.inject({ method: 'GET', url: '/crash' })
  expect(res.statusCode).toBe(500)
  expect(res.json()).toEqual({ code: 'UNKNOWN', message: 'Серверийн дотоод алдаа' })

  const raw = res.body
  expect(raw).not.toContain('ҮНДСЭН_ДОТООД_ДЭЛГЭРЭНГҮЙ')
  expect(raw).not.toContain('/secret/path')
  expect(raw).not.toContain('stack')
})

test('a schema violation becomes VALIDATION 400', async () => {
  const res = await app.inject({ method: 'POST', url: '/schema', payload: {} })
  expect(res.statusCode).toBe(400)
  expect(res.json()).toMatchObject({ code: 'VALIDATION' })
})

test('malformed JSON becomes VALIDATION, not a 500', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/schema',
    headers: { 'content-type': 'application/json' },
    payload: '{not json',
  })
  expect(res.statusCode).toBe(400)
  expect(res.json()).toMatchObject({ code: 'VALIDATION' })
})

test('an unknown route returns the same error envelope', async () => {
  const res = await app.inject({ method: 'GET', url: '/nope' })
  expect(res.statusCode).toBe(404)
  expect(res.json()).toMatchObject({ code: 'NOT_FOUND' })
  expect(res.json().message).toContain('/nope')
})

test('error helpers carry the right codes and defaults', () => {
  expect(validation('x').code).toBe('VALIDATION')
  expect(unauthorized().code).toBe('UNAUTHORIZED')
  expect(unauthorized().message).toBe('Нэвтэрнэ үү')
  expect(forbidden().code).toBe('FORBIDDEN')
  expect(notFound().code).toBe('NOT_FOUND')
})
