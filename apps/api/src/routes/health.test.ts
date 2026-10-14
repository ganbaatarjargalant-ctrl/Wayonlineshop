import type { FastifyInstance } from 'fastify'
import { buildTestApp } from '../test/testApp.js'

let app: FastifyInstance

beforeEach(async () => {
  app = await buildTestApp()
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('GET /health reports ok with an uptime', async () => {
  const res = await app.inject({ method: 'GET', url: '/health' })
  expect(res.statusCode).toBe(200)
  const body = res.json()
  expect(body.status).toBe('ok')
  expect(typeof body.uptimeSec).toBe('number')
  expect(body.uptimeSec).toBeGreaterThanOrEqual(0)
})

test('health is exempt from rate limiting', async () => {
  // Квот нь 100/мин — үүнээс дээш дуудахад ч health хэвээр 200 байх ёстой
  for (let i = 0; i < 120; i++) {
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
  }
})

test('helmet security headers are present', async () => {
  const res = await app.inject({ method: 'GET', url: '/health' })
  expect(res.headers['x-content-type-options']).toBe('nosniff')
  expect(res.headers['x-frame-options']).toBeDefined()
})

test('an allowed origin gets a CORS header, a foreign one does not', async () => {
  const allowed = await app.inject({
    method: 'GET',
    url: '/health',
    headers: { origin: 'http://localhost:5173' },
  })
  expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173')

  const foreign = await app.inject({
    method: 'GET',
    url: '/health',
    headers: { origin: 'http://evil.example' },
  })
  expect(foreign.headers['access-control-allow-origin']).toBeUndefined()
})

test('ordinary routes are rate limited once the quota is spent', async () => {
  const limited = await buildTestApp()
  limited.get('/ping', async () => ({ ok: true }))
  await limited.ready()

  let sawLimit = false
  for (let i = 0; i < 105; i++) {
    const res = await limited.inject({ method: 'GET', url: '/ping' })
    if (res.statusCode === 429) {
      expect(res.json()).toMatchObject({ code: 'RATE_LIMITED' })
      sawLimit = true
      break
    }
  }
  expect(sawLimit).toBe(true)
  await limited.close()
})
