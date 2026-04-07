import { StatCard } from '../../../shared/components/StatCard/StatCard'
import { PieChart } from '../../../shared/components/PieChart/PieChart'
import './VehicleAnalyticsCard.scss'

export function VehicleAnalyticsCard({ totalVehicles, assignedVehicles, unassignedVehicles }) {
  return (
    <StatCard>
      <div className="vehicle-analytics-card__content">
        <span className="vehicle-analytics-card__label">Total Vehicles</span>
        <span className="vehicle-analytics-card__value">{totalVehicles}</span>
        <div className="vehicle-analytics-card__breakdown">
          <span className="vehicle-analytics-card__stat">
            <span className="vehicle-analytics-card__stat-value">{assignedVehicles}</span>
            <span className="vehicle-analytics-card__stat-label">Assigned</span>
          </span>
          <span className="vehicle-analytics-card__stat">
            <span className="vehicle-analytics-card__stat-value">{unassignedVehicles}</span>
            <span className="vehicle-analytics-card__stat-label">Unassigned</span>
          </span>
        </div>
      </div>
      <div className="vehicle-analytics-card__chart">
        <PieChart assigned={assignedVehicles} total={totalVehicles} />
      </div>
    </StatCard>
  )
}
