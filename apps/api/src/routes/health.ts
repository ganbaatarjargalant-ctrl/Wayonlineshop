import type { FastifyPluginAsync } from 'fastify'

/**
 * Deploy/мониторингод зориулсан шалгалт. Rate limit-ээс чөлөөлөгдсөн —
 * health check нь ердийн хүсэлтийн квотыг барих ёсгүй.
 */
export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', { config: { rateLimit: false } }, async () => ({
    status: 'ok' as const,
    uptimeSec: Math.floor(process.uptime()),
  }))
}
