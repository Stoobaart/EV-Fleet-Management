import { jest } from '@jest/globals'

jest.mock('../vehiclesData.js', () => ({
  vehicles: [
    { id: 1,   licensePlate: 'EV-001', make: 'Tesla', model: 'Model 3', year: 2023, driverId: 1,    colour: 'White', range: 358 },
    { id: 101, licensePlate: 'EV-101', make: 'Tesla', model: 'Model S', year: 2024, driverId: null, colour: 'White', range: 412 },
  ],
}))

jest.mock('../../drivers/driversData.js', () => ({
  drivers: [
    { id: 1,   firstName: 'James', lastName: 'Okafor', email: 'j.okafor@evfleet.io', vehicleId: 1    },
    { id: 2,   firstName: 'Priya', lastName: 'Nair',   email: 'p.nair@evfleet.io',   vehicleId: 2    },
    { id: 200, firstName: 'Free',  lastName: 'Driver', email: 'free@evfleet.io',      vehicleId: null },
  ],
}))

import { vehicles } from '../vehiclesData.js'
import { drivers } from '../../drivers/driversData.js'
import { updateVehicleAssignment } from '../vehiclesController.js'

const resetVehicles = [
  { id: 1,   licensePlate: 'EV-001', make: 'Tesla', model: 'Model 3', year: 2023, driverId: 1,    colour: 'White', range: 358 },
  { id: 101, licensePlate: 'EV-101', make: 'Tesla', model: 'Model S', year: 2024, driverId: null, colour: 'White', range: 412 },
]
const resetDrivers = [
  { id: 1,   firstName: 'James', lastName: 'Okafor', email: 'j.okafor@evfleet.io', vehicleId: 1    },
  { id: 2,   firstName: 'Priya', lastName: 'Nair',   email: 'p.nair@evfleet.io',   vehicleId: 2    },
  { id: 200, firstName: 'Free',  lastName: 'Driver', email: 'free@evfleet.io',      vehicleId: null },
]

beforeEach(() => {
  vehicles.length = 0
  vehicles.push(...resetVehicles.map(v => ({ ...v })))
  drivers.length = 0
  drivers.push(...resetDrivers.map(d => ({ ...d })))
})

function makeReq(params, body = {}) {
  return { params, body }
}

function makeRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('updateVehicleAssignment', () => {
  describe('assign', () => {
    test('successfully assigns an unassigned vehicle to an unassigned driver', () => {
      const req = makeReq({ id: '101' }, { driverId: 200 })
      const res = makeRes()

      updateVehicleAssignment(req, res)

      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 101,
        driver: 'Free Driver',
        status: 'assigned',
      }))
      expect(vehicles.find(v => v.id === 101).driverId).toBe(200)
      expect(drivers.find(d => d.id === 200).vehicleId).toBe(101)
    })

    test('returns 404 when vehicle is not found', () => {
      const req = makeReq({ id: '999' }, { driverId: 200 })
      const res = makeRes()

      updateVehicleAssignment(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Vehicle not found' })
    })

    test('returns 404 when driver is not found', () => {
      const req = makeReq({ id: '101' }, { driverId: 999 })
      const res = makeRes()

      updateVehicleAssignment(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Driver not found' })
    })

    test('returns 400 when vehicle is already assigned', () => {
      const req = makeReq({ id: '1' }, { driverId: 200 })
      const res = makeRes()

      updateVehicleAssignment(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Vehicle is already assigned' })
    })

    test('returns 400 when driver is already assigned', () => {
      const req = makeReq({ id: '101' }, { driverId: 2 })
      const res = makeRes()

      updateVehicleAssignment(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Driver is already assigned' })
    })
  })

  describe('unassign', () => {
    test('successfully unassigns an assigned vehicle', () => {
      const req = makeReq({ id: '1' }, {})
      const res = makeRes()

      updateVehicleAssignment(req, res)

      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        driver: 'Unassigned',
        status: 'unassigned',
      }))
      expect(vehicles.find(v => v.id === 1).driverId).toBeNull()
      expect(drivers.find(d => d.id === 1).vehicleId).toBeNull()
    })

    test('returns 400 when vehicle is already unassigned', () => {
      const req = makeReq({ id: '101' }, {})
      const res = makeRes()

      updateVehicleAssignment(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Vehicle is already unassigned' })
    })
  })
})
