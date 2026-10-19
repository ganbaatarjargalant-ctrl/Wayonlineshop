import { useAuthStore } from '@/features/auth/authStore'
import { loginAs } from '@/test/renderApp'
import { createMockApi } from './mock/mockApi'
import { withQpay } from './qpay'

function setup(sandbox = true) {
  const paid = new Set<string>()
  const calls: { url: string; body?: unknown }[] = []
  const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined })
    const json = (data: unknown) => new Response(JSON.stringify(data), { status: 200 })
    if (url === '/api/qpay/invoice') return json({ invoiceId: 'inv1', qrText: 'QR-TEXT', qrImage: 'data:image/png;base64,AAA' })
    if (url === '/api/qpay/invoice/inv1') return json({ paid: paid.has('inv1') })
    if (url === '/api/qpay/invoice/inv1/simulate') {
      paid.add('inv1')
      return json({ ok: true })
    }
    return new Response(JSON.stringify({ code: 'NOT_FOUND', message: 'x' }), { status: 404 })
  }) as typeof fetch
  const mock = createMockApi({
    storage: localStorage,
    getToken: () => useAuthStore.getState().token,
    delay: 0,
    payAfterPolls: Infinity,
  })
  return { api: withQpay(mock, { sandbox, fetchFn }), mock, paid, calls }
}

test('checkout creates a QPay invoice for the server-computed total and returns its QR', async () => {
  const { api, mock, calls } = setup()
  await loginAs(mock, {})
  const intent = await api.checkout(['c1', 'c1'])
  expect(intent.qr).toEqual({ text: 'QR-TEXT', image: 'data:image/png;base64,AAA' })
  expect(calls[0]).toMatchObject({ url: '/api/qpay/invoice', body: { amount: 49000 } })
})

test('order stays pending until QPay reports payment, then grants access', async () => {
  const { api, mock, paid } = setup()
  await loginAs(mock, {})
  const { orderId } = await api.checkout(['c1'])
  expect((await api.getOrder(orderId)).status).toBe('pending')
  expect(await api.getMyCourses()).toEqual([])
  paid.add('inv1')
  expect((await api.getOrder(orderId)).status).toBe('paid')
  expect((await api.getMyCourses()).map((c) => c.id)).toEqual(['c1'])
})

test('simulatePayment exists only in sandbox and marks the invoice paid', async () => {
  expect(setup(false).api.simulatePayment).toBeUndefined()
  const { api, mock } = setup(true)
  await loginAs(mock, {})
  const { orderId } = await api.checkout(['c1'])
  await api.simulatePayment!(orderId)
  expect((await api.getOrder(orderId)).status).toBe('paid')
})
