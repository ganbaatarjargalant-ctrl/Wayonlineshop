import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold">Хуудас олдсонгүй</h1>
      <Link to="/" className="text-indigo-600 hover:underline">
        Нүүр хуудас руу буцах
      </Link>
    </div>
  )
}
