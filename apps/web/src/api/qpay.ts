import type { ApiClient } from './client'
import { ApiError } from './errors'
import type { MockApi } from './mock/mockApi'
import type { ApiErrorCode } from './types'

interface QpayInvoice {
  invoiceId: string
  qrText: string
  qrImage: string
}

/**
 * Захиалга (mock) + бодит QPay нэхэмжлэх. Dev серверийн `/api/qpay/*` middleware (server/qpay.ts)
 * руу хандана. Захиалгын дүнг клиентээс бус mock "сервер"-ийн тооцсон `order.total`-оос авна.
 * Бодит backend гарахад энэ бүхэлдээ `POST /orders` + webhook болж солигдоно.
 */
export function withQpay(
  api: MockApi,
  opts: { sandbox: boolean; fetchFn?: typeof fetch } = { sandbox: false },
): ApiClient {
  const fetchFn = opts.fetchFn ?? ((...a: Parameters<typeof fetch>) => fetch(...a))
  const invoiceByOrder = new Map<string, string>()

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response
    try {
      res = await fetchFn(`/api/qpay${path}`, init)
    } catch {
      throw new ApiError('UNKNOWN', 'Сүлжээний алдаа. Дахин оролдоно уу.')
    }
    const body = (await res.json().catch(() => null)) as (T & { code?: ApiErrorCode; message?: string }) | null
    if (!res.ok) throw new ApiError(body?.code ?? 'UNKNOWN', body?.message ?? 'Төлбөрийн алдаа гарлаа')
    return body as T
  }

  const post = (body?: unknown): RequestInit => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  function invoiceFor(orderId: string): string {
    const id = invoiceByOrder.get(orderId)
    if (!id) throw new ApiError('NOT_FOUND', 'Нэхэмжлэх олдсонгүй')
    return id
  }

  return {
    ...api,

    async checkout(courseIds) {
      const intent = await api.checkout(courseIds)
      const order = await api.getOrder(intent.orderId)
      const inv = await request<QpayInvoice>(
        '/invoice',
        post({ amount: order.total, description: `Way Academy захиалга ${order.id.slice(0, 8)}` }),
      )
      invoiceByOrder.set(order.id, inv.invoiceId)
      return { ...intent, qr: { text: inv.qrText, image: inv.qrImage } }
    },

    async getOrder(orderId) {
      const order = await api.getOrder(orderId)
      const invoiceId = invoiceByOrder.get(orderId)
      if (order.status !== 'pending' || !invoiceId) return order
      const { paid } = await request<{ paid: boolean }>(`/invoice/${encodeURIComponent(invoiceId)}`)
      if (!paid) return order
      api.markOrderPaid(orderId)
      return api.getOrder(orderId)
    },

    ...(opts.sandbox && {
      async simulatePayment(orderId: string) {
        await request(`/invoice/${encodeURIComponent(invoiceFor(orderId))}/simulate`, post())
      },
    }),
  }
}
