import type { CourseFilter, Level } from '@/api/types'
import { levelLabel } from '@/lib/format'
import { useCategories } from './queries'

const fieldClass = 'rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'

const priceOptions = [
  { value: 50000, label: '50,000₮ хүртэл' },
  { value: 100000, label: '100,000₮ хүртэл' },
]

export function CatalogFilters({
  filter,
  onChange,
}: {
  filter: CourseFilter
  onChange: (key: keyof CourseFilter, value: string) => void
}) {
  const { data: categories = [] } = useCategories()

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-4">
      <input
        type="search"
        aria-label="Хайх"
        placeholder="Хичээл хайх..."
        className={fieldClass}
        value={filter.q ?? ''}
        onChange={(e) => onChange('q', e.target.value)}
      />
      <select aria-label="Ангилал" className={fieldClass} value={filter.category ?? ''} onChange={(e) => onChange('category', e.target.value)}>
        <option value="">Бүгд</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select aria-label="Түвшин" className={fieldClass} value={filter.level ?? ''} onChange={(e) => onChange('level', e.target.value)}>
        <option value="">Бүгд</option>
        {(Object.keys(levelLabel) as Level[]).map((l) => (
          <option key={l} value={l}>
            {levelLabel[l]}
          </option>
        ))}
      </select>
      <select aria-label="Үнэ" className={fieldClass} value={filter.maxPrice ?? ''} onChange={(e) => onChange('maxPrice', e.target.value)}>
        <option value="">Бүгд</option>
        {priceOptions.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  )
}
