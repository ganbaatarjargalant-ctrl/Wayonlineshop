import { Link } from 'react-router'
import { Button, buttonClass } from '@/components/Button'
import { CourseCard } from '@/components/CourseCard'
import { ErrorState, Skeleton } from '@/components/states'
import { useCartStore } from '@/features/cart/cartStore'
import { useCartCourses } from '@/features/cart/useCartCourses'
import { formatPrice } from '@/lib/format'

export function CartPage() {
  const { courses, total, isLoading, isError, refetch } = useCartCourses()
  const remove = useCartStore((s) => s.remove)

  if (isLoading) return <Skeleton count={2} />
  if (isError) return <ErrorState onRetry={refetch} />

  if (courses.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-lg text-slate-600">Таны сагс хоосон байна</p>
        <Link to="/courses" className={buttonClass()}>
          Хичээлүүдийг үзэх
        </Link>
      </div>
    )
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-extrabold">Сагс</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            footer={
              <div className="flex items-center justify-between">
                <span className="font-bold">{formatPrice(c.price)}</span>
                <Button variant="secondary" onClick={() => remove(c.id)}>
                  Хасах
                </Button>
              </div>
            }
          />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-end gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xl font-extrabold">Нийт: {formatPrice(total)}</p>
        <Link to="/checkout" className={buttonClass()}>
          Төлбөр төлөх
        </Link>
      </div>
    </section>
  )
}
