import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useApi } from '@/api/ApiProvider'
import { isApiError } from '@/api/errors'
import { Button } from '@/components/Button'
import { Skeleton } from '@/components/states'
import { useCartStore } from '@/features/cart/cartStore'
import { useCartCourses } from '@/features/cart/useCartCourses'
import { formatPrice } from '@/lib/format'

export function CheckoutPage() {
  const api = useApi()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const clearCart = useCartStore((s) => s.clear)
  const { courses, total, isLoading } = useCartCourses()
  // isPending нь хоёр хурдан даралтын хооронд шинэчлэгдэж амжихгүй байж болох тул ref-ээр хамгаална
  const submittingRef = useRef(false)
  const paidRef = useRef(false)

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

  if (isLoading) return <Skeleton count={1} />
  if (courses.length === 0 && !paidRef.current) return <Navigate to="/cart" replace />

  const handlePay = () => {
    if (submittingRef.current) return
    submittingRef.current = true
    pay.mutate(courses.map((c) => c.id))
  }

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <h1 className="mb-2 text-2xl font-bold">QPay-ээр төлөх</h1>
      <p className="mb-4 text-lg font-semibold">Нийт: {formatPrice(total)}</p>
      <div
        aria-label="QPay QR код"
        role="img"
        className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-lg bg-slate-200 text-sm text-slate-500"
      >
        QR код
      </div>
      <p className="mb-4 text-sm text-slate-500">Банкны аппаараа QR кодыг уншуулж төлбөрөө төлнө үү.</p>
      {pay.isError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {isApiError(pay.error) ? pay.error.message : 'Төлбөр амжилтгүй боллоо'}
        </p>
      )}
      <Button className="w-full" onClick={handlePay} disabled={pay.isPending}>
        {pay.isPending ? 'Шалгаж байна...' : 'Төлсөн'}
      </Button>
    </section>
  )
}
