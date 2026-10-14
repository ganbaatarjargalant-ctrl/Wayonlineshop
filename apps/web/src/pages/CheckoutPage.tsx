import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useApi } from '@/api/ApiProvider'
import { isApiError } from '@/api/errors'
import { Button } from '@/components/Button'
import { ErrorState, Skeleton } from '@/components/states'
import { useCartStore } from '@/features/cart/cartStore'
import { useCartCourses } from '@/features/cart/useCartCourses'
import { formatPrice } from '@/lib/format'

const POLL_MS = 3000

export function CheckoutPage() {
  const api = useApi()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const clearCart = useCartStore((s) => s.clear)
  const { courses, total, isLoading, isError, refetch } = useCartCourses()
  // isPending нь хоёр хурдан даралтын хооронд шинэчлэгдэж амжихгүй байж болох тул ref-ээр хамгаална
  const submittingRef = useRef(false)
  const paidRef = useRef(false)
  const [notPaidYet, setNotPaidYet] = useState(false)
  const [checking, setChecking] = useState(false)

  const courseKey = courses.map((c) => c.id).join(',')
  const invoice = useQuery({
    queryKey: ['payment', courseKey, total],
    queryFn: () =>
      api.createPayment({ amount: total, description: `Way Academy: ${courses.map((c) => c.title).join(', ')}` }),
    enabled: courses.length > 0,
    // Нэхэмжлэх нэг удаа үүснэ — focus/remount бүрт шинэ QR гаргахгүй
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
  const invoiceId = invoice.data?.invoiceId

  const status = useQuery({
    queryKey: ['paymentStatus', invoiceId],
    queryFn: () => api.getPaymentStatus(invoiceId!),
    enabled: !!invoiceId,
    refetchInterval: (q) => (q.state.data?.paid ? false : POLL_MS),
  })

  const pay = useMutation({
    mutationFn: (ids: string[]) => api.checkout(ids),
    onSuccess: async () => {
      paidRef.current = true
      await queryClient.invalidateQueries({ queryKey: ['myCourses'] })
      navigate('/my-courses', { replace: true })
      clearCart()
    },
    onError: () => {
      submittingRef.current = false
    },
  })

  const simulate = useMutation({
    mutationFn: (id: string) => api.simulatePayment(id),
    onSuccess: () => status.refetch(),
  })

  const isPaid = status.data?.paid === true
  const ids = courses.map((c) => c.id)

  const finish = () => {
    if (submittingRef.current) return
    submittingRef.current = true
    pay.mutate(ids)
  }

  useEffect(() => {
    if (isPaid && !paidRef.current) finish()
    // finish нь ref-ээр хамгаалагдсан тул зөвхөн төлөв өөрчлөгдөхөд дуудна
  }, [isPaid])

  if (isLoading) return <Skeleton count={1} />
  if (isError && !paidRef.current) return <ErrorState onRetry={refetch} />
  if (courses.length === 0 && !paidRef.current) return <Navigate to="/cart" replace />

  const handleCheck = async () => {
    if (isPaid) return finish()
    setChecking(true)
    const { data } = await status.refetch()
    setChecking(false)
    setNotPaidYet(!data?.paid)
  }

  const error = pay.error ?? simulate.error ?? invoice.error

  return (
    <section className="mx-auto mt-4 max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-brand-900/5 sm:p-8">
      <h1 className="mb-2 text-2xl font-bold">QPay-ээр төлөх</h1>
      <p className="mb-6 text-3xl font-extrabold text-brand-700">Нийт: {formatPrice(total)}</p>

      {invoice.isPending ? (
        <div
          aria-label="QR код үүсгэж байна"
          className="mx-auto mb-4 h-56 w-56 animate-pulse rounded-2xl bg-slate-100"
        />
      ) : invoice.isError ? (
        <div className="mb-4">
          <Button variant="secondary" onClick={() => invoice.refetch()}>
            QR дахин үүсгэх
          </Button>
        </div>
      ) : invoice.data.qrImage ? (
        <img
          src={invoice.data.qrImage}
          alt="QPay QR код"
          className="mx-auto mb-4 h-56 w-56 rounded-2xl border border-slate-200 p-2"
        />
      ) : (
        <div
          aria-label="QPay QR код"
          role="img"
          className="mx-auto mb-4 flex h-56 w-56 items-center justify-center rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 text-sm font-semibold text-brand-700"
        >
          QR код (mock)
        </div>
      )}

      <p className="mb-4 text-sm text-slate-500">Банкны аппаараа QR кодыг уншуулж төлбөрөө төлнө үү.</p>

      {invoice.data && invoice.data.bankApps.length > 0 && (
        // Утсан дээр QR-ийг өөрөө уншуулж чадахгүй тул банкны аппыг шууд нээх deeplink
        <div className="mb-5 md:hidden">
          <p className="mb-2 text-sm font-semibold text-slate-700">Банкны аппаар төлөх</p>
          <ul className="grid grid-cols-4 gap-2">
            {invoice.data.bankApps.map((b) => (
              <li key={b.name}>
                <a href={b.link} className="flex flex-col items-center gap-1 rounded-xl p-1 text-[11px] text-slate-600 hover:bg-slate-50">
                  <img src={b.logo} alt="" className="h-10 w-10 rounded-lg" loading="lazy" />
                  <span className="line-clamp-2 leading-tight">{b.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {invoice.data && (
        <p role="status" className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
          {isPaid ? (
            <span className="text-emerald-700">Төлбөр орлоо ✓</span>
          ) : (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-400" />
              Төлбөр хүлээж байна...
            </>
          )}
        </p>
      )}

      {notPaidYet && !isPaid && (
        <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">Төлбөр хараахан ороогүй байна.</p>
      )}

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {isApiError(error) ? error.message : 'Төлбөр амжилтгүй боллоо'}
        </p>
      )}

      <Button className="w-full" onClick={handleCheck} disabled={!invoiceId || pay.isPending || checking}>
        {pay.isPending || checking ? 'Шалгаж байна...' : 'Төлбөр шалгах'}
      </Button>

      {invoice.data?.testMode && !isPaid && (
        <Button
          variant="secondary"
          className="mt-2 w-full"
          onClick={() => simulate.mutate(invoice.data.invoiceId)}
          disabled={simulate.isPending}
        >
          Төлсөнд тооцох (туршилт)
        </Button>
      )}
    </section>
  )
}
