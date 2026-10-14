import type { ApiClient, PaymentInvoice } from './client'
import { ApiError } from './errors'
import type { ApiErrorCode } from './types'

type Payments = Pick<ApiClient, 'createPayment' | 'getPaymentStatus' | 'simulatePayment'>

/** Dev серверийн `/api/qpay/*` middleware (server/qpay.ts) руу хандана */
export function createQpayPayments(fetchFn: typeof fetch = (...a) => fetch(...a)): Payments {
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

  return {
    createPayment: (input) => request<PaymentInvoice>('/invoice', post(input)),
    getPaymentStatus: (id) => request<{ paid: boolean }>(`/invoice/${encodeURIComponent(id)}`),
    simulatePayment: async (id) => {
      await request(`/invoice/${encodeURIComponent(id)}/simulate`, post())
    },
  }
}
