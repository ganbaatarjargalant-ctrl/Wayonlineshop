/**
 * QPay v2-ийн dev/preview серверийн middleware.
 * QPay-ийн client secret браузерт хэзээ ч очих ёсгүй тул нэхэмжлэх үүсгэх, төлбөр шалгах
 * дуудлагууд зөвхөн энд (Node тал) хийгдэнэ. Бодит backend гарахад энэ файл түүн рүү зөөгдөнө.
 *
 * Env (apps/web/.env.local):
 *   QPAY_CLIENT_ID, QPAY_CLIENT_SECRET, QPAY_INVOICE_CODE — QPay-ээс авсан merchant мэдээлэл
 *   QPAY_BASE_URL   — анхдагч нь https://merchant.qpay.mn
 *   QPAY_CALLBACK_URL — төлбөр орход QPay дуудах URL (localhost-д хүрэхгүй тул polling-оор шалгана)
 * QPAY_CLIENT_ID байхгүй бол QPay-ийн нийтэд нээлттэй sandbox (TEST_MERCHANT) ашиглана.
 */
import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'

interface QpayConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
  invoiceCode: string
  callbackUrl: string
}

const SANDBOX: QpayConfig = {
  baseUrl: 'https://merchant-sandbox.qpay.mn',
  clientId: 'TEST_MERCHANT',
  clientSecret: '123456',
  invoiceCode: 'TEST_INVOICE',
  callbackUrl: 'https://example.com/qpay/callback',
}

const MAX_AMOUNT = 100_000_000

interface QpayInvoiceResponse {
  invoice_id: string
  qr_text: string
  qr_image: string
  qPay_shortUrl?: string
  urls?: { name: string; description: string; logo: string; link: string }[]
}

interface QpayCheckResponse {
  count: number
  rows: { payment_status: string }[]
}

class HttpError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function resolveQpayConfig(env: Record<string, string>): QpayConfig {
  if (!env.QPAY_CLIENT_ID) return SANDBOX
  const missing = ['QPAY_CLIENT_SECRET', 'QPAY_INVOICE_CODE'].filter((k) => !env[k])
  if (missing.length) throw new Error(`QPay тохиргоо дутуу: ${missing.join(', ')}`)
  return {
    baseUrl: env.QPAY_BASE_URL || 'https://merchant.qpay.mn',
    clientId: env.QPAY_CLIENT_ID,
    clientSecret: env.QPAY_CLIENT_SECRET!,
    invoiceCode: env.QPAY_INVOICE_CODE!,
    callbackUrl: env.QPAY_CALLBACK_URL || SANDBOX.callbackUrl,
  }
}

export function qpayPlugin(env: Record<string, string>): Plugin {
  const cfg = resolveQpayConfig(env)
  const testMode = cfg.baseUrl.includes('sandbox')
  // Sandbox QR-ийг бодит банкны апп уншихгүй тул туршилтын "төлсөн" тэмдэглэгээг санах ойд хадгална
  const simulated = new Set<string>()
  let token: { value: string; expiresAt: number } | null = null

  async function getToken(): Promise<string> {
    if (token && token.expiresAt > Date.now()) return token.value
    const res = await fetch(`${cfg.baseUrl}/v2/auth/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64')}` },
    })
    if (!res.ok) throw new Error(`QPay auth ${res.status}: ${await res.text()}`)
    const body = (await res.json()) as { access_token: string; expires_in: number }
    // QPay expires_in-ийг unix секундээр буцаадаг; 1 минутын зайтай шинэчилнэ
    const expiresAt = body.expires_in > 1e9 ? body.expires_in * 1000 : Date.now() + body.expires_in * 1000
    token = { value: body.access_token, expiresAt: expiresAt - 60_000 }
    return token.value
  }

  async function call<T>(path: string, payload: unknown): Promise<T> {
    const send = async () =>
      fetch(`${cfg.baseUrl}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    let res = await send()
    if (res.status === 401) {
      token = null
      res = await send()
    }
    if (!res.ok) throw new Error(`QPay ${path} ${res.status}: ${await res.text()}`)
    return (await res.json()) as T
  }

  async function createInvoice(req: IncomingMessage) {
    const body = (await readJson(req)) as { amount?: unknown; description?: unknown }
    const amount = body.amount
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0 || amount > MAX_AMOUNT) {
      throw new HttpError(400, 'VALIDATION', 'Төлбөрийн дүн буруу байна')
    }
    const description = typeof body.description === 'string' && body.description.trim() ? body.description.trim() : 'Way Academy'
    const inv = await call<QpayInvoiceResponse>('/v2/invoice', {
      invoice_code: cfg.invoiceCode,
      sender_invoice_no: randomUUID(),
      invoice_receiver_code: 'terminal',
      invoice_description: description.slice(0, 255),
      amount,
      callback_url: cfg.callbackUrl,
    })
    return {
      invoiceId: inv.invoice_id,
      amount,
      qrImage: `data:image/png;base64,${inv.qr_image}`,
      shortUrl: inv.qPay_shortUrl ?? null,
      bankApps: (inv.urls ?? []).map(({ name, description, logo, link }) => ({ name, description, logo, link })),
      testMode,
    }
  }

  async function checkInvoice(invoiceId: string) {
    if (simulated.has(invoiceId)) return { paid: true }
    const res = await call<QpayCheckResponse>('/v2/payment/check', {
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 100 },
    })
    return { paid: res.rows.some((r) => r.payment_status === 'PAID') }
  }

  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url?.split('?')[0] ?? ''
    if (!url.startsWith('/api/qpay/')) return next()

    const route = async () => {
      if (req.method === 'POST' && url === '/api/qpay/invoice') return createInvoice(req)
      const m = /^\/api\/qpay\/invoice\/([\w-]{1,64})(\/simulate)?$/.exec(url)
      if (m?.[1] && !m[2] && req.method === 'GET') return checkInvoice(m[1])
      if (m?.[1] && m[2] && req.method === 'POST' && testMode) {
        simulated.add(m[1])
        return { ok: true }
      }
      throw new HttpError(404, 'NOT_FOUND', 'Олдсонгүй')
    }

    route()
      .then((data) => sendJson(res, 200, data))
      .catch((e: unknown) => {
        if (e instanceof HttpError) return sendJson(res, e.status, { code: e.code, message: e.message })
        console.error('[qpay]', e)
        sendJson(res, 502, { code: 'UNKNOWN', message: 'QPay-тэй холбогдож чадсангүй. Дахин оролдоно уу.' })
      })
  }

  return {
    name: 'way-qpay',
    configureServer(server) {
      server.middlewares.use(handler)
      server.config.logger.info(`  QPay: ${testMode ? 'SANDBOX (туршилтын)' : cfg.baseUrl} горим`)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > 10_000) throw new HttpError(413, 'VALIDATION', 'Хүсэлт хэт том')
  }
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    throw new HttpError(400, 'VALIDATION', 'JSON буруу')
  }
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}
