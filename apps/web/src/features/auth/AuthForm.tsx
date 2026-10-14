import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import type { AuthResult } from '@/api/client'
import { isApiError } from '@/api/errors'
import { Button } from '@/components/Button'
import { useAuthStore } from './authStore'
import { safeRedirect } from './safeRedirect'

export interface FieldDef {
  name: string
  label: string
  type: string
  autoComplete: string
  validate: (v: string) => string | null
}

/** Нэвтрэх, бүртгүүлэх формын нийтлэг хэсэг: баталгаажуулалт, API алдаа, redirect */
export function AuthForm({
  title,
  submitLabel,
  fields,
  onSubmit,
  footer,
}: {
  title: string
  submitLabel: string
  fields: FieldDef[]
  onSubmit: (values: Record<string, string>) => Promise<AuthResult>
  footer: ReactNode
}) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.name, ''])))
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = Object.fromEntries(fields.map((f) => [f.name, f.validate(values[f.name] ?? '')]))
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    setApiError(null)
    setSubmitting(true)
    try {
      const { user, token } = await onSubmit(values)
      setSession(user, token)
      navigate(safeRedirect(params.get('redirect')), { replace: true })
    } catch (err) {
      setApiError(isApiError(err) ? err.message : 'Алдаа гарлаа')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      {apiError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiError}
        </p>
      )}
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="mb-1 block text-sm font-medium">
              {f.label}
            </label>
            <input
              id={f.name}
              type={f.type}
              autoComplete={f.autoComplete}
              value={values[f.name]}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              aria-invalid={!!errors[f.name]}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors[f.name] && <p className="mt-1 text-sm text-red-600">{errors[f.name]}</p>}
          </div>
        ))}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitLabel}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-slate-600">{footer}</div>
    </div>
  )
}
