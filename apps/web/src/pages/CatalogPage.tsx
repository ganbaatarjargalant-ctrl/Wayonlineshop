import { useSearchParams } from 'react-router'
import type { CourseFilter, Level } from '@/api/types'
import { CourseCard } from '@/components/CourseCard'
import { EmptyState, ErrorState, Skeleton } from '@/components/states'
import { CatalogFilters } from '@/features/catalog/CatalogFilters'
import { useCourses } from '@/features/catalog/queries'
import { levelLabel } from '@/lib/format'

function parseFilter(params: URLSearchParams): CourseFilter {
  const filter: CourseFilter = {}
  const q = params.get('q')
  const category = params.get('category')
  const level = params.get('level')
  const maxPrice = Number(params.get('maxPrice'))
  if (q) filter.q = q
  if (category) filter.category = category
  if (level && level in levelLabel) filter.level = level as Level
  if (params.get('maxPrice') && Number.isFinite(maxPrice) && maxPrice > 0) filter.maxPrice = maxPrice
  return filter
}

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const filter = parseFilter(params)
  const { data, isPending, isError, refetch } = useCourses(filter)

  const update = (key: keyof CourseFilter, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-extrabold">Хичээлүүд</h1>
      <CatalogFilters filter={filter} onChange={update} />
      {isPending ? (
        <Skeleton count={6} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState message="Хайлтад тохирох хичээл олдсонгүй" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </section>
  )
}
