import { vehicles } from '../vehicles/vehiclesData.js'
import { drivers } from '../drivers/driversData.js'

export function getAnalytics(req, res) {
  const assignedVehicles = vehicles.filter(v => v.driverId !== null).length
  const assignedDrivers = drivers.filter(d => d.vehicleId !== null).length
  res.json({
    totalVehicles: vehicles.length,
    assignedVehicles,
    unassignedVehicles: vehicles.length - assignedVehicles,
    totalDrivers: drivers.length,
    assignedDrivers,
    unassignedDrivers: drivers.length - assignedDrivers,
  })
}
