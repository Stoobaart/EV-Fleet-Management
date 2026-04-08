import { vehicles } from './vehiclesData.js'
import { drivers } from '../drivers/driversData.js'

const SORTABLE_FIELDS = ['licensePlate', 'make', 'model', 'year', 'driver', 'colour', 'range']
const SEARCH_FIELDS = ['licensePlate', 'make', 'model', 'year', 'driver']

function project(vehicle) {
  const { driverId, ...rest } = vehicle
  const d = driverId !== null ? drivers.find(d => d.id === driverId) : null
  return { ...rest, driver: d ? `${d.firstName} ${d.lastName}` : 'Unassigned', status: d ? 'assigned' : 'unassigned' }
}

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
  res.json(project(vehicle))
}

export function updateVehicleAssignment(req, res) {
  const vehicleId = parseInt(req.params.id, 10)
  const { driverId } = req.body

  const vehicle = vehicles.find(v => v.id === vehicleId)
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' })

  if (driverId) {
    if (vehicle.driverId !== null) return res.status(400).json({ error: 'Vehicle is already assigned' })
    const driver = drivers.find(d => d.id === driverId)
    if (!driver) return res.status(404).json({ error: 'Driver not found' })
    if (driver.vehicleId !== null) return res.status(400).json({ error: 'Driver is already assigned' })
    vehicle.driverId = driverId
    driver.vehicleId = vehicleId
    return res.json(project(vehicle))
  } else {
    if (vehicle.driverId === null) return res.status(400).json({ error: 'Vehicle is already unassigned' })
    const driver = drivers.find(d => d.vehicleId === vehicleId)
    vehicle.driverId = null
    if (driver) driver.vehicleId = null
    return res.json(project(vehicle))
  }
}

export function getVehicles(req, res) {
  const { sortBy = 'id', order = 'asc', search = '', make = '', year = '', status = '', page = '1', limit = '200' } = req.query

  let result = vehicles.map(project)

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

  const total = result.length
  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.max(1, parseInt(limit, 10) || 200)
  const totalPages = Math.ceil(total / limitNum) || 1
  const start = (pageNum - 1) * limitNum
  const data = result.slice(start, start + limitNum)

  res.json({ data, total, page: pageNum, totalPages })
}
