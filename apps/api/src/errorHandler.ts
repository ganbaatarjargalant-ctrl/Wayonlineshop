import type { FastifyError, FastifyInstance } from 'fastify'
import { AppError, errorBody, STATUS_BY_CODE } from './errors.js'

const GENERIC_MESSAGE = 'Серверийн дотоод алдаа'

/**
 * Бүх алдааг нэг хэлбэрт хөрвүүлнэ: `{ code, message }`.
 *
 * Чухал: гэнэтийн алдааны дэлгэрэнгүй (stack, SQL, файлын зам) хариуд
 * ХЭЗЭЭ Ч орохгүй — зөвхөн сервер лог руу. Хариуд ерөнхий мессеж буцна.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setNotFoundHandler((req, reply) =>
    reply.status(404).send(errorBody('NOT_FOUND', `${req.method} ${req.url} байхгүй`)),
  )

  app.setErrorHandler((err: FastifyError, req, reply) => {
    if (err instanceof AppError) {
      return reply.status(STATUS_BY_CODE[err.code]).send(errorBody(err.code, err.message))
    }

    // Fastify-ийн схем валидаци (route schema)
    if (err.validation) {
      return reply.status(400).send(errorBody('VALIDATION', 'Хүсэлтийн өгөгдөл буруу байна'))
    }

    if (err.statusCode === 429) {
      return reply.status(429).send(errorBody('RATE_LIMITED', 'Хэт олон хүсэлт. Хэсэг хүлээгээд дахин оролдоно уу.'))
    }

    // Буруу JSON бие зэрэг клиентийн алдаа
    if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
      return reply.status(err.statusCode).send(errorBody('VALIDATION', 'Хүсэлт буруу байна'))
    }

    req.log.error({ err }, 'Гэнэтийн алдаа')
    return reply.status(500).send(errorBody('UNKNOWN', GENERIC_MESSAGE))
  })
}
