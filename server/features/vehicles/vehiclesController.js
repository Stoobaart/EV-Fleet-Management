import { vehicles } from './vehiclesData.js'

const SORTABLE_FIELDS = ['licensePlate', 'make', 'model', 'year', 'driver', 'colour', 'range']

export function getVehicles(req, res) {
  const { sortBy = 'id', order = 'asc' } = req.query

  const field = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'id'
  const direction = order === 'desc' ? -1 : 1

  const sorted = [...vehicles].sort((a, b) => {
    if (a[field] < b[field]) return -1 * direction
    if (a[field] > b[field]) return 1 * direction
    return 0
  })

  res.json(sorted)
}
