import { useAnalytics } from '../api/useAnalytics'
import { VehicleAnalyticsCard } from '../components/VehicleAnalyticsCard'
import { DriverAnalyticsCard } from '../components/DriverAnalyticsCard'

export function DashboardPage() {
  const { data, isPending } = useAnalytics()

  if (isPending) return <p>Loading...</p>
  if (data?.error) return <p>{data.error}</p>

  return (
    <main>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', gap: '16px' }}>
        <VehicleAnalyticsCard totalVehicles={data.totalVehicles} />
        <DriverAnalyticsCard totalDrivers={data.totalDrivers} />
      </div>
    </main>
  )
}
