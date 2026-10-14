import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useApi } from '@/api/ApiProvider'
import { isApiError } from '@/api/errors'
import type { PaymentIntent } from '@/api/types'
import { Button } from '@/components/Button'
import { ErrorState, Skeleton } from '@/components/states'
import { useCartStore } from '@/features/cart/cartStore'
import { useCartCourses } from '@/features/cart/useCartCourses'
import { formatPrice } from '@/lib/format'

/** Төлбөрийн статусыг хэдэн мс тутам шалгах. */
const POLL_MS = 1500

export function CheckoutPage() {
  const api = useApi()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const clearCart = useCartStore((s) => s.clear)
  const { courses, total, isLoading, isError, refetch } = useCartCourses()
  const [intent, setIntent] = useState<PaymentIntent | null>(null)
  // Зөвхөн event handler дотор уншина: isPending нь хоёр хурдан даралтын хооронд шинэчлэгдэж амжихгүй байж болно
  const startedRef = useRef(false)
  const settledRef = useRef(false)

  const create = useMutation({
    mutationFn: (ids: string[]) => api.checkout(ids),
    onSuccess: (created) => setIntent(created),
  })

  // Захиалга `pending` байх хугацаанд л шалгана, төлөгдмөгц polling зогсоно
  const order = useQuery({
    queryKey: ['order', intent?.orderId],
    queryFn: () => api.getOrder(intent!.orderId),
    enabled: !!intent,
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? POLL_MS : false),
  })

  const status = order.data?.status
  useEffect(() => {
    if (status !== 'paid' || settledRef.current) return
    settledRef.current = true
    void queryClient.invalidateQueries({ queryKey: ['myCourses'] })
    navigate('/my-courses', { replace: true })
    clearCart()
  }, [status, queryClient, navigate, clearCart])

  // Төлбөр эхэлсэн эсэхийг ref-ээс бус бодит төлвөөс гаргана — сагс хоосорсны
  // дараа /cart руу буцахгүй байх нөхцөл нь рендерийн үед зөв мэдрэгдэнэ
  const started = create.isPending || create.isSuccess || create.isError || intent !== null

  if (isLoading) return <Skeleton count={1} />
  if (isError && !started) return <ErrorState onRetry={refetch} />
  if (courses.length === 0 && !started) return <Navigate to="/cart" replace />

  const startPayment = () => {
    if (startedRef.current) return
    startedRef.current = true
    create.mutate(courses.map((c) => c.id))
  }

  const failed = status === 'failed'
  const errorMessage = create.isError
    ? isApiError(create.error)
      ? create.error.message
      : 'Төлбөр үүсгэж чадсангүй'
    : failed
      ? 'Төлбөр амжилтгүй боллоо. Дахин оролдоно уу.'
      : null

  const retry = () => {
    startedRef.current = false
    setIntent(null)
    create.reset()
  }

  return (
    <section className="mx-auto mt-4 max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-brand-900/5">
      <h1 className="mb-2 text-2xl font-bold">QPay-ээр төлөх</h1>
      <p className="mb-6 text-3xl font-extrabold text-brand-700">Нийт: {formatPrice(total)}</p>

      {intent && !failed && (
        <>
          <img
            src={intent.qr.image}
            alt="QPay QR код"
            className="mx-auto mb-4 h-52 w-52 rounded-2xl border-2 border-brand-200 bg-brand-50 p-2"
          />
          <p className="mb-2 text-sm text-slate-500">Банкны аппаараа QR кодыг уншуулж төлбөрөө төлнө үү.</p>
          <p role="status" className="mb-4 text-sm font-semibold text-brand-600">
            Төлбөрийг хүлээж байна...
          </p>
        </>
      )}

      {errorMessage && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {!intent && !errorMessage && (
        <Button className="w-full" onClick={startPayment} disabled={create.isPending}>
          {create.isPending ? 'QR үүсгэж байна...' : 'QPay-ээр төлөх'}
        </Button>
      )}

      {errorMessage && (
        <Button className="w-full" onClick={retry}>
          Дахин оролдох
        </Button>
      )}
    </section>
  )
}
