import { Link, useSearchParams } from 'react-router'
import { useApi } from '@/api/ApiProvider'
import { AuthForm } from '@/features/auth/AuthForm'
import { validateEmail, validateName, validatePassword } from '@/features/auth/validation'

export function RegisterPage() {
  const api = useApi()
  const [params] = useSearchParams()
  const redirect = params.get('redirect')
  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'

  return (
    <AuthForm
      title="Бүртгүүлэх"
      submitLabel="Бүртгүүлэх"
      fields={[
        { name: 'name', label: 'Нэр', type: 'text', autoComplete: 'name', validate: validateName },
        { name: 'email', label: 'Имэйл', type: 'email', autoComplete: 'email', validate: validateEmail },
        { name: 'password', label: 'Нууц үг', type: 'password', autoComplete: 'new-password', validate: validatePassword },
      ]}
      onSubmit={(v) => api.register({ name: v.name ?? '', email: v.email ?? '', password: v.password ?? '' })}
      footer={
        <>
          Бүртгэлтэй юу?{' '}
          <Link to={loginHref} className="text-brand-600 hover:underline">
            Нэвтрэх хуудас руу
          </Link>
        </>
      }
    />
  )
}
