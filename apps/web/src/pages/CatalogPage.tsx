import { useSearchParams } from 'react-router'
import type { CourseFilter, Level } from '@/api/types'
import { Button } from '@/components/Button'
import { CourseCard } from '@/components/CourseCard'
import { EmptyState, ErrorState, Skeleton } from '@/components/states'
import { CatalogFilters } from '@/features/catalog/CatalogFilters'
import { useCourses } from '@/features/catalog/queries'
import { levelLabel } from '@/lib/format'

const PAGE_SIZE = 6

function parseFilter(params: URLSearchParams): CourseFilter {
  const filter: CourseFilter = { limit: PAGE_SIZE }
  const q = params.get('q')
  const category = params.get('category')
  const level = params.get('level')
  const maxPrice = Number(params.get('maxPrice'))
  const page = Number(params.get('page'))
  if (q) filter.q = q
  if (category) filter.category = category
  if (level && level in levelLabel) filter.level = level as Level
  if (params.get('maxPrice') && Number.isFinite(maxPrice) && maxPrice > 0) filter.maxPrice = maxPrice
  filter.page = Number.isInteger(page) && page > 0 ? page : 1
  return filter
}

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const filter = parseFilter(params)
  const { data, isPending, isError, refetch } = useCourses(filter)

  /** Шүүлт солигдоход хуудсыг 1 болгож эхнээс харуулна */
  const update = (key: keyof CourseFilter, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  const goToPage = (page: number) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (page <= 1) next.delete('page')
        else next.set('page', String(page))
        return next
      },
      { replace: true },
    )
  }

  const page = filter.page ?? 1
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <section>
      <h1 className="mb-4 text-2xl font-extrabold">Хичээлүүд</h1>
      <CatalogFilters filter={filter} onChange={update} />
      {isPending ? (
        <Skeleton count={PAGE_SIZE} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState message="Хайлтад тохирох хичээл олдсонгүй" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
          {pageCount > 1 && (
            <nav aria-label="Хуудаслалт" className="mt-6 flex items-center justify-center gap-4">
              <Button variant="secondary" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                Өмнөх
              </Button>
              <span aria-live="polite" className="text-sm text-slate-600">
                Хуудас {page} / {pageCount}
              </span>
              <Button variant="secondary" onClick={() => goToPage(page + 1)} disabled={page >= pageCount}>
                Дараах
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
