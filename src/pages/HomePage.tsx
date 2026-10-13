import { Link } from 'react-router'
import { buttonClass } from '@/components/Button'
import { CourseCard } from '@/components/CourseCard'
import { ErrorState, Skeleton } from '@/components/states'
import { useCategories, useCourses } from '@/features/catalog/queries'

export function HomePage() {
  const courses = useCourses({})
  const { data: categories = [] } = useCategories()

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-14 text-white">
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Way Academy — ур чадвараа өөрийн хэмнэлээр хөгжүүл</h1>
        <p className="mb-6 max-w-2xl text-indigo-100">
          Туршлагатай багш нарын бэлтгэсэн видео хичээлүүдийг хүссэн цагтаа, хүссэн газраасаа үзээрэй.
        </p>
        <Link to="/courses" className={`${buttonClass('secondary')} border-0`}>
          Хичээлүүдийг үзэх
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Ангиллууд</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c}
              to={`/courses?category=${encodeURIComponent(c)}`}
              className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm hover:border-indigo-500 hover:text-indigo-600"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Онцлох хичээлүүд</h2>
        {courses.isPending ? (
          <Skeleton count={4} />
        ) : courses.isError ? (
          <ErrorState onRetry={() => courses.refetch()} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {courses.data.slice(0, 4).map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
