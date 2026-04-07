import { drivers } from './driversData.js'

export function getDrivers(req, res) {
  const { search = '', sortBy = '', order = 'asc', assignmentStatus = '' } = req.query

  let result = drivers

  if (assignmentStatus) {
    result = result.filter((d) => d.assignmentStatus === assignmentStatus)
  }

  if (search) {
    const q = search.toLowerCase()
    result = result.filter((d) =>
      d.firstName.toLowerCase().includes(q) ||
      d.lastName.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.assignmentStatus.toLowerCase().includes(q) ||
      (d.vehicleAssignment?.licensePlate ?? '').toLowerCase().includes(q)
    )
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

  res.json(result)
}
