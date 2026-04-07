import './PieChart.scss'

const SIZE = 100
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function PieChart({ assigned, total }) {
  const assignedOffset = total === 0 ? CIRCUMFERENCE : CIRCUMFERENCE - (assigned / total) * CIRCUMFERENCE

  return (
    <svg
      className="pie-chart"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <circle
        className="pie-chart__track"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
      />
      <circle
        className="pie-chart__segment"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        strokeDasharray={CIRCUMFERENCE}
        strokeLinecap="butt"
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        style={{ '--circumference': CIRCUMFERENCE, '--offset': assignedOffset }}
      />
    </svg>
  )
}
