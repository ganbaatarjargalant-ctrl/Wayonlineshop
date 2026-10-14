import { Button } from './Button'

export function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Ачаалж байна">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="mb-3 font-medium text-red-700">Алдаа гарлаа</p>
      <Button variant="secondary" onClick={onRetry}>
        Дахин оролдох
      </Button>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">{message}</p>
}
