import { Link, NavLink, useNavigate } from 'react-router'
import { useAuthStore } from '@/features/auth/authStore'
import { useCartStore } from '@/features/cart/cartStore'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm ${isActive ? 'font-semibold text-indigo-600' : 'text-slate-700 hover:text-indigo-600'}`

export function Header() {
  const user = useAuthStore((s) => s.user)
  const clear = useAuthStore((s) => s.clear)
  const cartCount = useCartStore((s) => s.courseIds.length)
  const navigate = useNavigate()

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-indigo-700">
          Way Academy
        </Link>
        <nav className="flex flex-1 items-center gap-4">
          <NavLink to="/courses" className={navClass}>
            Хичээлүүд
          </NavLink>
          {user && (
            <NavLink to="/my-courses" className={navClass}>
              Миний хичээлүүд
            </NavLink>
          )}
        </nav>
        <Link to="/cart" aria-label="Сагс" className="relative text-sm text-slate-700 hover:text-indigo-600">
          🛒 <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">{cartCount}</span>
        </Link>
        {user ? (
          <button
            type="button"
            className="text-sm text-slate-700 hover:text-indigo-600"
            onClick={() => {
              clear()
              navigate('/')
            }}
          >
            Гарах
          </button>
        ) : (
          <Link to="/login" className="text-sm text-slate-700 hover:text-indigo-600">
            Нэвтрэх
          </Link>
        )}
      </div>
    </header>
  )
}
