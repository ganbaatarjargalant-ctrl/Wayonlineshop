import { Outlet } from 'react-router'
import { Header } from '@/components/Header'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Way Academy
      </footer>
    </div>
  )
}
