import { useAnalytics } from '../api/useAnalytics'
import { VehicleAnalyticsCard } from '../components/VehicleAnalyticsCard'
import { DriverAnalyticsCard } from '../components/DriverAnalyticsCard'
import './DashboardPage.scss'

export function DashboardPage() {
  const { data, isPending } = useAnalytics()

  if (isPending) return (
    <main>
      <h1>Dashboard</h1>
      <div className="dashboard__cards">
        <div className="dashboard__card-skeleton" aria-hidden="true" />
        <div className="dashboard__card-skeleton" aria-hidden="true" />
      </div>
    </main>
  )
  if (data?.error) return <p>{data.error}</p>

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="dashboard__cards">
        <VehicleAnalyticsCard
          totalVehicles={data.totalVehicles}
          assignedVehicles={data.assignedVehicles}
          unassignedVehicles={data.unassignedVehicles}
        />
        <DriverAnalyticsCard
          totalDrivers={data.totalDrivers}
          assignedDrivers={data.assignedDrivers}
          unassignedDrivers={data.unassignedDrivers}
        />
      </div>
    </main>
  )
}
