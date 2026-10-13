import type { RouteObject } from 'react-router'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { Layout } from './Layout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <h1>Нүүр</h1> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
