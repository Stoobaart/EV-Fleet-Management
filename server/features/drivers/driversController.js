import { drivers } from './driversData.js'
import { vehicles } from '../vehicles/vehiclesData.js'

function projectDriver(d) {
  const { vehicleId, ...rest } = d
  const raw = vehicleId !== null ? (vehicles.find(v => v.id === vehicleId) ?? null) : null
  const vehicleAssignment = raw ? Object.fromEntries(Object.entries(raw).filter(([k]) => k !== 'driverId')) : null
  return { ...rest, assignmentStatus: vehicleId !== null ? 'assigned' : 'unassigned', vehicleAssignment }
}

export function getDrivers(req, res) {
  const { search = '', sortBy = '', order = 'asc', assignmentStatus = '' } = req.query

  let result = drivers

  if (assignmentStatus) {
    const assigned = assignmentStatus === 'assigned'
    result = result.filter(d => assigned ? d.vehicleId !== null : d.vehicleId === null)
  }

  if (search) {
    const q = search.toLowerCase()
    result = result.filter((d) => {
      const licensePlate = d.vehicleId !== null ? (vehicles.find(v => v.id === d.vehicleId)?.licensePlate ?? '') : ''
      const status = d.vehicleId !== null ? 'assigned' : 'unassigned'
      return (
        d.firstName.toLowerCase().includes(q) ||
        d.lastName.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        status.includes(q) ||
        licensePlate.toLowerCase().includes(q)
      )
    })
  }

  if (sortBy) {
    result = [...result].sort((a, b) => {
      let aVal = a[sortBy] ?? ''
      let bVal = b[sortBy] ?? ''
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
      return 0
    })
  }

  res.json(result.map(projectDriver))
}
