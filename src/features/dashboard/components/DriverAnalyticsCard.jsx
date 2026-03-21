import { StatCard } from '../../../shared/components/StatCard/StatCard'

export function DriverAnalyticsCard({ totalDrivers }) {
  return <StatCard label="Total Drivers" value={totalDrivers} />
}
