import type { Level } from '@/api/types'

export function formatPrice(n: number): string {
  return `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}₮`
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export const levelLabel: Record<Level, string> = {
  beginner: 'Анхан шат',
  intermediate: 'Дунд шат',
  advanced: 'Ахисан шат',
}
