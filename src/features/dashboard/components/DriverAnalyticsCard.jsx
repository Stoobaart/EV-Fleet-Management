import { StatCard } from '../../../shared/components/StatCard/StatCard'
import { PieChart } from '../../../shared/components/PieChart/PieChart'
import './DriverAnalyticsCard.scss'

export function DriverAnalyticsCard({ totalDrivers, assignedDrivers, unassignedDrivers }) {
  return (
    <StatCard>
      <div className="driver-analytics-card__content">
        <span className="driver-analytics-card__label">Total Drivers</span>
        <span className="driver-analytics-card__value">{totalDrivers}</span>
        <div className="driver-analytics-card__breakdown">
          <span className="driver-analytics-card__stat">
            <span className="driver-analytics-card__stat-value">{assignedDrivers}</span>
            <span className="driver-analytics-card__stat-label">Assigned</span>
          </span>
          <span className="driver-analytics-card__stat">
            <span className="driver-analytics-card__stat-value">{unassignedDrivers}</span>
            <span className="driver-analytics-card__stat-label">Unassigned</span>
          </span>
        </div>
      </div>
      <div className="driver-analytics-card__chart">
        <PieChart assigned={assignedDrivers} total={totalDrivers} />
      </div>
    </StatCard>
  )
}
