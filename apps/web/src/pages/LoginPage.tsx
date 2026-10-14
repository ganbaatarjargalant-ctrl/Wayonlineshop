import { Link, useSearchParams } from 'react-router'
import { useApi } from '@/api/ApiProvider'
import { AuthForm } from '@/features/auth/AuthForm'
import { validateEmail, validatePassword } from '@/features/auth/validation'

export function LoginPage() {
  const api = useApi()
  const [params] = useSearchParams()
  const redirect = params.get('redirect')
  const registerHref = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'

  return (
    <AuthForm
      title="Нэвтрэх"
      submitLabel="Нэвтрэх"
      fields={[
        { name: 'email', label: 'Имэйл', type: 'email', autoComplete: 'email', validate: validateEmail },
        { name: 'password', label: 'Нууц үг', type: 'password', autoComplete: 'current-password', validate: validatePassword },
      ]}
      onSubmit={(v) => api.login({ email: v.email ?? '', password: v.password ?? '' })}
      footer={
        <>
          Бүртгэлгүй юу?{' '}
          <Link to={registerHref} className="text-indigo-600 hover:underline">
            Бүртгүүлэх
          </Link>
        </>
      }
    />
  )
}
