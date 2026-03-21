import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { VehiclesPage } from '../features/vehicles/pages/VehiclesPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/vehicles',
        element: <VehiclesPage />,
      },
    ],
  },
])
