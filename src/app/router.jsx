import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { VehiclesPage } from '../features/vehicles/pages/VehiclesPage'
import VehicleDetailPage from '../features/vehicles/pages/VehicleDetailPage'
import DriversPage from '../features/drivers/pages/DriversPage'

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
      {
        path: '/vehicles/:id',
        element: <VehicleDetailPage />,
      },
      {
        path: '/drivers',
        element: <DriversPage />,
      },
    ],
  },
])
