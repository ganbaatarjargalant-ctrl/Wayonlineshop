import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import Fastify, { type FastifyInstance } from 'fastify'
import type { Config } from './config.js'
import { registerErrorHandler } from './errorHandler.js'
import { healthRoutes } from './routes/health.js'

/** Ердийн endpoint-уудын квот. `/auth/*` нь Phase 4-д хэд дахин хатуу квот авна. */
const RATE_LIMIT_MAX = 100
const RATE_LIMIT_WINDOW = '1 minute'

/**
 * Тохиргоог параметрээр авна (глобал импорт биш) — тестэд хуурамч тохиргоотой
 * апп зохиож, сүлжээнд listen хийхгүйгээр `app.inject()`-ээр шалгах боломж өгнө.
 */
export async function buildApp(config: Config): Promise<FastifyInstance> {
  const app = Fastify({
    logger: config.NODE_ENV === 'test' ? false : { level: config.NODE_ENV === 'production' ? 'info' : 'debug' },
    // Прокси цаад талд байхад client IP зөв тодорхойлогдож rate limit ажиллана
    trustProxy: config.NODE_ENV === 'production',
  })

  await app.register(helmet)
  await app.register(cors, { origin: config.corsOrigins, credentials: true })
  await app.register(rateLimit, { max: RATE_LIMIT_MAX, timeWindow: RATE_LIMIT_WINDOW })

  registerErrorHandler(app)
  await app.register(healthRoutes)

  return app
}
