import type { RouteObject } from 'react-router'
import { CatalogPage } from '@/pages/CatalogPage'
import { CourseDetailPage } from '@/pages/CourseDetailPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { Layout } from './Layout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'courses', element: <CatalogPage /> },
      { path: 'courses/:slug', element: <CourseDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
