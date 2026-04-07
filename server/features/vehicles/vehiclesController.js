import { vehicles } from './vehiclesData.js'
import { drivers } from '../drivers/driversData.js'

const SORTABLE_FIELDS = ['licensePlate', 'make', 'model', 'year', 'driver', 'colour', 'range']
const SEARCH_FIELDS = ['licensePlate', 'make', 'model', 'year', 'driver']

export function getVehicleFilters(req, res) {
  const makes = [...new Set(vehicles.map(v => v.make))].sort()
  const years = [...new Set(vehicles.map(v => v.year))].sort((a, b) => a - b)
  const statuses = ['assigned', 'unassigned']
  res.json({ makes, years, statuses })
}

export function getVehicleById(req, res) {
  const id = parseInt(req.params.id, 10)
  const vehicle = vehicles.find(v => v.id === id)
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })
  const status = vehicle.driver === 'Unassigned' ? 'unassigned' : 'assigned'
  res.json({ ...vehicle, status })
}

export function updateVehicleAssignment(req, res) {
  const vehicleId = parseInt(req.params.id, 10)
  const { driverId } = req.body

  const vehicle = vehicles.find(v => v.id === vehicleId)
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })

  if (driverId) {
    if (vehicle.driver !== 'Unassigned') return res.status(400).json({ error: 'Vehicle is already assigned' })
    const driver = drivers.find(d => d.id === driverId)
    if (!driver) return res.status(404).json({ error: 'Driver not found' })
    if (driver.assignmentStatus === 'assigned') return res.status(400).json({ error: 'Driver is already assigned' })
    vehicle.driver = `${driver.firstName} ${driver.lastName}`
    driver.vehicleAssignment = vehicle
    driver.assignmentStatus = 'assigned'
    return res.json({ ...vehicle, status: 'assigned' })
  } else {
    if (vehicle.driver === 'Unassigned') return res.status(400).json({ error: 'Vehicle is already unassigned' })
    vehicle.driver = 'Unassigned'
    const driver = drivers.find(d => d.vehicleAssignment?.id === vehicleId)
    if (driver) { driver.vehicleAssignment = null; driver.assignmentStatus = 'unassigned' }
    return res.json({ ...vehicle, status: 'unassigned' })
  }
}

export function getVehicles(req, res) {
  const { sortBy = 'id', order = 'asc', search = '', make = '', year = '', status = '' } = req.query

  let result = vehicles.map(v => ({ ...v, status: v.driver === 'Unassigned' ? 'unassigned' : 'assigned' }))

  if (search) {
    const term = search.toLowerCase()
    result = result.filter(v =>
      SEARCH_FIELDS.some(field => String(v[field]).toLowerCase().includes(term))
    )
  }

  if (make)   result = result.filter(v => v.make === make)
  if (year)   result = result.filter(v => String(v.year) === year)
  if (status) result = result.filter(v => v.status === status)

  const field = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'id'
  const direction = order === 'desc' ? -1 : 1

  result.sort((a, b) => {
    if (a[field] < b[field]) return -1 * direction
    if (a[field] > b[field]) return 1 * direction
    return 0
  })

  res.json(result)
}
