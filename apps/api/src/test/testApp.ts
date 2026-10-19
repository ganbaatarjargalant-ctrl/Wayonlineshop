import { buildApp } from '../app.js'
import type { Config } from '../config.js'

/** Тестэд хүчинтэй тохиргоо. DATABASE_URL нь Phase 2-д хэрэглэгдэхгүй, зөвхөн схемийг гүйцээнэ. */
export const testConfig = (over: Partial<Config> = {}): Config => ({
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: 3000,
  DATABASE_URL: 'postgresql://way:way@localhost:5433/way_test',
  JWT_SECRET: 'test-secret-that-is-long-enough-32',
  corsOrigins: ['http://localhost:5173'],
  ...over,
})

/** Сүлжээнд listen хийхгүй — `app.inject()`-ээр хүсэлт симуляци хийнэ. */
export const buildTestApp = (over?: Partial<Config>) => buildApp(testConfig(over))
