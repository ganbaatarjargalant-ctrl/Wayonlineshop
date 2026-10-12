import type { RouteObject } from 'react-router'
import { Layout } from './Layout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [{ index: true, element: <h1>Нүүр</h1> }],
  },
]
